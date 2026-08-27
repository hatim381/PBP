import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, MapPin, Radio, Trophy, Users } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { MatchCard } from "@/components/match-card";
import { TournamentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatLabel } from "@/lib/engine/types";
import { dashboardPublic, getTournamentPublic, listTournaments } from "@/lib/server/api-public";
import { formatDateFr } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [dash, list] = await Promise.all([dashboardPublic(), listTournaments()]);
    return { dash, list };
  },
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  const dash = useQuery({ queryKey: ["dash"], queryFn: () => dashboardPublic(), initialData: initial.dash });
  const list = useQuery({ queryKey: ["tournaments"], queryFn: () => listTournaments(), initialData: initial.list });
  const liveEvent = list.data?.find((t) => t.status === "in_progress") ?? list.data?.find((t) => t.status === "drawn");
  const liveSnap = useQuery({
    queryKey: ["t", liveEvent?.id],
    queryFn: () => getTournamentPublic({ data: { id: liveEvent!.id } }),
    enabled: !!liveEvent,
    refetchInterval: 6000,
  });

  const upcoming = (list.data ?? []).filter((t) =>
    ["registrations_open", "registrations_closed", "draw_pending", "draft"].includes(t.status),
  );
  const archived = (list.data ?? []).filter((t) => t.status === "archived" || t.status === "finished");
  const liveMatches = (liveSnap.data?.matches ?? []).filter((m) => m.status === "live");

  return (
    <PublicShell>
      <section className="court-grain relative overflow-hidden border-b border-cream/10">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-sand-400">Association sportive · Paris 17e</p>
            <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight text-cream sm:text-6xl lg:text-7xl">
              Pétanque
              <br />
              Bohra Paris
            </h1>
            <p className="mt-5 max-w-lg text-base text-cream/75 sm:text-lg">
              Concours, poules, tirage et tableau final — suivis en direct depuis le square des Batignolles.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {liveEvent ? (
                <Button asChild size="lg">
                  <Link to="/concours/$id/live" params={{ id: liveEvent.id }}>
                    Suivre en direct
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link to="/concours">Voir les concours</Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link to="/app">Espace organisateur</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, n: dash.data?.validatedTeams ?? "—", l: "Équipes validées" },
              { icon: Trophy, n: dash.data?.matchesDone ?? "—", l: "Matchs terminés" },
              { icon: Radio, n: dash.data?.matchesLive ?? "—", l: "Matchs en cours" },
              { icon: MapPin, n: dash.data?.courts ?? "—", l: "Terrains" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-cream/10 bg-navy-850/80 p-4">
                <s.icon className="size-4 text-sand-400" />
                <p className="mt-3 font-display text-3xl tabular-nums">{s.n}</p>
                <p className="text-xs text-muted-light">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {liveEvent && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-live">En direct</p>
              <h2 className="font-display text-3xl">{liveEvent.name}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-light">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {formatDateFr(liveEvent.date)}
                </span>
                <span>{formatLabel(liveEvent.teamFormat)}</span>
                <TournamentStatusBadge status={liveEvent.status} />
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/concours/$id" params={{ id: liveEvent.id }}>
                Fiche du concours
              </Link>
            </Button>
          </div>
          {liveMatches.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {liveMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  teams={liveSnap.data?.teams ?? []}
                  courts={liveSnap.data?.courts ?? []}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-cream/15 px-4 py-8 text-center text-sm text-muted-light">
              Aucun match en cours pour le moment. Les scores s'affichent ici dès qu'une partie démarre.
            </p>
          )}
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="font-display text-3xl">À venir</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {upcoming.length === 0 && <p className="text-sm text-muted-light">Aucun concours à venir.</p>}
          {upcoming.map((t) => (
            <Link
              key={t.id}
              to="/concours/$id"
              params={{ id: t.id }}
              className="rounded-2xl border border-cream/10 bg-navy-850 p-5 transition-colors hover:border-sand-500/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl">{t.name}</h3>
                <TournamentStatusBadge status={t.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-light">{t.description}</p>
              <p className="mt-4 flex flex-wrap gap-3 text-xs text-cream/60">
                <span>{formatDateFr(t.date)}</span>
                <span>{t.venueName}</span>
                <span>
                  {t.validatedCount}/{t.maxTeams} équipes
                </span>
                <span>{formatLabel(t.teamFormat)}</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {archived.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="font-display text-3xl">Derniers résultats</h2>
          <div className="mt-5 grid gap-3">
            {archived.map((t) => (
              <Link
                key={t.id}
                to="/concours/$id"
                params={{ id: t.id }}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cream/10 bg-navy-850 px-5 py-4 hover:border-sand-500/30"
              >
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-light">{formatDateFr(t.date)}</p>
                </div>
                <TournamentStatusBadge status={t.status} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </PublicShell>
  );
}
