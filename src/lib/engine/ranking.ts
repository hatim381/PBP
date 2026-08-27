import type { RankingCriterion } from "./types";
import { DEFAULT_RANKING } from "./types";

export type PlayedMatch = {
  team1Id: string;
  team2Id: string;
  score1: number;
  score2: number;
  winnerId: string | null;
  status: string;
};

export type Standing = {
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

function isComplete(m: PlayedMatch): boolean {
  return (
    (m.status === "finished" || m.status === "validated") &&
    m.score1 != null &&
    m.score2 != null
  );
}

function miniStats(teamIds: string[], matches: PlayedMatch[]) {
  const map = new Map<
    string,
    { wins: number; diff: number; pf: number; pa: number }
  >();
  for (const id of teamIds) map.set(id, { wins: 0, diff: 0, pf: 0, pa: 0 });
  for (const m of matches) {
    if (!isComplete(m)) continue;
    if (!map.has(m.team1Id) || !map.has(m.team2Id)) continue;
    const a = map.get(m.team1Id)!;
    const b = map.get(m.team2Id)!;
    a.pf += m.score1;
    a.pa += m.score2;
    a.diff += m.score1 - m.score2;
    b.pf += m.score2;
    b.pa += m.score1;
    b.diff += m.score2 - m.score1;
    if (m.score1 > m.score2) a.wins += 1;
    else b.wins += 1;
  }
  return map;
}

function comparePair(
  a: Standing,
  b: Standing,
  criterion: RankingCriterion,
  matches: PlayedMatch[],
  tiedIds: string[],
): number {
  switch (criterion) {
    case "wins":
      return b.wins - a.wins;
    case "point_diff":
      return b.diff - a.diff;
    case "points_for":
      return b.pointsFor - a.pointsFor;
    case "points_against":
      return a.pointsAgainst - b.pointsAgainst;
    case "random":
      return a.teamId < b.teamId ? -1 : 1;
    case "head_to_head": {
      const stats = miniStats(tiedIds, matches);
      const sa = stats.get(a.teamId);
      const sb = stats.get(b.teamId);
      if (!sa || !sb) return 0;
      if (sa.wins !== sb.wins) return sb.wins - sa.wins;
      if (sa.diff !== sb.diff) return sb.diff - sa.diff;
      if (sa.pf !== sb.pf) return sb.pf - sa.pf;
      return 0;
    }
    default:
      return 0;
  }
}

export function rankTeams(
  teamIds: string[],
  matches: PlayedMatch[],
  criteria: RankingCriterion[] = DEFAULT_RANKING,
  qualifiedCount = 0,
): Standing[] {
  const base = new Map<string, Standing>();
  for (const id of teamIds) {
    base.set(id, {
      teamId: id,
      rank: 0,
      played: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      diff: 0,
      qualified: false,
    });
  }

  for (const m of matches) {
    if (!isComplete(m)) continue;
    const a = base.get(m.team1Id);
    const b = base.get(m.team2Id);
    if (!a || !b) continue;
    a.played += 1;
    b.played += 1;
    a.pointsFor += m.score1;
    a.pointsAgainst += m.score2;
    a.diff += m.score1 - m.score2;
    b.pointsFor += m.score2;
    b.pointsAgainst += m.score1;
    b.diff += m.score2 - m.score1;
    if (m.score1 > m.score2) {
      a.wins += 1;
      b.losses += 1;
    } else {
      b.wins += 1;
      a.losses += 1;
    }
  }

  const list = [...base.values()];
  const crits = criteria.length ? criteria : DEFAULT_RANKING;

  list.sort((a, b) => {
    for (const c of crits) {
      const tied = list
        .filter((x) => {
          if (c !== "head_to_head") return true;
          return crits
            .slice(0, crits.indexOf(c))
            .every((prev) => comparePair(a, x, prev, matches, [a.teamId, x.teamId]) === 0);
        })
        .map((x) => x.teamId);
      const cmp = comparePair(a, b, c, matches, tied.length ? tied : [a.teamId, b.teamId]);
      if (cmp !== 0) return cmp;
    }
    return a.teamId.localeCompare(b.teamId);
  });

  list.forEach((s, i) => {
    s.rank = i + 1;
    s.qualified = qualifiedCount > 0 && i < qualifiedCount;
  });
  return list;
}
