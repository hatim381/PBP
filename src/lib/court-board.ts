import type { Court, Match, Team } from "@/lib/server/types";

export type CourtState = "live" | "upcoming" | "free";

export type CourtBoardRow = {
  court: Court;
  state: CourtState;
  current: Match | null;
  next: Match | null;
  doneCount: number;
};

export function buildCourtBoard(courts: Court[], matches: Match[]): CourtBoardRow[] {
  return courts.map((court) => {
    const assigned = matches.filter((m) => m.courtId === court.id);
    const current = assigned.find((m) => m.status === "live") ?? null;
    const next =
      assigned
        .filter((m) => m.status === "upcoming")
        .sort((a, b) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""))[0] ?? null;
    const doneCount = assigned.filter((m) => m.status === "finished" || m.status === "validated").length;
    const state: CourtState = current ? "live" : next ? "upcoming" : "free";
    return { court, state, current, next, doneCount };
  });
}

export function nextMatchForTeam(matches: Match[], teamId: string): Match | null {
  const live = matches.find(
    (m) => m.status === "live" && (m.team1Id === teamId || m.team2Id === teamId),
  );
  if (live) return live;
  return (
    matches.find(
      (m) => m.status === "upcoming" && (m.team1Id === teamId || m.team2Id === teamId),
    ) ?? null
  );
}

export function opponentId(match: Match, teamId: string): string | null {
  if (match.team1Id === teamId) return match.team2Id;
  if (match.team2Id === teamId) return match.team1Id;
  return null;
}

export function teamName(teams: Team[], id: string | null): string {
  if (!id) return "Adversaire à venir";
  return teams.find((t) => t.id === id)?.name ?? "Équipe";
}
