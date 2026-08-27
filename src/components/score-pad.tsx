import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamLine } from "@/components/team-line";
import { validateScores } from "@/lib/engine/matches";
import type { Match, Team } from "@/lib/server/types";
import { cn } from "@/lib/utils";

function Stepper({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="grid size-12 place-items-center rounded-xl border border-cream/15 bg-navy-950/50 text-cream hover:bg-cream/10"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        <Minus className="size-5" />
      </button>
      <span className="score-digit min-w-[3.2rem] text-center font-display text-5xl font-semibold tabular-nums text-cream">
        {value}
      </span>
      <button
        type="button"
        className="grid size-12 place-items-center rounded-xl border border-cream/15 bg-navy-950/50 text-cream hover:bg-cream/10"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-5" />
      </button>
    </div>
  );
}

export function ScorePad({
  match,
  teams,
  targetPoints,
  onValidate,
  onLive,
  busy,
}: {
  match: Match;
  teams: Team[];
  targetPoints: number;
  onValidate: (s1: number, s2: number) => void;
  onLive?: (s1: number, s2: number) => void;
  busy?: boolean;
}) {
  const [s1, setS1] = useState(match.score1 ?? 0);
  const [s2, setS2] = useState(match.score2 ?? 0);
  const t1 = teams.find((t) => t.id === match.team1Id);
  const t2 = teams.find((t) => t.id === match.team2Id);
  const error = validateScores(s1, s2, targetPoints);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-cream/10 bg-navy-900 p-4">
          <TeamLine team={t1} />
          <Stepper value={s1} onChange={setS1} max={targetPoints} />
        </div>
        <div className="hidden text-center font-display text-2xl text-sand-500 sm:block">vs</div>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-cream/10 bg-navy-900 p-4">
          <TeamLine team={t2} />
          <Stepper value={s2} onChange={setS2} max={targetPoints} />
        </div>
      </div>
      {error && <p className={cn("text-center text-sm text-sand-400")}>{error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        {onLive && (
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => onLive(s1, s2)}>
            Match en cours
          </Button>
        )}
        <Button className="flex-1" size="lg" disabled={!!error || busy} onClick={() => onValidate(s1, s2)}>
          Valider le résultat
        </Button>
      </div>
    </div>
  );
}
