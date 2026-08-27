import type { BracketNode, MatchPhase, QualifiedTeam } from "./types";

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function phaseForRound(teamsInRound: number): MatchPhase {
  if (teamsInRound <= 2) return "final";
  if (teamsInRound <= 4) return "semi";
  if (teamsInRound <= 8) return "quarter";
  return "round_of_16";
}

/**
 * Classic crossover seeding: 1A vs 2B, 1B vs 2A, 1C vs 2D, 1D vs 2C, …
 * Pads to the next power of two with byes.
 */
export function buildKnockout(qualified: QualifiedTeam[]): BracketNode[] {
  if (qualified.length < 2) return [];

  const size = nextPowerOfTwo(qualified.length);
  const ordered = seedCrossover(qualified, size);
  const nodes: BracketNode[] = [];

  let roundSize = size;
  let roundIndex = 1;
  const roundMatches: BracketNode[][] = [];

  while (roundSize >= 2) {
    const phase = phaseForRound(roundSize);
    const count = roundSize / 2;
    const round: BracketNode[] = [];
    for (let i = 0; i < count; i += 1) {
      const id = `ko-${phase}-${i + 1}`;
      if (roundIndex === 1) {
        const t1 = ordered[i * 2] ?? null;
        const t2 = ordered[i * 2 + 1] ?? null;
        round.push({
          id,
          phase,
          slot: i + 1,
          roundIndex,
          team1Id: t1?.teamId ?? null,
          team2Id: t2?.teamId ?? null,
          placeholder1: t1 ? labelFor(t1) : "Exempt",
          placeholder2: t2 ? labelFor(t2) : "Exempt",
          nextMatchId: null,
          nextMatchSlot: null,
        });
      } else {
        round.push({
          id,
          phase,
          slot: i + 1,
          roundIndex,
          team1Id: null,
          team2Id: null,
          placeholder1: `Vainqueur ${roundMatches[roundIndex - 2]![i * 2]!.id}`,
          placeholder2: `Vainqueur ${roundMatches[roundIndex - 2]![i * 2 + 1]!.id}`,
          nextMatchId: null,
          nextMatchSlot: null,
        });
      }
    }
    roundMatches.push(round);
    nodes.push(...round);
    roundSize = count;
    roundIndex += 1;
  }

  for (let r = 0; r < roundMatches.length - 1; r += 1) {
    const cur = roundMatches[r]!;
    const nxt = roundMatches[r + 1]!;
    for (let i = 0; i < cur.length; i += 1) {
      const next = nxt[Math.floor(i / 2)]!;
      cur[i]!.nextMatchId = next.id;
      cur[i]!.nextMatchSlot = (i % 2 === 0 ? 1 : 2);
      if (r > 0) {
        // rewrite placeholders with human phase names once ids exist
      }
    }
  }

  // Human placeholders for later rounds
  for (let r = 1; r < roundMatches.length; r += 1) {
    const prev = roundMatches[r - 1]!;
    for (let i = 0; i < roundMatches[r]!.length; i += 1) {
      const node = roundMatches[r]![i]!;
      const left = prev[i * 2]!;
      const right = prev[i * 2 + 1]!;
      node.placeholder1 = `Vainqueur ${phaseShort(left.phase)} ${left.slot}`;
      node.placeholder2 = `Vainqueur ${phaseShort(right.phase)} ${right.slot}`;
    }
  }

  return nodes;
}

function phaseShort(phase: MatchPhase): string {
  if (phase === "quarter") return "Q";
  if (phase === "semi") return "D";
  if (phase === "round_of_16") return "H";
  if (phase === "final") return "F";
  return phase;
}

function labelFor(q: QualifiedTeam): string {
  return `${q.rank}${ordinal(q.rank)} poule ${q.poolLetter}`;
}

function ordinal(n: number): string {
  return n === 1 ? "er" : "e";
}

function seedCrossover(qualified: QualifiedTeam[], size: number): (QualifiedTeam | null)[] {
  const byPool = new Map<string, QualifiedTeam[]>();
  for (const q of qualified) {
    const list = byPool.get(q.poolLetter) ?? [];
    list.push(q);
    byPool.set(q.poolLetter, list);
  }
  for (const list of byPool.values()) list.sort((a, b) => a.rank - b.rank);

  const pools = [...byPool.keys()].sort();
  const firsts: QualifiedTeam[] = [];
  const seconds: QualifiedTeam[] = [];
  for (const letter of pools) {
    const list = byPool.get(letter)!;
    if (list[0]) firsts.push(list[0]);
    if (list[1]) seconds.push(list[1]);
    for (let i = 2; i < list.length; i += 1) firsts.push(list[i]!);
  }

  const slots: (QualifiedTeam | null)[] = Array.from({ length: size }, () => null);
  const pairs = Math.min(firsts.length, seconds.length);
  let cursor = 0;
  for (let i = 0; i < pairs; i += 1) {
    const a = firsts[i]!;
    // Cross: 1A vs 2B, 1B vs 2A — rotate seconds by 1
    const b = seconds[(i + 1) % seconds.length]!;
    slots[cursor] = a;
    slots[cursor + 1] = b;
    cursor += 2;
  }
  for (let i = pairs; i < firsts.length && cursor < size; i += 1) {
    slots[cursor] = firsts[i]!;
    cursor += 2;
  }
  // leftover seconds not used in the rotate
  const usedSecond = new Set<string>();
  for (let i = 0; i < cursor; i += 1) {
    if (slots[i]) usedSecond.add(slots[i]!.teamId);
  }
  for (const s of seconds) {
    if (usedSecond.has(s.teamId)) continue;
    const empty = slots.findIndex((x, idx) => x === null && idx % 2 === 1);
    if (empty >= 0) slots[empty] = s;
  }

  // Deduplicate if rotate reused a second against their own pool first
  const seen = new Set<string>();
  for (let i = 0; i < slots.length; i += 1) {
    const q = slots[i];
    if (!q) continue;
    if (seen.has(q.teamId)) slots[i] = null;
    else seen.add(q.teamId);
  }

  // Fill remaining qualified that were dropped
  const remaining = qualified.filter((q) => !seen.has(q.teamId));
  for (const q of remaining) {
    const empty = slots.findIndex((x) => x === null);
    if (empty >= 0) {
      slots[empty] = q;
      seen.add(q.teamId);
    }
  }

  return slots;
}

export function nextPhaseAfterWin(phase: MatchPhase): MatchPhase | null {
  if (phase === "round_of_16") return "quarter";
  if (phase === "quarter") return "semi";
  if (phase === "semi") return "final";
  return null;
}
