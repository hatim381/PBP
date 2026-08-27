import { createFileRoute } from "@tanstack/react-router";
import { useSnapshot } from "@/hooks/use-snapshot";
import { PoolTable } from "@/components/pool-table";
import { CRITERIA_LABELS } from "@/lib/engine/types";

export const Route = createFileRoute("/concours/$id/classement")({ component: Classement });

function Classement() {
  const { id } = Route.useParams();
  const { data } = useSnapshot(id);
  if (!data) return null;
  if (!data.pools.length) {
    return <p className="text-sm text-muted-light">Le classement sera calculé après le tirage.</p>;
  }
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-light">
        Départage : {data.tournament.rankingCriteria.map((c) => CRITERIA_LABELS[c]).join(" · ")}. Les
        lignes sablées sont qualifiées.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.pools.map((p) => (
          <PoolTable
            key={p.id}
            letter={p.letter}
            standings={data.standings[p.id] ?? []}
            teams={data.teams}
          />
        ))}
      </div>
    </div>
  );
}
