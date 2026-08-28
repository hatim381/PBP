import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/empty-state";
import { PublicShell } from "@/components/layout/public-shell";
import { TournamentCard } from "@/components/tournament-card";
import { Button } from "@/components/ui/button";
import { annualRanking, listTournaments, type AnnualRankingRow, type ListedTournament } from "@/lib/server/api-public";
import { fullName } from "@/lib/utils";

export const Route = createFileRoute("/resultats")({
  loader: async () => {
    const [list, ranking] = await Promise.all([listTournaments(), annualRanking()]);
    return { list, ranking };
  },
  component: Resultats,
});

function Resultats() {
  const initial = Route.useLoaderData();
  const list = useQuery({
    queryKey: ["tournaments"],
    queryFn: (): ReturnType<typeof listTournaments> => listTournaments(),
    initialData: initial.list,
  });
  const ranking = useQuery({
    queryKey: ["annual"],
    queryFn: (): ReturnType<typeof annualRanking> => annualRanking(),
    initialData: initial.ranking,
  });
  const rows: ListedTournament[] = list.data ?? [];
  const rankingRows: AnnualRankingRow[] = ranking.data ?? [];
  const archived = rows.filter((t) => t.status === "archived" || t.status === "finished");

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-sand-400">Mémoire du club</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Résultats</h1>
        <p className="mt-2 max-w-xl text-muted-light">
          Historique des concours, vainqueurs et classement des joueurs sur l'ensemble des épreuves.
        </p>

        <section className="mt-10">
          <h2 className="font-display text-2xl">Classement des joueurs</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-cream/10">
            <table className="w-full min-w-[32rem] text-sm">
              <thead className="bg-navy-850 text-[11px] uppercase tracking-wider text-muted-light">
                <tr>
                  <th className="px-3 py-2 text-left">Rang</th>
                  <th className="px-3 py-2 text-left">Joueur</th>
                  <th className="px-3 py-2 text-center">Participations</th>
                  <th className="px-3 py-2 text-center">Victoires</th>
                  <th className="px-3 py-2 text-center">Podiums</th>
                </tr>
              </thead>
              <tbody>
                {rankingRows.map((row) => (
                  <tr key={row.playerId} className="border-t border-cream/8">
                    <td className="px-3 py-2.5 font-display">{row.rank}</td>
                    <td className="px-3 py-2.5">
                      {fullName(row.firstName, row.lastName)}
                      <span className="ml-2 text-xs text-muted-light">{row.club}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums">{row.tournaments}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums">{row.wins}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums">{row.podiums}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl">Anciens concours</h2>
          <div className="mt-4 grid gap-3">
            {archived.length === 0 ? (
              <EmptyState
                title="Pas encore d'archive"
                body="Les concours terminés restent consultables ici, avec poules, matchs et classements."
                actions={
                  <Button asChild variant="outline">
                    <Link to="/concours">Voir les concours</Link>
                  </Button>
                }
              />
            ) : (
              archived.map((t) => <TournamentCard key={t.id} t={t} />)
            )}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
