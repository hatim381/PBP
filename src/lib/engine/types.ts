export const TEAM_FORMATS = ["tete_a_tete", "doublette", "triplette"] as const;
export type TeamFormat = (typeof TEAM_FORMATS)[number];

export const TOURNAMENT_STATUSES = [
  "draft",
  "registrations_open",
  "registrations_closed",
  "draw_pending",
  "drawn",
  "in_progress",
  "finished",
  "archived",
] as const;
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const TEAM_STATUSES = ["pending", "validated", "refused", "cancelled"] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];

export const MATCH_STATUSES = ["upcoming", "live", "finished", "validated"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MATCH_PHASES = [
  "pool",
  "round_of_16",
  "quarter",
  "semi",
  "final",
  "third",
] as const;
export type MatchPhase = (typeof MATCH_PHASES)[number];

export const RANKING_CRITERIA = [
  "wins",
  "head_to_head",
  "point_diff",
  "points_for",
  "points_against",
  "random",
] as const;
export type RankingCriterion = (typeof RANKING_CRITERIA)[number];

export const DEFAULT_RANKING: RankingCriterion[] = [
  "wins",
  "head_to_head",
  "point_diff",
  "points_for",
];

export type CompetitionFormat = "groups_then_knockout" | "knockout" | "groups_only";

export type EngineConfig = {
  teamCount: number;
  teamFormat: TeamFormat;
  competitionFormat: CompetitionFormat;
  groupSize: number;
  qualifiedPerGroup: number;
  minGroupSize?: number;
  maxGroupSize?: number;
};

export type PoolProposal = {
  id: string;
  pools: number;
  sizes: number[];
  label: string;
  description: string;
  variance: number;
  preferredDistance: number;
  qualifiedTeams: number;
};

export type EnginePlan = {
  groups: number;
  teamsPerGroup: number | number[];
  qualifiedTeams: number;
  competitionStructure: CompetitionFormat;
  proposals: PoolProposal[];
};

export type Pairing = {
  round: number;
  pairs: [string, string][];
};

export type QualifiedTeam = {
  teamId: string;
  poolLetter: string;
  rank: number;
};

export type BracketNode = {
  id: string;
  phase: MatchPhase;
  slot: number;
  roundIndex: number;
  team1Id: string | null;
  team2Id: string | null;
  placeholder1: string;
  placeholder2: string;
  nextMatchId: string | null;
  nextMatchSlot: 1 | 2 | null;
};

export function playersPerTeam(format: TeamFormat): number {
  if (format === "tete_a_tete") return 1;
  if (format === "doublette") return 2;
  return 3;
}

export function formatLabel(format: TeamFormat): string {
  if (format === "tete_a_tete") return "Tête-à-tête";
  if (format === "doublette") return "Doublette";
  return "Triplette";
}

export const STATUS_LABELS: Record<TournamentStatus, string> = {
  draft: "Brouillon",
  registrations_open: "Inscriptions ouvertes",
  registrations_closed: "Inscriptions clôturées",
  draw_pending: "Tirage en attente",
  drawn: "Tirage effectué",
  in_progress: "Concours en cours",
  finished: "Terminé",
  archived: "Archivé",
};

export const TEAM_STATUS_LABELS: Record<TeamStatus, string> = {
  pending: "En attente",
  validated: "Validée",
  refused: "Refusée",
  cancelled: "Annulée",
};

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  upcoming: "À venir",
  live: "En cours",
  finished: "Terminé",
  validated: "Validé",
};

export const PHASE_LABELS: Record<MatchPhase, string> = {
  pool: "Poules",
  round_of_16: "Huitièmes",
  quarter: "Quarts de finale",
  semi: "Demi-finales",
  final: "Finale",
  third: "Petite finale",
};

export const CRITERIA_LABELS: Record<RankingCriterion, string> = {
  wins: "Nombre de victoires",
  head_to_head: "Confrontations directes",
  point_diff: "Différence de points",
  points_for: "Points marqués",
  points_against: "Points encaissés (moins = mieux)",
  random: "Tirage au sort",
};

export const WIZARD_STEPS = [
  { key: "create", label: "Créer le concours", statuses: ["draft"] },
  { key: "open", label: "Ouvrir les inscriptions", statuses: ["draft"] },
  { key: "validate", label: "Valider les équipes", statuses: ["registrations_open"] },
  { key: "close", label: "Clôturer les inscriptions", statuses: ["registrations_open"] },
  { key: "configure", label: "Configurer les poules", statuses: ["registrations_closed", "draw_pending"] },
  { key: "draw", label: "Effectuer le tirage", statuses: ["draw_pending"] },
  { key: "launch", label: "Lancer les matchs", statuses: ["drawn"] },
  { key: "scores", label: "Saisir les résultats", statuses: ["in_progress"] },
  { key: "finals", label: "Générer la phase finale", statuses: ["in_progress"] },
  { key: "close_event", label: "Clôturer le concours", statuses: ["in_progress", "finished"] },
] as const;

export function nextStatus(current: TournamentStatus): TournamentStatus | null {
  const order: TournamentStatus[] = [...TOURNAMENT_STATUSES];
  const i = order.indexOf(current);
  if (i < 0 || i === order.length - 1) return null;
  return order[i + 1]!;
}
