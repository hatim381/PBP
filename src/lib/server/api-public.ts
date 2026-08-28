import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { nextMatchForTeam, opponentId } from "@/lib/court-board";
import { planCompetition } from "@/lib/engine/pools";
import { playersPerTeam, type TeamFormat } from "@/lib/engine/types";
import { asPgTextArray } from "@/lib/utils";
import { mapPlayer, mapTournament, type PlayerRow, type TournamentRow } from "./mappers";
import { countValidatedTeams, findOrCreatePlayer, loadSnapshot, loadTournament, nextTeamNumber } from "./queries";
import { ensureSeed } from "./seed";
import type { Player } from "./types";

const EMPTY_DASH = {
  activeTournaments: 0,
  validatedTeams: 0,
  matchesDone: 0,
  matchesLive: 0,
  courts: 0,
};

async function safePublic<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    await ensureSeed();
    return await fn();
  } catch (err) {
    console.error(`[pbp] ${label} failed`, err);
    return fallback;
  }
}

export const listTournaments = createServerFn({ method: "GET" }).handler(async () => {
  return safePublic("listTournaments", async () => {
    const sql = await getSql();
    const rows = await sql<TournamentRow>`
      select * from tournaments
      order by
        case status
          when 'in_progress' then 0
          when 'drawn' then 1
          when 'draw_pending' then 2
          when 'registrations_open' then 3
          when 'registrations_closed' then 4
          when 'draft' then 5
          when 'finished' then 6
          else 7
        end,
        date desc nulls last
    `;
    const counts = await sql<{ tournament_id: string; n: number; validated: number }>`
      select tournament_id,
             count(*)::int as n,
             count(*) filter (where status = 'validated')::int as validated
      from teams
      group by tournament_id
    `;
    const byT = new Map(counts.map((c) => [c.tournament_id, c]));
    const matchCounts = await sql<{ tournament_id: string; done: number; live: number; total: number }>`
      select tournament_id,
             count(*)::int as total,
             count(*) filter (where status in ('finished','validated'))::int as done,
             count(*) filter (where status = 'live')::int as live
      from matches
      group by tournament_id
    `;
    const byM = new Map(matchCounts.map((c) => [c.tournament_id, c]));
    return rows.map((r) => {
      const t = mapTournament(r);
      const c = byT.get(t.id);
      const m = byM.get(t.id);
      return {
        ...t,
        teamCount: c?.n ?? 0,
        validatedCount: c?.validated ?? 0,
        matchCount: m?.total ?? 0,
        matchesDone: m?.done ?? 0,
        matchesLive: m?.live ?? 0,
      };
    });
  }, []);
});

export const getTournamentPublic = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return safePublic("getTournamentPublic", () => loadSnapshot(data.id), null);
  });

export const listPlayersPublic = createServerFn({ method: "GET" })
  .validator((data: { q?: string } = {}) => data)
  .handler(async ({ data }) => {
    return safePublic("listPlayersPublic", async () => {
      const sql = await getSql();
      const q = (data.q ?? "").trim();
      const rows = q
        ? await sql<PlayerRow>`
            select * from players
            where status = 'active'
              and (
                first_name ilike ${"%" + q + "%"}
                or last_name ilike ${"%" + q + "%"}
                or club ilike ${"%" + q + "%"}
                or coalesce(phone,'') ilike ${"%" + q + "%"}
                or coalesce(license_number,'') ilike ${"%" + q + "%"}
              )
            order by last_name, first_name
            limit 80
          `
        : await sql<PlayerRow>`
            select * from players
            where status = 'active'
            order by last_name, first_name
            limit 80
          `;
      return rows.map((r) => mapPlayer(r, true));
    }, []);
  });

export const dashboardPublic = createServerFn({ method: "GET" }).handler(async () => {
  return safePublic("dashboardPublic", async () => {
    const sql = await getSql();
    const live = await sql<{ n: number }>`
      select count(*)::int as n from tournaments where status in ('in_progress','drawn')
    `;
    const teams = await sql<{ n: number }>`
      select count(*)::int as n from teams where status = 'validated'
    `;
    const done = await sql<{ n: number }>`
      select count(*)::int as n from matches where status in ('finished','validated')
    `;
    const liveMatches = await sql<{ n: number }>`
      select count(*)::int as n from matches where status = 'live'
    `;
    const courts = await sql<{ n: number }>`
      select coalesce(sum(court_count),0)::int as n from tournaments
      where status in ('in_progress','drawn','draw_pending')
    `;
    return {
      activeTournaments: live[0]?.n ?? 0,
      validatedTeams: teams[0]?.n ?? 0,
      matchesDone: done[0]?.n ?? 0,
      matchesLive: liveMatches[0]?.n ?? 0,
      courts: courts[0]?.n ?? 0,
    };
  }, EMPTY_DASH);
});

export const previewPoolPlan = createServerFn({ method: "GET" })
  .validator((data: { teamCount: number; groupSize: number; qualifiedPerGroup: number; teamFormat: TeamFormat }) => data)
  .handler(async ({ data }) => {
    return planCompetition({
      teamCount: data.teamCount,
      teamFormat: data.teamFormat,
      competitionFormat: "groups_then_knockout",
      groupSize: data.groupSize,
      qualifiedPerGroup: data.qualifiedPerGroup,
    });
  });

export const playerStats = createServerFn({ method: "GET" })
  .validator((data: { playerId: string }) => data)
  .handler(async ({ data }) => {
    return safePublic("playerStats", async () => {
      const sql = await getSql();
      const playerRows = await sql<PlayerRow>`select * from players where id = ${data.playerId} limit 1`;
      const player = playerRows[0] ? mapPlayer(playerRows[0], true) : null;
      if (!player) return null;
      const teams = await sql<{ team_id: string; tournament_id: string; tournament_name: string; status: string }>`
        select t.id as team_id, t.tournament_id, tr.name as tournament_name, tr.status
        from team_players tp
        join teams t on t.id = tp.team_id
        join tournaments tr on tr.id = t.tournament_id
        where tp.player_id = ${data.playerId}
      `;
      const teamIds = teams.map((t) => t.team_id);
      let wins = 0;
      let losses = 0;
      if (teamIds.length) {
        const arr = asPgTextArray(teamIds);
        const matches = await sql<{ winner_id: string | null; team1_id: string | null; team2_id: string | null; status: string }>`
          select winner_id, team1_id, team2_id, status from matches
          where status in ('finished','validated')
            and (team1_id = any(${arr}::text[]) or team2_id = any(${arr}::text[]))
        `;
        for (const m of matches) {
          const mine = teamIds.includes(m.team1_id ?? "") || teamIds.includes(m.team2_id ?? "");
          if (!mine) continue;
          if (m.winner_id && teamIds.includes(m.winner_id)) wins += 1;
          else losses += 1;
        }
      }
      return {
        player,
        tournaments: teams.length,
        wins,
        losses,
        history: teams,
      };
    }, null);
  });

export type PublicPlayer = Player;

export type ListedTournament = import("./types").Tournament & {
  teamCount: number;
  validatedCount: number;
  matchCount: number;
  matchesDone: number;
  matchesLive: number;
};

export const registerTeamPublic = createServerFn({ method: "POST" })
  .validator((data: {
    tournamentId: string;
    teamName: string;
    players: { firstName: string; lastName: string; phone?: string }[];
  }) => data)
  .handler(async ({ data }) => {
    await ensureSeed();
    const t = await loadTournament(data.tournamentId);
    if (!t) throw new Error("Concours introuvable.");
    if (t.status !== "registrations_open") {
      throw new Error("Les inscriptions de ce concours sont fermées.");
    }
    const needed = playersPerTeam(t.teamFormat);
    if (data.players.length !== needed) {
      throw new Error(`Ce concours est en ${needed === 1 ? "tête-à-tête" : needed === 2 ? "doublette" : "triplette"} : ${needed} joueur${needed > 1 ? "s" : ""} requis.`);
    }
    for (const p of data.players) {
      if (!p.firstName.trim() || !p.lastName.trim()) {
        throw new Error("Chaque joueur doit avoir un prénom et un nom.");
      }
    }
    if (!data.players[0]?.phone?.trim()) {
      throw new Error("Un numéro de téléphone est obligatoire pour l'équipe.");
    }
    const playerIds: string[] = [];
    for (const p of data.players) {
      playerIds.push(await findOrCreatePlayer(p));
    }
    if (new Set(playerIds).size !== playerIds.length) {
      throw new Error("Un joueur ne peut pas apparaître deux fois dans la même équipe.");
    }
    const sql = await getSql();
    const dup = await sql<{ player_id: string }>`
      select tp.player_id
      from team_players tp
      join teams te on te.id = tp.team_id
      where te.tournament_id = ${data.tournamentId}
        and te.status <> 'cancelled'
        and tp.player_id = any(${asPgTextArray(playerIds)}::text[])
    `;
    if (dup.length) {
      throw new Error("Un des joueurs est déjà inscrit à ce concours.");
    }
    const validated = await countValidatedTeams(data.tournamentId);
    const status = validated >= t.maxTeams ? "waitlist" : "pending";
    const id = crypto.randomUUID();
    const number = await nextTeamNumber(data.tournamentId);
    const name = data.teamName.trim() || `Équipe ${number}`;
    await sql`
      insert into teams (id, tournament_id, name, number, status)
      values (${id}, ${data.tournamentId}, ${name}, ${number}, ${status})
    `;
    for (let i = 0; i < playerIds.length; i += 1) {
      await sql`
        insert into team_players (team_id, player_id, position)
        values (${id}, ${playerIds[i]!}, ${i + 1})
      `;
    }
    return { id, number, name, status };
  });

export const lookupMyTeam = createServerFn({ method: "GET" })
  .validator((data: { tournamentId: string; query: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeed();
    const q = data.query.trim();
    if (!q) return null;
    const snap = await loadSnapshot(data.tournamentId);
    if (!snap) return null;
    const asNum = Number(q);
    const team =
      Number.isFinite(asNum) && asNum > 0
        ? snap.teams.find((t) => t.number === asNum)
        : snap.teams.find((t) => {
            const blob = `${t.name} ${t.players.map((p) => `${p.firstName} ${p.lastName}`).join(" ")}`.toLowerCase();
            return blob.includes(q.toLowerCase());
          });
    if (!team) return null;
    const pool = snap.pools.find((p) => p.teamIds.includes(team.id));
    const standing = pool ? (snap.standings[pool.id] ?? []).find((s) => s.teamId === team.id) : null;
    const next = nextMatchForTeam(snap.matches, team.id);
    const court = next ? snap.courts.find((c) => c.id === next.courtId) : null;
    const opp = next ? opponentId(next, team.id) : null;
    return {
      team,
      poolLetter: pool?.letter ?? null,
      standing,
      nextMatch: next,
      opponent: opp ? snap.teams.find((x) => x.id === opp) ?? null : null,
      courtName: court?.name ?? null,
    };
  });

export const annualRanking = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    first_name: string;
    last_name: string;
    club: string | null;
    tournaments: number;
    wins: number;
    losses: number;
    podiums: number;
  }>`
    select
      p.id,
      p.first_name,
      p.last_name,
      p.club,
      count(distinct te.tournament_id)::int as tournaments,
      count(*) filter (
        where m.status in ('finished','validated') and m.winner_id = te.id
      )::int as wins,
      count(*) filter (
        where m.status in ('finished','validated')
          and m.winner_id is not null
          and m.winner_id <> te.id
          and (m.team1_id = te.id or m.team2_id = te.id)
      )::int as losses,
      count(distinct tr.id) filter (where tr.winner_team_id = te.id)::int as podiums
    from players p
    join team_players tp on tp.player_id = p.id
    join teams te on te.id = tp.team_id
    join tournaments tr on tr.id = te.tournament_id
    left join matches m on m.tournament_id = te.tournament_id
      and (m.team1_id = te.id or m.team2_id = te.id)
    where p.status = 'active'
    group by p.id, p.first_name, p.last_name, p.club
    having count(distinct te.tournament_id) > 0
    order by
      count(distinct tr.id) filter (where tr.winner_team_id = te.id) desc,
      count(*) filter (where m.status in ('finished','validated') and m.winner_id = te.id) desc,
      p.last_name
    limit 40
  `;
  return rows.map((r, i) => ({
    rank: i + 1,
    playerId: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    club: r.club,
    tournaments: Number(r.tournaments),
    wins: Number(r.wins),
    losses: Number(r.losses),
    podiums: Number(r.podiums),
  }));
});

export type AnnualRankingRow = Awaited<ReturnType<typeof annualRanking>>[number];
