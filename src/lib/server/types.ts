import type {
  MatchPhase,
  MatchStatus,
  RankingCriterion,
  TeamFormat,
  TeamStatus,
  TournamentStatus,
} from "@/lib/engine/types";

export type ClubRole = "admin" | "organizer" | "player";

export type ClubMember = {
  userId: string;
  role: ClubRole;
  displayName: string | null;
  email: string | null;
};

export type Player = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  licenseNumber: string | null;
  club: string | null;
  photoUrl: string | null;
  status: "active" | "inactive";
  userId: string | null;
};

export type Tournament = {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  startTime: string | null;
  venueName: string | null;
  address: string | null;
  courtCount: number;
  maxTeams: number;
  teamFormat: TeamFormat;
  competitionFormat: string;
  groupSize: number;
  qualifiedPerGroup: number;
  targetPoints: number;
  rankingCriteria: RankingCriterion[];
  status: TournamentStatus;
  rules: string | null;
  winnerTeamId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamPlayer = {
  playerId: string;
  firstName: string;
  lastName: string;
  club: string | null;
  position: number;
};

export type Team = {
  id: string;
  tournamentId: string;
  name: string;
  number: number | null;
  status: TeamStatus;
  players: TeamPlayer[];
};

export type Pool = {
  id: string;
  tournamentId: string;
  name: string;
  letter: string;
  teamIds: string[];
};

export type Court = {
  id: string;
  tournamentId: string;
  name: string;
  number: number;
};

export type Match = {
  id: string;
  tournamentId: string;
  phase: MatchPhase;
  poolId: string | null;
  roundIndex: number;
  bracketSlot: number | null;
  team1Id: string | null;
  team2Id: string | null;
  score1: number | null;
  score2: number | null;
  status: MatchStatus;
  courtId: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  winnerId: string | null;
  nextMatchId: string | null;
  nextMatchSlot: number | null;
  placeholder1: string | null;
  placeholder2: string | null;
};

export type TournamentCounts = {
  teams: number;
  validatedTeams: number;
  pendingTeams: number;
  pools: number;
  matches: number;
  matchesDone: number;
  matchesLive: number;
};

export type StandingRow = {
  teamId: string;
  rank: number;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
  qualified: boolean;
};
