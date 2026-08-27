import { createFileRoute } from "@tanstack/react-router";
import { useSnapshot } from "@/hooks/use-snapshot";
import { PoolTable } from "@/components/pool-table";
import { TeamLine } from "@/components/team-line";

export const Route = createFileRoute("/concours/$id/poules")({ component: Poules });

function Poules() {
  const { id } = Route.useParams();
  const { data } = useSnapshot(id);
  if (!data) return null;
  if (!data.pools.length) {
    return <p className="text-sm text-muted-light">Les poules seront affichées après le tirage au sort.</p>;
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {data.pools.map((p) => (
        <div key={p.id} className="space-y-3">
          <PoolTable letter={p.letter} standings={data.standings[p.id] ?? []} teams={data.teams} />
          <div className="flex flex-wrap gap-2">
            {p.teamIds.map((tid) => {
              const team = data.teams.find((t) => t.id === tid);
              return (
                <div key={tid} className="rounded-lg border border-cream/10 px-3 py-2">
                  <TeamLine team={team} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
