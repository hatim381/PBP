import type { RankingCriterion, TeamFormat, TournamentStatus } from "@/lib/engine/types";
import { DEFAULT_RANKING } from "@/lib/engine/types";
import type { Match, Player, Team, Tournament } from "./types";

export type TournamentRow = {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  start_time: string | null;
  venue_name: string | null;
  address: string | null;
  court_count: number;
  max_teams: number;
  team_format: TeamFormat;
  competition_format: string;
  group_size: number;
  qualified_per_group: number;
  target_points: number;
  ranking_criteria: string;
  status: TournamentStatus;
  rules: string | null;
  winner_team_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  license_number: string | null;
  club: string | null;
  photo_url: string | null;
  status: "active" | "inactive";
  user_id: string | null;
};

export type MatchRow = {
  id: string;
  tournament_id: string;
  phase: Match["phase"];
  pool_id: string | null;
  round_index: number;
  bracket_slot: number | null;
  team1_id: string | null;
  team2_id: string | null;
  score1: number | null;
  score2: number | null;
  status: Match["status"];
  court_id: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  winner_id: string | null;
  next_match_id: string | null;
  next_match_slot: number | null;
  placeholder1: string | null;
  placeholder2: string | null;
};

export function parseCriteria(raw: string | null | undefined): RankingCriterion[] {
  if (!raw) return DEFAULT_RANKING;
  try {
    const parsed = JSON.parse(raw) as RankingCriterion[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_RANKING;
  } catch {
    return DEFAULT_RANKING;
  }
}

export function mapTournament(row: TournamentRow): Tournament {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    date: row.date,
    startTime: row.start_time,
    venueName: row.venue_name,
    address: row.address,
    courtCount: Number(row.court_count),
    maxTeams: Number(row.max_teams),
    teamFormat: row.team_format,
    competitionFormat: row.competition_format,
    groupSize: Number(row.group_size),
    qualifiedPerGroup: Number(row.qualified_per_group),
    targetPoints: Number(row.target_points),
    rankingCriteria: parseCriteria(row.ranking_criteria),
    status: row.status,
    rules: row.rules,
    winnerTeamId: row.winner_team_id,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapPlayer(row: PlayerRow, publicView = false): Player {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: publicView ? null : row.phone,
    email: publicView ? null : row.email,
    licenseNumber: publicView ? null : row.license_number,
    club: row.club,
    photoUrl: row.photo_url,
    status: row.status,
    userId: publicView ? null : row.user_id,
  };
}

export function mapMatch(row: MatchRow): Match {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    phase: row.phase,
    poolId: row.pool_id,
    roundIndex: Number(row.round_index),
    bracketSlot: row.bracket_slot == null ? null : Number(row.bracket_slot),
    team1Id: row.team1_id,
    team2Id: row.team2_id,
    score1: row.score1 == null ? null : Number(row.score1),
    score2: row.score2 == null ? null : Number(row.score2),
    status: row.status,
    courtId: row.court_id,
    scheduledAt: row.scheduled_at,
    startedAt: row.started_at ? String(row.started_at) : null,
    endedAt: row.ended_at ? String(row.ended_at) : null,
    winnerId: row.winner_id,
    nextMatchId: row.next_match_id,
    nextMatchSlot: row.next_match_slot == null ? null : Number(row.next_match_slot),
    placeholder1: row.placeholder1,
    placeholder2: row.placeholder2,
  };
}

export type TeamRow = {
  id: string;
  tournament_id: string;
  name: string;
  number: number | null;
  status: Team["status"];
};

export function mapTeam(
  row: TeamRow,
  players: Team["players"] = [],
): Team {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    name: row.name,
    number: row.number == null ? null : Number(row.number),
    status: row.status,
    players,
  };
}
