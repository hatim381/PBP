import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/empty-state";
import { PublicShell } from "@/components/layout/public-shell";
import { TournamentCard } from "@/components/tournament-card";
import { Button } from "@/components/ui/button";
import { listTournaments, type ListedTournament } from "@/lib/server/api-public";

export const Route = createFileRoute("/inscriptions")({
  loader: () => listTournaments(),
  component: Inscriptions,
});

function Inscriptions() {
  const initial = Route.useLoaderData();
  const list = useQuery({
    queryKey: ["tournaments"],
    queryFn: (): ReturnType<typeof listTournaments> => listTournaments(),
    initialData: initial,
  });
  const rows: ListedTournament[] = list.data ?? [];
  const open = rows.filter((t) => t.status === "registrations_open");

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-sand-400">Joueurs</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Inscriptions</h1>
        <p className="mt-2 max-w-xl text-muted-light">
          Choisissez un concours ouvert, indiquez votre format d'équipe, puis vérifiez votre numéro après validation.
        </p>
        <div className="mt-8 grid gap-4">
          {open.length === 0 ? (
            <EmptyState
              title="Aucune inscription ouverte"
              body="Dès qu'un concours ouvre ses inscriptions, il apparaîtra ici avec la date, le lieu et le format."
              actions={
                <Button asChild variant="outline">
                  <Link to="/concours">Voir tous les concours</Link>
                </Button>
              }
            />
          ) : (
            open.map((t) => (
              <div key={t.id} className="space-y-2">
                <TournamentCard t={t} />
                <Button asChild>
                  <Link to="/concours/$id/inscription" params={{ id: t.id }}>
                    Inscrire mon équipe
                  </Link>
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </PublicShell>
  );
}
