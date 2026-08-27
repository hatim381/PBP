import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { planCompetition } from "@/lib/engine/pools";
import type { TeamFormat } from "@/lib/engine/types";
import { asPgTextArray } from "@/lib/utils";
import { mapPlayer, mapTournament, type PlayerRow, type TournamentRow } from "./mappers";
import { loadSnapshot } from "./queries";
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
