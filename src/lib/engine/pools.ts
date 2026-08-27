import type { CompetitionFormat, EngineConfig, EnginePlan, PoolProposal } from "./types";

function variance(sizes: number[]): number {
  const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  return sizes.reduce((acc, n) => acc + (n - mean) ** 2, 0) / sizes.length;
}

function preferredDistance(sizes: number[], preferred: number): number {
  return sizes.reduce((acc, n) => acc + Math.abs(n - preferred), 0);
}

function labelFor(sizes: number[]): string {
  const counts = new Map<number, number>();
  for (const s of sizes) counts.set(s, (counts.get(s) ?? 0) + 1);
  const parts = [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([size, n]) => (n === 1 ? `1 poule de ${size}` : `${n} poules de ${size}`));
  return parts.join(" + ");
}

/**
 * Distribute `teamCount` teams into `poolCount` groups as evenly as possible.
 * Larger groups come first so leftover teams pad the first pools.
 */
export function evenSizes(teamCount: number, poolCount: number): number[] {
  const base = Math.floor(teamCount / poolCount);
  const rem = teamCount % poolCount;
  const sizes: number[] = [];
  for (let i = 0; i < poolCount; i += 1) {
    sizes.push(base + (i < rem ? 1 : 0));
  }
  return sizes;
}

/**
 * Propose balanced pool configurations.
 * Prefers groups close to `groupSize`, never more than 1 team of difference
 * between the largest and smallest group in a given proposal.
 */
export function proposePoolConfigs(
  teamCount: number,
  preferredSize = 4,
  minSize = 3,
  maxSize = 5,
  qualifiedPerGroup = 2,
): PoolProposal[] {
  if (teamCount < minSize) return [];

  const seen = new Set<string>();
  const proposals: PoolProposal[] = [];

  const minPools = Math.max(1, Math.ceil(teamCount / maxSize));
  const maxPools = Math.floor(teamCount / minSize);

  for (let pools = minPools; pools <= maxPools; pools += 1) {
    const sizes = evenSizes(teamCount, pools);
    if (sizes.some((s) => s < minSize || s > maxSize)) continue;
    const key = sizes.slice().sort((a, b) => b - a).join("-");
    if (seen.has(key)) continue;
    seen.add(key);

    const qualified = sizes.reduce(
      (acc, s) => acc + Math.min(qualifiedPerGroup, Math.max(1, s - 1)),
      0,
    );

    proposals.push({
      id: `p-${pools}-${key}`,
      pools,
      sizes,
      label: labelFor(sizes),
      description: `${teamCount} équipes · ${pools} poules · ${qualified} qualifiées`,
      variance: variance(sizes),
      preferredDistance: preferredDistance(sizes, preferredSize),
      qualifiedTeams: qualified,
    });
  }

  proposals.sort((a, b) => {
    if (a.preferredDistance !== b.preferredDistance) {
      return a.preferredDistance - b.preferredDistance;
    }
    if (a.variance !== b.variance) return a.variance - b.variance;
    return a.pools - b.pools;
  });

  return proposals;
}

export function planCompetition(config: EngineConfig): EnginePlan {
  const minSize = config.minGroupSize ?? Math.max(3, config.groupSize - 1);
  const maxSize = config.maxGroupSize ?? config.groupSize + 1;
  const proposals = proposePoolConfigs(
    config.teamCount,
    config.groupSize,
    minSize,
    maxSize,
    config.qualifiedPerGroup,
  );
  const best = proposals[0];
  const format: CompetitionFormat = config.competitionFormat;

  if (!best) {
    return {
      groups: 0,
      teamsPerGroup: config.groupSize,
      qualifiedTeams: 0,
      competitionStructure: format,
      proposals: [],
    };
  }

  return {
    groups: best.pools,
    teamsPerGroup: best.sizes.length === 1 || best.sizes.every((s) => s === best.sizes[0])
      ? best.sizes[0]!
      : best.sizes,
    qualifiedTeams: best.qualifiedTeams,
    competitionStructure: format,
    proposals,
  };
}

/** Assign shuffled team ids into pools according to a size list. */
export function distributeTeams(teamIds: string[], sizes: number[]): string[][] {
  const groups: string[][] = [];
  let cursor = 0;
  for (const size of sizes) {
    groups.push(teamIds.slice(cursor, cursor + size));
    cursor += size;
  }
  return groups;
}
