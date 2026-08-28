import { createFileRoute } from "@tanstack/react-router";
import { useSnapshot } from "@/hooks/use-snapshot";
import { CourtBoard } from "@/components/court-board";
import { MatchCard } from "@/components/match-card";
import { PoolTable } from "@/components/pool-table";

export const Route = createFileRoute("/concours/$id/live")({ component: Live });

function Live() {
  const { id } = Route.useParams();
  const { data } = useSnapshot(id, 5000);
  if (!data) {
    return <p className="text-sm text-muted-light">Chargement du direct…</p>;
  }
  const live = data.matches.filter((m) => m.status === "live");
  const upcoming = data.matches.filter((m) => m.status === "upcoming").slice(0, 6);
  const recent = data.matches.filter((m) => m.status === "validated" || m.status === "finished").slice(-6).reverse();

  return (
    <div className="space-y-10">
      <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-live">
        <span className="size-1.5 animate-pulse rounded-full bg-live" />
        Mise à jour automatique
      </p>
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
      {data.courts.length > 0 && data.matches.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl">Terrains</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.courts.map((court) => {
              const current = data.matches.find((m) => m.courtId === court.id && m.status === "live");
              const t1 = current ? data.teams.find((t) => t.id === current.team1Id) : null;
              const t2 = current ? data.teams.find((t) => t.id === current.team2Id) : null;
              return (
                <div key={court.id} className="rounded-2xl border border-cream/10 bg-navy-850 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-light">{court.name}</p>
                  {current ? (
                    <div className="mt-2">
                      <p className="text-sm font-medium">{t1?.name ?? "—"} vs {t2?.name ?? "—"}</p>
                      <p className="score-digit mt-1 font-display text-2xl tabular-nums text-live">
                        {current.score1 ?? "–"} : {current.score2 ?? "–"}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-light">Libre</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section>
        <h2 className="mb-4 font-display text-2xl">Terrains</h2>
        <CourtBoard courts={data.courts} matches={data.matches} teams={data.teams} />
      </section>
      <section>
        <h2 className="mb-4 font-display text-2xl">Poules</h2>
        {data.pools.length === 0 ? (
          <p className="text-sm text-muted-light">Les poules apparaîtront après le tirage.</p>
        ) : (
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
        )}
      </section>
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-2xl">À venir</h2>
          <div className="grid gap-3">
            {upcoming.length === 0 && <p className="text-sm text-muted-light">Rien de programmé.</p>}
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} teams={data.teams} courts={data.courts} compact />
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 font-display text-2xl">Derniers résultats</h2>
          <div className="grid gap-3">
            {recent.length === 0 && <p className="text-sm text-muted-light">Pas encore de résultat.</p>}
            {recent.map((m) => (
              <MatchCard key={m.id} match={m} teams={data.teams} courts={data.courts} compact />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
