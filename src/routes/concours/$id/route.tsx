import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { TournamentStatusBadge } from "@/components/status-badge";
import { formatLabel } from "@/lib/engine/types";
import { getTournamentPublic } from "@/lib/server/api-public";
import { cn, formatDateFr } from "@/lib/utils";

export const Route = createFileRoute("/concours/$id")({
  component: TournamentLayout,
});

function TournamentLayout() {
  const { id } = Route.useParams();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const q = useQuery({
    queryKey: ["t", id],
    queryFn: () => getTournamentPublic({ data: { id } }),
    refetchInterval: 8000,
  });
  const t = q.data?.tournament;

  const tabs = [
    { to: `/concours/${id}`, label: "Aperçu", exact: true },
    { to: `/concours/${id}/live`, label: "Direct" },
    { to: `/concours/${id}/poules`, label: "Poules" },
    { to: `/concours/${id}/matchs`, label: "Matchs" },
    { to: `/concours/${id}/classement`, label: "Classement" },
    { to: `/concours/${id}/tableau`, label: "Tableau" },
  ];

  return (
    <PublicShell>
      <div className="border-b border-cream/10 bg-navy-850/50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {t ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-sand-400">{t.venueName}</p>
                  <h1 className="mt-1 font-display text-4xl">{t.name}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-light">{t.description}</p>
                </div>
                <TournamentStatusBadge status={t.status} />
              </div>
              <p className="mt-4 flex flex-wrap gap-4 text-sm text-cream/70">
                <span>{formatDateFr(t.date)} {t.startTime ? `· ${t.startTime}` : ""}</span>
                <span>{formatLabel(t.teamFormat)}</span>
                <span>{t.courtCount} terrains</span>
                <span>Parties en {t.targetPoints} points</span>
              </p>
            </>
          ) : (
            <div className="h-24 animate-pulse rounded-xl bg-cream/8" />
          )}
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {tabs.map((tab) => {
            const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium",
                  active ? "bg-sand-500 text-navy-900" : "text-cream/70 hover:bg-cream/8",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {q.data ? <Outlet /> : <p className="text-sm text-muted-light">Chargement…</p>}
      </div>
    </PublicShell>
  );
}
