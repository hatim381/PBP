import { createFileRoute } from "@tanstack/react-router";
import { useSnapshot } from "@/hooks/use-snapshot";
import { MatchCard } from "@/components/match-card";
import { PoolTable } from "@/components/pool-table";

export const Route = createFileRoute("/concours/$id/live")({ component: Live });

function Live() {
  const { id } = Route.useParams();
  const { data } = useSnapshot(id, 5000);
  if (!data) return null;
  const live = data.matches.filter((m) => m.status === "live");
  const upcoming = data.matches.filter((m) => m.status === "upcoming").slice(0, 6);
  const recent = data.matches.filter((m) => m.status === "validated" || m.status === "finished").slice(-6).reverse();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 font-display text-2xl">Matchs en cours</h2>
        {live.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-cream/15 px-4 py-8 text-center text-sm text-muted-light">
            Aucune partie en cours. Cette vue se met à jour automatiquement.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} teams={data.teams} courts={data.courts} />
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="mb-4 font-display text-2xl">Poules</h2>
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
      </section>
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-2xl">À venir</h2>
          <div className="grid gap-3">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} teams={data.teams} courts={data.courts} compact />
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 font-display text-2xl">Derniers résultats</h2>
          <div className="grid gap-3">
            {recent.map((m) => (
              <MatchCard key={m.id} match={m} teams={data.teams} courts={data.courts} compact />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
