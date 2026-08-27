import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { TournamentStatusBadge } from "@/components/status-badge";
import { formatLabel } from "@/lib/engine/types";
import { listTournaments } from "@/lib/server/api-public";
import { formatDateFr } from "@/lib/utils";

export const Route = createFileRoute("/concours/")({
  loader: async () => listTournaments(),
  component: ConcoursList,
});

function ConcoursList() {
  const initial = Route.useLoaderData();
  const list = useQuery({ queryKey: ["tournaments"], queryFn: () => listTournaments(), initialData: initial });

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-sand-400">Calendrier</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Concours</h1>
        <p className="mt-2 max-w-xl text-muted-light">
          Poules, matchs et classements de l'association — du brouillon à l'archive.
        </p>
        <div className="mt-8 grid gap-4">
          {(list.data ?? []).map((t) => (
            <Link
              key={t.id}
              to="/concours/$id"
              params={{ id: t.id }}
              className="rounded-2xl border border-cream/10 bg-navy-850 p-5 transition-colors hover:border-sand-500/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl">{t.name}</h2>
                  <p className="mt-1 text-sm text-muted-light">{t.description}</p>
                </div>
                <TournamentStatusBadge status={t.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-cream/65">
                <span>{formatDateFr(t.date)}</span>
                <span>{t.venueName}</span>
                <span>{formatLabel(t.teamFormat)}</span>
                <span>
                  {t.validatedCount}/{t.maxTeams} équipes
                </span>
                {t.matchesLive > 0 && <span className="text-live">{t.matchesLive} en cours</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
