import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { TournamentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
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
  const open = t?.status === "registrations_open";

  const tabs = [
    { to: "/concours/$id" as const, label: "Aperçu", suffix: "" },
    { to: "/concours/$id/live" as const, label: "Direct", suffix: "/live" },
    { to: "/concours/$id/poules" as const, label: "Poules", suffix: "/poules" },
    { to: "/concours/$id/matchs" as const, label: "Matchs", suffix: "/matchs" },
    { to: "/concours/$id/classement" as const, label: "Classement", suffix: "/classement" },
    { to: "/concours/$id/tableau" as const, label: "Tableau", suffix: "/tableau" },
    { to: "/concours/$id/equipe" as const, label: "Mon équipe", suffix: "/equipe" },
  ];

  return (
    <PublicShell tournamentId={id}>
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
                <div className="flex flex-wrap items-center gap-2">
                  <TournamentStatusBadge status={t.status} />
                  {open ? (
                    <Button asChild>
                      <Link to="/concours/$id/inscription" params={{ id }}>
                        Inscrire une équipe
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className="mt-4 flex flex-wrap gap-4 text-sm text-cream/70">
                <span>
                  {formatDateFr(t.date)} {t.startTime ? `· ${t.startTime}` : ""}
                </span>
                <span>{formatLabel(t.teamFormat)}</span>
                <span>{t.courtCount} terrains</span>
                <span>Parties en {t.targetPoints} points</span>
                <span>
                  {t.maxTeams} équipes maximum
                </span>
              </p>
            </>
          ) : (
            <div className="h-24 animate-pulse rounded-xl bg-cream/8" />
          )}
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {tabs.map((tab) => {
            const base = `/concours/${id}`;
            const target = `${base}${tab.suffix}`;
            const active = tab.suffix === "" ? pathname === base || pathname === `${base}/` : pathname.startsWith(target);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                params={{ id }}
                className={cn(
                  "min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-medium",
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
