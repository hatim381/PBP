import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { buildKnockout } from "@/lib/engine/bracket";
import { distributeTeams, proposePoolConfigs } from "@/lib/engine/pools";
import { roundRobinPairs, validateScores } from "@/lib/engine/matches";
import { poolLetters, shuffle } from "@/lib/engine/rng";
import {
  playersPerTeam,
  type RankingCriterion,
  type TeamFormat,
  type TournamentStatus,
} from "@/lib/engine/types";
import { ensureMember, requireStaff, writeAudit } from "./authz";
import { mapPlayer, mapTournament, type PlayerRow, type TournamentRow } from "./mappers";
import { loadSnapshot, loadTeams, loadTournament, nextTeamNumber } from "./queries";
import { ensureSeed } from "./seed";
import type { QualifiedTeam } from "@/lib/engine/types";

async function staff(userId: string) {
  await ensureSeed();
  return requireStaff(userId);
}

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureSeed();
    return ensureMember(context.userId);
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const me = await staff(context.userId);
    const sql = await getSql();
    const rows = await sql<{ user_id: string; role: string; display_name: string | null; email: string | null; created_at: string }>`
      select user_id, role, display_name, email, created_at from club_members order by created_at
    `;
    return { me, members: rows };
  });

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { userId: string; role: "admin" | "organizer" | "player" }) => data)
  .handler(async ({ context, data }) => {
    const me = await staff(context.userId);
    if (me.role !== "admin") throw new Error("Seul un administrateur peut modifier les rôles.");
    const sql = await getSql();
    await sql`update club_members set role = ${data.role} where user_id = ${data.userId}`;
    await writeAudit(context.userId, "set_role", "club_members", data.userId, data);
    return { ok: true };
  });

export const listPlayersStaff = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { q?: string } = {}) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const sql = await getSql();
    const q = (data.q ?? "").trim();
    const rows = q
      ? await sql<PlayerRow>`
          select * from players
          where first_name ilike ${"%" + q + "%"}
             or last_name ilike ${"%" + q + "%"}
             or coalesce(phone,'') ilike ${"%" + q + "%"}
             or coalesce(license_number,'') ilike ${"%" + q + "%"}
             or coalesce(club,'') ilike ${"%" + q + "%"}
          order by last_name, first_name
          limit 120
        `
      : await sql<PlayerRow>`
          select * from players order by last_name, first_name limit 120
        `;
    return rows.map((r) => mapPlayer(r, false));
  });

export const upsertPlayer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    id?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    licenseNumber?: string;
    club?: string;
  }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const sql = await getSql();
    const id = data.id ?? crypto.randomUUID();
    if (data.id) {
      await sql`
        update players set
          first_name = ${data.firstName.trim()},
          last_name = ${data.lastName.trim()},
          phone = ${data.phone?.trim() || null},
          email = ${data.email?.trim() || null},
          license_number = ${data.licenseNumber?.trim() || null},
          club = ${data.club?.trim() || null}
        where id = ${id}
      `;
    } else {
      await sql`
        insert into players (id, first_name, last_name, phone, email, license_number, club)
        values (
          ${id},
          ${data.firstName.trim()},
          ${data.lastName.trim()},
          ${data.phone?.trim() || null},
          ${data.email?.trim() || null},
          ${data.licenseNumber?.trim() || null},
          ${data.club?.trim() || null}
        )
      `;
    }
    await writeAudit(context.userId, data.id ? "update_player" : "create_player", "players", id);
    const rows = await sql<PlayerRow>`select * from players where id = ${id}`;
    return mapPlayer(rows[0]!, false);
  });

export const createTournament = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    name: string;
    description?: string;
    date?: string;
    startTime?: string;
    venueName?: string;
    address?: string;
    courtCount: number;
    maxTeams: number;
    teamFormat: TeamFormat;
    groupSize: number;
    qualifiedPerGroup: number;
    targetPoints?: number;
    rankingCriteria?: RankingCriterion[];
    rules?: string;
  }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    if (!data.name.trim()) throw new Error("Le nom du concours est obligatoire.");
    const sql = await getSql();
    const id = crypto.randomUUID();
    const criteria = JSON.stringify(data.rankingCriteria ?? ["wins", "head_to_head", "point_diff", "points_for"]);
    await sql`
      insert into tournaments (
        id, name, description, date, start_time, venue_name, address,
        court_count, max_teams, team_format, group_size, qualified_per_group,
        target_points, ranking_criteria, status, rules, created_by
      ) values (
        ${id}, ${data.name.trim()}, ${data.description?.trim() || null},
        ${data.date || null}, ${data.startTime || null},
        ${data.venueName?.trim() || null}, ${data.address?.trim() || null},
        ${data.courtCount}, ${data.maxTeams}, ${data.teamFormat},
        ${data.groupSize}, ${data.qualifiedPerGroup},
        ${data.targetPoints ?? 13}, ${criteria}, 'draft',
        ${data.rules?.trim() || null}, ${context.userId}
      )
    `;
    for (let i = 1; i <= data.courtCount; i += 1) {
      await sql`
        insert into courts (id, tournament_id, name, number)
        values (${crypto.randomUUID()}, ${id}, ${`Terrain ${i}`}, ${i})
      `;
    }
    await writeAudit(context.userId, "create_tournament", "tournaments", id);
    return loadTournament(id);
  });

export const updateTournament = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    id: string;
    name: string;
    description?: string;
    date?: string;
    startTime?: string;
    venueName?: string;
    address?: string;
    courtCount: number;
    maxTeams: number;
    teamFormat: TeamFormat;
    groupSize: number;
    qualifiedPerGroup: number;
    targetPoints: number;
    rankingCriteria: RankingCriterion[];
    rules?: string;
  }) => data)
  .handler(async ({ context, data }) => {
    const me = await staff(context.userId);
    const current = await loadTournament(data.id);
    if (!current) throw new Error("Concours introuvable.");
    if (current.status !== "draft" && current.status !== "registrations_open" && me.role !== "admin") {
      throw new Error("Les paramètres critiques ne peuvent plus être modifiés.");
    }
    const sql = await getSql();
    await sql`
      update tournaments set
        name = ${data.name.trim()},
        description = ${data.description?.trim() || null},
        date = ${data.date || null},
        start_time = ${data.startTime || null},
        venue_name = ${data.venueName?.trim() || null},
        address = ${data.address?.trim() || null},
        court_count = ${data.courtCount},
        max_teams = ${data.maxTeams},
        team_format = ${data.teamFormat},
        group_size = ${data.groupSize},
        qualified_per_group = ${data.qualifiedPerGroup},
        target_points = ${data.targetPoints},
        ranking_criteria = ${JSON.stringify(data.rankingCriteria)},
        rules = ${data.rules?.trim() || null},
        updated_at = now()
      where id = ${data.id}
    `;
    await writeAudit(context.userId, "update_tournament", "tournaments", data.id);
    return loadTournament(data.id);
  });

export const setTournamentStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string; status: TournamentStatus }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const sql = await getSql();
    await sql`
      update tournaments set status = ${data.status}, updated_at = now() where id = ${data.id}
    `;
    await writeAudit(context.userId, "set_status", "tournaments", data.id, { status: data.status });
    return loadTournament(data.id);
  });

export const deleteTournament = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const me = await staff(context.userId);
    if (me.role !== "admin") throw new Error("Seul un administrateur peut supprimer un concours.");
    const sql = await getSql();
    await sql`delete from tournaments where id = ${data.id}`;
    await writeAudit(context.userId, "delete_tournament", "tournaments", data.id);
    return { ok: true };
  });

export const createTeam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { tournamentId: string; name: string; playerIds: string[]; status?: "pending" | "validated" }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const t = await loadTournament(data.tournamentId);
    if (!t) throw new Error("Concours introuvable.");
    const needed = playersPerTeam(t.teamFormat);
    if (data.playerIds.length !== needed) {
      throw new Error(`Une équipe ${t.teamFormat === "doublette" ? "doublette" : t.teamFormat === "triplette" ? "triplette" : "tête-à-tête"} doit compter exactement ${needed} joueur${needed > 1 ? "s" : ""}.`);
    }
    if (new Set(data.playerIds).size !== data.playerIds.length) {
      throw new Error("Un joueur ne peut pas apparaître deux fois dans la même équipe.");
    }
    const sql = await getSql();
    const dup = await sql<{ player_id: string }>`
      select tp.player_id
      from team_players tp
      join teams te on te.id = tp.team_id
      where te.tournament_id = ${data.tournamentId}
        and te.status <> 'cancelled'
        and tp.player_id = any(${data.playerIds}::text[])
    `;
    if (dup.length) {
      throw new Error("Un des joueurs est déjà inscrit à ce concours.");
    }
    const validated = await sql<{ n: number }>`
      select count(*)::int as n from teams
      where tournament_id = ${data.tournamentId} and status = 'validated'
    `;
    if ((validated[0]?.n ?? 0) >= t.maxTeams && data.status === "validated") {
      throw new Error("Le nombre maximum d'équipes est atteint.");
    }
    const id = crypto.randomUUID();
    const number = await nextTeamNumber(data.tournamentId);
    await sql`
      insert into teams (id, tournament_id, name, number, status)
      values (${id}, ${data.tournamentId}, ${data.name.trim() || `Équipe ${number}`}, ${number}, ${data.status ?? "pending"})
    `;
    for (let i = 0; i < data.playerIds.length; i += 1) {
      await sql`
        insert into team_players (team_id, player_id, position)
        values (${id}, ${data.playerIds[i]!}, ${i + 1})
      `;
    }
    await writeAudit(context.userId, "create_team", "teams", id);
    return { id };
  });

export const updateTeam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { teamId: string; name?: string; playerIds?: string[]; status?: "pending" | "validated" | "refused" | "cancelled" }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const sql = await getSql();
    const team = await sql<{ id: string; tournament_id: string; name: string }>`
      select id, tournament_id, name from teams where id = ${data.teamId} limit 1
    `;
    if (!team[0]) throw new Error("Équipe introuvable.");
    const t = await loadTournament(team[0].tournament_id);
    if (!t) throw new Error("Concours introuvable.");
    if (data.name != null) {
      await sql`update teams set name = ${data.name.trim()} where id = ${data.teamId}`;
    }
    if (data.status) {
      await sql`update teams set status = ${data.status} where id = ${data.teamId}`;
    }
    if (data.playerIds) {
      const needed = playersPerTeam(t.teamFormat);
      if (data.playerIds.length !== needed) {
        throw new Error(`L'équipe doit compter exactement ${needed} joueur${needed > 1 ? "s" : ""}.`);
      }
      await sql`delete from team_players where team_id = ${data.teamId}`;
      for (let i = 0; i < data.playerIds.length; i += 1) {
        await sql`
          insert into team_players (team_id, player_id, position)
          values (${data.teamId}, ${data.playerIds[i]!}, ${i + 1})
        `;
      }
    }
    await writeAudit(context.userId, "update_team", "teams", data.teamId, data);
    return { ok: true };
  });

export const deleteTeam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { teamId: string }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const sql = await getSql();
    await sql`delete from teams where id = ${data.teamId}`;
    await writeAudit(context.userId, "delete_team", "teams", data.teamId);
    return { ok: true };
  });

export const previewDraw = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { tournamentId: string; sizes: number[] }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const t = await loadTournament(data.tournamentId);
    if (!t) throw new Error("Concours introuvable.");
    const teams = (await loadTeams(data.tournamentId)).filter((x) => x.status === "validated");
    const total = data.sizes.reduce((a, b) => a + b, 0);
    if (teams.length !== total) {
      throw new Error(`Cette répartition couvre ${total} équipes, ${teams.length} sont validées.`);
    }
    const shuffled = shuffle(teams.map((x) => x.id));
    const groups = distributeTeams(shuffled, data.sizes);
    const letters = poolLetters(groups.length);
    const pairings = groups.map((g) => roundRobinPairs(g));
    const matchCount = pairings.reduce((acc, p) => acc + p.reduce((a, r) => a + r.pairs.length, 0), 0);
    return {
      tournamentId: data.tournamentId,
      sizes: data.sizes,
      groups: groups.map((teamIds, i) => ({
        letter: letters[i]!,
        name: `Poule ${letters[i]!}`,
        teamIds,
      })),
      matchCount,
      poolCount: groups.length,
      teamCount: teams.length,
      courtCount: t.courtCount,
    };
  });

export const confirmDraw = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    tournamentId: string;
    groups: { letter: string; name: string; teamIds: string[] }[];
  }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const t = await loadTournament(data.tournamentId);
    if (!t) throw new Error("Concours introuvable.");
    if (["in_progress", "finished", "archived"].includes(t.status)) {
      throw new Error("Le tirage d'un concours déjà lancé ne peut pas être modifié silencieusement.");
    }
    const sql = await getSql();
    await sql`delete from matches where tournament_id = ${data.tournamentId}`;
    await sql`delete from pools where tournament_id = ${data.tournamentId}`;

    const courts = await sql<{ id: string; number: number }>`
      select id, number from courts where tournament_id = ${data.tournamentId} order by number
    `;

    let matchN = 0;
    for (const g of data.groups) {
      const poolId = crypto.randomUUID();
      await sql`
        insert into pools (id, tournament_id, name, letter)
        values (${poolId}, ${data.tournamentId}, ${g.name}, ${g.letter})
      `;
      for (let s = 0; s < g.teamIds.length; s += 1) {
        await sql`
          insert into pool_teams (pool_id, team_id, seed)
          values (${poolId}, ${g.teamIds[s]!}, ${s + 1})
        `;
      }
      const pairings = roundRobinPairs(g.teamIds);
      for (const round of pairings) {
        for (const [a, b] of round.pairs) {
          if (a === b) throw new Error("Un match ne peut pas opposer une équipe à elle-même.");
          matchN += 1;
          const court = courts.length ? courts[(matchN - 1) % courts.length] : null;
          await sql`
            insert into matches (
              id, tournament_id, phase, pool_id, round_index,
              team1_id, team2_id, status, court_id, scheduled_at
            ) values (
              ${crypto.randomUUID()}, ${data.tournamentId}, 'pool', ${poolId}, ${round.round},
              ${a}, ${b}, 'upcoming', ${court?.id ?? null},
              ${`${String(8 + round.round).padStart(2, "0")}:00`}
            )
          `;
        }
      }
    }
    await sql`
      update tournaments set status = 'drawn', updated_at = now() where id = ${data.tournamentId}
    `;
    await writeAudit(context.userId, "confirm_draw", "tournaments", data.tournamentId, {
      pools: data.groups.length,
      matches: matchN,
    });
    return loadSnapshot(data.tournamentId);
  });

export const moveTeamPool = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { tournamentId: string; teamId: string; toPoolId: string }) => data)
  .handler(async ({ context, data }) => {
    const me = await staff(context.userId);
    if (me.role !== "admin") throw new Error("Seul un administrateur peut modifier le tirage.");
    const snap = await loadSnapshot(data.tournamentId);
    if (!snap) throw new Error("Concours introuvable.");
    const scored = snap.matches.some(
      (m) => m.phase === "pool" && (m.status === "finished" || m.status === "validated" || m.status === "live"),
    );
    if (scored) {
      throw new Error("Impossible de déplacer une équipe : des matchs de poule ont déjà un résultat.");
    }
    const sql = await getSql();
    await sql`delete from pool_teams where team_id = ${data.teamId}`;
    const maxSeed = await sql<{ n: number | null }>`
      select max(seed)::int as n from pool_teams where pool_id = ${data.toPoolId}
    `;
    await sql`
      insert into pool_teams (pool_id, team_id, seed)
      values (${data.toPoolId}, ${data.teamId}, ${(maxSeed[0]?.n ?? 0) + 1})
    `;
    // Rebuild pool matches
    await sql`delete from matches where tournament_id = ${data.tournamentId} and phase = 'pool'`;
    const pools = await sql<{ id: string; letter: string; name: string }>`
      select id, letter, name from pools where tournament_id = ${data.tournamentId}
    `;
    const courts = await sql<{ id: string }>`
      select id from courts where tournament_id = ${data.tournamentId} order by number
    `;
    let matchN = 0;
    for (const p of pools) {
      const members = await sql<{ team_id: string }>`
        select team_id from pool_teams where pool_id = ${p.id} order by seed
      `;
      const pairings = roundRobinPairs(members.map((m) => m.team_id));
      for (const round of pairings) {
        for (const [a, b] of round.pairs) {
          matchN += 1;
          const court = courts.length ? courts[(matchN - 1) % courts.length] : null;
          await sql`
            insert into matches (
              id, tournament_id, phase, pool_id, round_index,
              team1_id, team2_id, status, court_id
            ) values (
              ${crypto.randomUUID()}, ${data.tournamentId}, 'pool', ${p.id}, ${round.round},
              ${a}, ${b}, 'upcoming', ${court?.id ?? null}
            )
          `;
        }
      }
    }
    await writeAudit(context.userId, "move_team_pool", "teams", data.teamId, data);
    return loadSnapshot(data.tournamentId);
  });

export const saveScore = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { matchId: string; score1: number; score2: number; live?: boolean }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      tournament_id: string;
      team1_id: string | null;
      team2_id: string | null;
      next_match_id: string | null;
      next_match_slot: number | null;
      phase: string;
    }>`
      select id, tournament_id, team1_id, team2_id, next_match_id, next_match_slot, phase
      from matches where id = ${data.matchId} limit 1
    `;
    const match = rows[0];
    if (!match) throw new Error("Match introuvable.");
    if (!match.team1_id || !match.team2_id) throw new Error("Les deux équipes ne sont pas encore connues.");
    if (match.team1_id === match.team2_id) throw new Error("Un match ne peut pas opposer une équipe à elle-même.");

    const t = await loadTournament(match.tournament_id);
    if (!t) throw new Error("Concours introuvable.");

    if (data.live) {
      await sql`
        update matches set
          score1 = ${data.score1},
          score2 = ${data.score2},
          status = 'live',
          started_at = coalesce(started_at, now())
        where id = ${data.matchId}
      `;
      if (t.status === "drawn") {
        await sql`update tournaments set status = 'in_progress', updated_at = now() where id = ${t.id}`;
      }
      return loadSnapshot(t.id);
    }

    const err = validateScores(data.score1, data.score2, t.targetPoints);
    if (err) throw new Error(err);
    const winner = data.score1 > data.score2 ? match.team1_id : match.team2_id;
    await sql`
      update matches set
        score1 = ${data.score1},
        score2 = ${data.score2},
        status = 'validated',
        winner_id = ${winner},
        ended_at = now(),
        started_at = coalesce(started_at, now())
      where id = ${data.matchId}
    `;
    if (match.next_match_id && winner) {
      if (match.next_match_slot === 2) {
        await sql`update matches set team2_id = ${winner} where id = ${match.next_match_id}`;
      } else {
        await sql`update matches set team1_id = ${winner} where id = ${match.next_match_id}`;
      }
    }
    if (match.phase === "final") {
      await sql`
        update tournaments
        set winner_team_id = ${winner}, status = 'finished', updated_at = now()
        where id = ${t.id}
      `;
    } else if (t.status === "drawn" || t.status === "in_progress") {
      await sql`update tournaments set status = 'in_progress', updated_at = now() where id = ${t.id}`;
    }
    await writeAudit(context.userId, "save_score", "matches", data.matchId, data);
    return loadSnapshot(t.id);
  });

export const setMatchCourt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { matchId: string; courtId: string | null }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const sql = await getSql();
    await sql`update matches set court_id = ${data.courtId} where id = ${data.matchId}`;
    return { ok: true };
  });

export const generateFinals = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { tournamentId: string }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const snap = await loadSnapshot(data.tournamentId);
    if (!snap) throw new Error("Concours introuvable.");
    const unfinished = snap.matches.filter(
      (m) => m.phase === "pool" && m.status !== "validated" && m.status !== "finished",
    );
    if (unfinished.length) {
      throw new Error(`Impossible de générer le tableau : ${unfinished.length} matchs de poule ne sont pas encore validés.`);
    }
    const existingKo = snap.matches.some((m) => m.phase !== "pool");
    if (existingKo) throw new Error("Le tableau final existe déjà.");

    const qualified: QualifiedTeam[] = [];
    for (const pool of snap.pools) {
      const table = snap.standings[pool.id] ?? [];
      for (const row of table) {
        if (row.qualified) {
          qualified.push({ teamId: row.teamId, poolLetter: pool.letter, rank: row.rank });
        }
      }
    }
    if (qualified.length < 2) throw new Error("Pas assez d'équipes qualifiées.");
    const nodes = buildKnockout(qualified);
    const sql = await getSql();
    const courts = await sql<{ id: string }>`
      select id from courts where tournament_id = ${data.tournamentId} order by number
    `;
    let i = 0;
    for (const node of nodes) {
      const court = courts.length ? courts[i % courts.length] : null;
      i += 1;
      await sql`
        insert into matches (
          id, tournament_id, phase, round_index, bracket_slot,
          team1_id, team2_id, status, court_id,
          next_match_id, next_match_slot, placeholder1, placeholder2
        ) values (
          ${node.id}, ${data.tournamentId}, ${node.phase}, ${node.roundIndex}, ${node.slot},
          ${node.team1Id}, ${node.team2Id}, 'upcoming', ${court?.id ?? null},
          ${node.nextMatchId}, ${node.nextMatchSlot}, ${node.placeholder1}, ${node.placeholder2}
        )
      `;
    }
    await writeAudit(context.userId, "generate_finals", "tournaments", data.tournamentId, {
      qualified: qualified.length,
    });
    return loadSnapshot(data.tournamentId);
  });

export const getPoolProposals = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { tournamentId: string }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    const t = await loadTournament(data.tournamentId);
    if (!t) throw new Error("Concours introuvable.");
    const teams = (await loadTeams(data.tournamentId)).filter((x) => x.status === "validated");
    const proposals = proposePoolConfigs(
      teams.length,
      t.groupSize,
      Math.max(3, t.groupSize - 1),
      t.groupSize + 1,
      t.qualifiedPerGroup,
    );
    return {
      teamCount: teams.length,
      courtCount: t.courtCount,
      groupSize: t.groupSize,
      qualifiedPerGroup: t.qualifiedPerGroup,
      proposals,
    };
  });

export const getSnapshotStaff = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    await staff(context.userId);
    return loadSnapshot(data.id);
  });

export const listTournamentsStaff = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await staff(context.userId);
    const sql = await getSql();
    const rows = await sql<TournamentRow>`select * from tournaments order by date desc nulls last`;
    return rows.map(mapTournament);
  });
