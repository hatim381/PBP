import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TournamentStatusBadge } from "@/components/status-badge";
import { annualRanking, dashboardPublic, listTournaments } from "@/lib/server/api-public";
import { formatDateShort, fullName } from "@/lib/utils";

export const Route = createFileRoute("/app/statistiques")({ component: Stats });

function Stats() {
  const dash = useQuery({ queryKey: ["dash"], queryFn: () => dashboardPublic() });
  const list = useQuery({ queryKey: ["tournaments"], queryFn: () => listTournaments() });
  const ranking = useQuery({ queryKey: ["annual"], queryFn: () => annualRanking() });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Statistiques</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat n={list.data?.length ?? 0} l="Concours" />
        <Stat n={dash.data?.validatedTeams ?? 0} l="Équipes validées" />
        <Stat n={dash.data?.matchesDone ?? 0} l="Matchs joués" />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="bg-navy-900 text-[11px] uppercase tracking-wider text-muted-light">
            <tr>
              <th className="px-3 py-2 text-left">Concours</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-center">Équipes</th>
              <th className="px-3 py-2 text-center">Matchs</th>
              <th className="px-3 py-2 text-center">Statut</th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((t) => (
              <tr key={t.id} className="border-t border-cream/8">
                <td className="px-3 py-3">
                  <Link to="/app/concours/$id" params={{ id: t.id }} className="hover:text-sand-400">
                    {t.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-muted-light">{formatDateShort(t.date)}</td>
                <td className="px-3 py-3 text-center tabular-nums">{t.validatedCount}</td>
                <td className="px-3 py-3 text-center tabular-nums">
                  {t.matchesDone}/{t.matchCount}
                </td>
                <td className="px-3 py-3 text-center">
                  <TournamentStatusBadge status={t.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2 className="mb-3 font-display text-2xl">Classement annuel</h2>
        <div className="overflow-x-auto rounded-2xl border border-cream/10">
          <table className="w-full min-w-[32rem] text-sm">
            <thead className="bg-navy-900 text-[11px] uppercase tracking-wider text-muted-light">
              <tr>
                <th className="px-3 py-2 text-left">Rang</th>
                <th className="px-3 py-2 text-left">Joueur</th>
                <th className="px-3 py-2 text-center">Participations</th>
                <th className="px-3 py-2 text-center">Victoires</th>
                <th className="px-3 py-2 text-center">Podiums</th>
              </tr>
            </thead>
            <tbody>
              {(ranking.data ?? []).map((row) => (
                <tr key={row.playerId} className="border-t border-cream/8">
                  <td className="px-3 py-2.5 font-display">{row.rank}</td>
                  <td className="px-3 py-2.5">{fullName(row.firstName, row.lastName)}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums">{row.tournaments}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums">{row.wins}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums">{row.podiums}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="rounded-2xl border border-cream/10 bg-navy-900 p-4">
      <p className="font-display text-3xl tabular-nums">{n}</p>
      <p className="text-xs text-muted-light">{l}</p>
    </div>
  );
}
