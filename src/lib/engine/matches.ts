import type { Pairing } from "./types";

/**
 * Circle method round-robin. Each team meets every other team in its pool
 * exactly once. Rounds are packed so no team plays twice in the same round.
 */
export function roundRobinPairs(teamIds: string[]): Pairing[] {
  const n = teamIds.length;
  if (n < 2) return [];

  const isOdd = n % 2 === 1;
  const ids = isOdd ? [...teamIds, "__bye__"] : [...teamIds];
  const m = ids.length;
  const rounds = m - 1;
  const half = m / 2;
  const rotating = ids.slice();
  const result: Pairing[] = [];

  for (let r = 0; r < rounds; r += 1) {
    const pairs: [string, string][] = [];
    for (let i = 0; i < half; i += 1) {
      const a = rotating[i]!;
      const b = rotating[m - 1 - i]!;
      if (a !== "__bye__" && b !== "__bye__") {
        pairs.push(r % 2 === 0 ? [a, b] : [b, a]);
      }
    }
    result.push({ round: r + 1, pairs });
    // rotate all but first
    const last = rotating.pop()!;
    rotating.splice(1, 0, last);
  }

  return result;
}

export function matchCountForPool(teamCount: number): number {
  return (teamCount * (teamCount - 1)) / 2;
}

export type ScheduledMatch = {
  team1Id: string;
  team2Id: string;
  roundIndex: number;
  courtNumber: number | null;
  wave: number;
};

/**
 * Assign courts so that a whole round (across pools) shares the same wave,
 * never putting a team on two courts at once (already guaranteed per round).
 */
export function schedulePoolMatches(
  poolPairings: { poolId: string; pairings: Pairing[] }[],
  courtCount: number,
): Map<string, { courtNumber: number; wave: number; roundIndex: number }> {
  const assignment = new Map<string, { courtNumber: number; wave: number; roundIndex: number }>();
  const maxRound = Math.max(0, ...poolPairings.flatMap((p) => p.pairings.map((x) => x.round)));

  let globalWave = 0;
  for (let round = 1; round <= maxRound; round += 1) {
    const matchesThisRound: { key: string }[] = [];
    for (const pool of poolPairings) {
      const pairing = pool.pairings.find((p) => p.round === round);
      if (!pairing) continue;
      for (const [a, b] of pairing.pairs) {
        matchesThisRound.push({ key: `${pool.poolId}:${a}:${b}` });
      }
    }
    const courts = Math.max(1, courtCount);
    for (let i = 0; i < matchesThisRound.length; i += 1) {
      const localWave = Math.floor(i / courts);
      const courtNumber = (i % courts) + 1;
      assignment.set(matchesThisRound[i]!.key, {
        courtNumber,
        wave: globalWave + localWave,
        roundIndex: round,
      });
    }
    const wavesUsed = Math.max(1, Math.ceil(matchesThisRound.length / courts));
    globalWave += wavesUsed;
  }

  return assignment;
}

export function validateScores(
  score1: number,
  score2: number,
  targetPoints = 13,
): string | null {
  if (!Number.isInteger(score1) || !Number.isInteger(score2)) {
    return "Les scores doivent être des entiers.";
  }
  if (score1 < 0 || score2 < 0) return "Les scores ne peuvent pas être négatifs.";
  if (score1 > targetPoints || score2 > targetPoints) {
    return `Un score ne peut pas dépasser ${targetPoints}.`;
  }
  if (score1 === score2) return "Un match de pétanque ne peut pas se terminer sur un match nul.";
  if (score1 !== targetPoints && score2 !== targetPoints) {
    return `Une équipe doit atteindre ${targetPoints} points.`;
  }
  return null;
}
