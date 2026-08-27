import { getSql } from "@/lib/db";
import { rankTeams } from "@/lib/engine/ranking";
import type { Standing, PlayedMatch } from "@/lib/engine/ranking";
import { mapMatch, mapPlayer, mapTeam, mapTournament, type MatchRow, type PlayerRow, type TeamRow, type TournamentRow } from "./mappers";
import type { Court, Match, Player, Pool, Team, Tournament } from "./types";

export async function loadTournament(id: string): Promise<Tournament | null> {
  const sql = await getSql();
  const rows = await sql<TournamentRow>`select * from tournaments where id = ${id} limit 1`;
  return rows[0] ? mapTournament(rows[0]) : null;
}

export async function loadPlayersByIds(ids: string[], publicView = false): Promise<Player[]> {
  if (!ids.length) return [];
  const sql = await getSql();
  const rows = await sql<PlayerRow>`
    select * from players where id = any(${ids}::text[])
  `;
  return rows.map((r) => mapPlayer(r, publicView));
}

export async function loadTeams(tournamentId: string): Promise<Team[]> {
  const sql = await getSql();
  const teamRows = await sql<TeamRow>`
    select id, tournament_id, name, number, status
    from teams
    where tournament_id = ${tournamentId}
    order by coalesce(number, 9999), name
  `;
  if (!teamRows.length) return [];
  const ids = teamRows.map((t) => t.id);
  const tp = await sql<{ team_id: string; player_id: string; position: number; first_name: string; last_name: string; club: string | null }>`
    select tp.team_id, tp.player_id, tp.position, p.first_name, p.last_name, p.club
    from team_players tp
    join players p on p.id = tp.player_id
    where tp.team_id = any(${ids}::text[])
    order by tp.position
  `;
  const byTeam = new Map<string, Team["players"]>();
  for (const row of tp) {
    const list = byTeam.get(row.team_id) ?? [];
    list.push({
      playerId: row.player_id,
      firstName: row.first_name,
      lastName: row.last_name,
      club: row.club,
      position: Number(row.position),
    });
    byTeam.set(row.team_id, list);
  }
  return teamRows.map((r) => mapTeam(r, byTeam.get(r.id) ?? []));
}

export async function loadPools(tournamentId: string): Promise<Pool[]> {
  const sql = await getSql();
  const pools = await sql<{ id: string; tournament_id: string; name: string; letter: string }>`
    select id, tournament_id, name, letter from pools
    where tournament_id = ${tournamentId}
    order by letter
  `;
  if (!pools.length) return [];
  const ids = pools.map((p) => p.id);
  const members = await sql<{ pool_id: string; team_id: string; seed: number }>`
    select pool_id, team_id, seed from pool_teams
    where pool_id = any(${ids}::text[])
    order by seed
  `;
  const byPool = new Map<string, string[]>();
  for (const m of members) {
    const list = byPool.get(m.pool_id) ?? [];
    list.push(m.team_id);
    byPool.set(m.pool_id, list);
  }
  return pools.map((p) => ({
    id: p.id,
    tournamentId: p.tournament_id,
    name: p.name,
    letter: p.letter,
    teamIds: byPool.get(p.id) ?? [],
  }));
}

export async function loadMatches(tournamentId: string): Promise<Match[]> {
  const sql = await getSql();
  const rows = await sql<MatchRow>`
    select * from matches
    where tournament_id = ${tournamentId}
    order by
      case phase
        when 'pool' then 0
        when 'round_of_16' then 1
        when 'quarter' then 2
        when 'semi' then 3
        when 'third' then 4
        when 'final' then 5
        else 6
      end,
      round_index,
      coalesce(bracket_slot, 0),
      id
  `;
  return rows.map(mapMatch);
}

export async function loadCourts(tournamentId: string): Promise<Court[]> {
  const sql = await getSql();
  const rows = await sql<{ id: string; tournament_id: string; name: string; number: number }>`
    select id, tournament_id, name, number from courts
    where tournament_id = ${tournamentId}
    order by number
  `;
  return rows.map((r) => ({
    id: r.id,
    tournamentId: r.tournament_id,
    name: r.name,
    number: Number(r.number),
  }));
}

export function standingsForPool(
  teamIds: string[],
  matches: Match[],
  qualifiedPerGroup: number,
  criteria: Tournament["rankingCriteria"],
): Standing[] {
  const played: PlayedMatch[] = matches
    .filter((m) => m.phase === "pool" && m.team1Id && m.team2Id)
    .map((m) => ({
      team1Id: m.team1Id!,
      team2Id: m.team2Id!,
      score1: m.score1 ?? 0,
      score2: m.score2 ?? 0,
      winnerId: m.winnerId,
      status: m.status,
    }));
  return rankTeams(teamIds, played, criteria, qualifiedPerGroup);
}

export type TournamentSnapshot = {
  tournament: Tournament;
  teams: Team[];
  pools: Pool[];
  matches: Match[];
  courts: Court[];
  standings: Record<string, Standing[]>;
};

export async function loadSnapshot(id: string): Promise<TournamentSnapshot | null> {
  const tournament = await loadTournament(id);
  if (!tournament) return null;
  const [teams, pools, matches, courts] = await Promise.all([
    loadTeams(id),
    loadPools(id),
    loadMatches(id),
    loadCourts(id),
  ]);
  const standings: Record<string, Standing[]> = {};
  for (const pool of pools) {
    const poolMatches = matches.filter((m) => m.poolId === pool.id);
    standings[pool.id] = standingsForPool(
      pool.teamIds,
      poolMatches,
      tournament.qualifiedPerGroup,
      tournament.rankingCriteria,
    );
  }
  return { tournament, teams, pools, matches, courts, standings };
}

export async function nextTeamNumber(tournamentId: string): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ n: number | null }>`
    select max(number)::int as n from teams where tournament_id = ${tournamentId}
  `;
  return (rows[0]?.n ?? 0) + 1;
}
