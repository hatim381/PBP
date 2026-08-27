import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSnapshot } from "@/hooks/use-snapshot";
import { MatchCard } from "@/components/match-card";
import { PHASE_LABELS, type MatchPhase } from "@/lib/engine/types";

export const Route = createFileRoute("/concours/$id/matchs")({ component: Matchs });

function Matchs() {
  const { id } = Route.useParams();
  const { data } = useSnapshot(id);
  const [phase, setPhase] = useState<"all" | MatchPhase>("all");
  const matches = useMemo(() => {
    if (!data) return [];
    return phase === "all" ? data.matches : data.matches.filter((m) => m.phase === phase);
  }, [data, phase]);
  if (!data) return null;
  const phases = Array.from(new Set(data.matches.map((m) => m.phase)));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPhase("all")}
          className={`rounded-full px-3 py-1.5 text-sm ${phase === "all" ? "bg-sand-500 text-navy-900" : "bg-cream/8"}`}
        >
          Tous
        </button>
        {phases.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPhase(p)}
            className={`rounded-full px-3 py-1.5 text-sm ${phase === p ? "bg-sand-500 text-navy-900" : "bg-cream/8"}`}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} teams={data.teams} courts={data.courts} />
        ))}
      </div>
    </div>
  );
}
