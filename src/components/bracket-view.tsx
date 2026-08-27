import { Trophy } from "lucide-react";
import { PHASE_LABELS, type MatchPhase } from "@/lib/engine/types";
import type { Match, Team } from "@/lib/server/types";
import { cn } from "@/lib/utils";

const ORDER: MatchPhase[] = ["round_of_16", "quarter", "semi", "final"];

function Slot({
  name,
  score,
  winner,
}: {
  name: string;
  score: number | null;
  winner?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm",
        winner ? "bg-sand-500 text-navy-900" : "bg-navy-950/50 text-cream",
      )}
    >
      <span className="truncate font-medium">{name}</span>
      <span className="score-digit tabular-nums">{score ?? "–"}</span>
    </div>
  );
}

export function BracketView({ matches, teams }: { matches: Match[]; teams: Team[] }) {
  const ko = matches.filter((m) => m.phase !== "pool");
  if (!ko.length) {
    return (
      <div className="rounded-2xl border border-dashed border-cream/15 p-8 text-center text-sm text-muted-light">
        Le tableau final sera généré une fois les poules terminées.
      </div>
    );
  }
  const rounds = ORDER.filter((p) => ko.some((m) => m.phase === p));
  const winnerMatch = ko.find((m) => m.phase === "final" && m.winnerId);
  const winner = teams.find((t) => t.id === winnerMatch?.winnerId);

  function label(id: string | null, placeholder: string | null) {
    const team = teams.find((t) => t.id === id);
    return team ? team.name : placeholder ?? "À déterminer";
  }

  return (
    <div className="space-y-6">
      {winner && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-sand-500/40 bg-sand-500/10 px-5 py-4">
          <Trophy className="size-5 text-sand-400" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-sand-400">Vainqueur du concours</p>
            <p className="font-display text-2xl text-cream">{winner.name}</p>
          </div>
        </div>
      )}
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-8">
          {rounds.map((phase) => {
            const list = ko.filter((m) => m.phase === phase).sort((a, b) => (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0));
            return (
              <div key={phase} className="flex w-64 flex-col justify-around gap-4">
                <p className="text-center text-[11px] uppercase tracking-[0.18em] text-muted-light">
                  {PHASE_LABELS[phase]}
                </p>
                {list.map((m) => {
                  const done = m.status === "validated" || m.status === "finished";
                  return (
                    <div key={m.id} className="rounded-xl border border-cream/10 bg-navy-850 p-2">
                      <Slot
                        name={label(m.team1Id, m.placeholder1)}
                        score={m.score1}
                        winner={done && m.winnerId === m.team1Id}
                      />
                      <div className="h-1" />
                      <Slot
                        name={label(m.team2Id, m.placeholder2)}
                        score={m.score2}
                        winner={done && m.winnerId === m.team2Id}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
