import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/empty-state";
import { PublicShell } from "@/components/layout/public-shell";
import { TournamentCard } from "@/components/tournament-card";
import { Button } from "@/components/ui/button";
import { listTournaments, type ListedTournament } from "@/lib/server/api-public";

export const Route = createFileRoute("/concours/")({
  loader: async () => listTournaments(),
  component: ConcoursList,
});

function ConcoursList() {
  const initial = Route.useLoaderData();
  const list = useQuery({
    queryKey: ["tournaments"],
    queryFn: (): ReturnType<typeof listTournaments> => listTournaments(),
    initialData: initial,
  });
  const rows: ListedTournament[] = list.data ?? [];

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-sand-400">Calendrier</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Concours</h1>
        <p className="mt-2 max-w-xl text-muted-light">
          Date, heure, lieu, format, places et statut des inscriptions — du tirage au vainqueur.
        </p>
        <div className="mt-8 grid gap-4">
          {rows.length === 0 ? (
            <EmptyState
              title="Aucun concours programmé pour le moment."
              body="Le prochain concours apparaîtra ici avec les inscriptions, le tirage et le suivi des matchs."
              actions={
                <Button asChild variant="outline">
                  <Link to="/resultats">Voir les anciens concours</Link>
                </Button>
              }
            />
          ) : (
            rows.map((t) => <TournamentCard key={t.id} t={t} />)
          )}
        </div>
      </div>
    </PublicShell>
  );
}
