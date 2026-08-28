import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Dices, MapPin, Plus, Radio, Trophy, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { TournamentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { dashboardPublic, listTournaments } from "@/lib/server/api-public";
import { getMe } from "@/lib/server/api-staff";
import { formatDateShort } from "@/lib/utils";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function Dashboard() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const dash = useQuery({ queryKey: ["dash"], queryFn: () => dashboardPublic() });
  const list = useQuery({ queryKey: ["tournaments"], queryFn: () => listTournaments() });
  const live = (list.data ?? []).filter((t) =>
    ["in_progress", "drawn", "draw_pending", "registrations_open"].includes(t.status),
  );
  const active = live[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-sand-400">PBP Concours</p>
          <h1 className="font-display text-4xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-light">
            {me.data ? `${me.data.displayName ?? "Organisateur"} · ${me.data.role}` : "Espace club"}
          </p>
        </div>
        <Button asChild>
          <Link to="/app/concours/nouveau">
            <Plus className="size-4" /> Nouveau concours
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Users, n: dash.data?.validatedTeams ?? "—", l: "Équipes inscrites" },
          { icon: Trophy, n: dash.data?.matchesDone ?? "—", l: "Matchs terminés" },
          { icon: Radio, n: dash.data?.matchesLive ?? "—", l: "En cours" },
          { icon: Dices, n: dash.data?.activeTournaments ?? "—", l: "Concours actifs" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-cream/10 bg-navy-900 p-4">
            <s.icon className="size-4 text-sand-400" aria-hidden />
            <p className="mt-3 font-display text-3xl tabular-nums">{s.n}</p>
            <p className="text-xs text-muted-light">{s.l}</p>
          </div>
        ))}
      </div>

      {active ? (
        <section className="rounded-2xl border border-sand-500/25 bg-navy-900 p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-sand-400">Concours actif</p>
          <h2 className="mt-1 font-display text-2xl">{active.name}</h2>
          <p className="mt-1 text-sm text-muted-light">
            {active.validatedCount} équipes · {active.matchesDone}/{active.matchCount} matchs · {active.matchesLive} en
            cours
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/app/concours/$id" params={{ id: active.id }}>
                <Plus className="size-4" /> Ajouter une équipe
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/concours/$id" params={{ id: active.id }}>
                <Dices className="size-4" /> Lancer le tirage
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/concours/$id/live" params={{ id: active.id }}>
                <MapPin className="size-4" /> Gérer les terrains
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/concours/$id/classement" params={{ id: active.id }}>
                Voir les résultats
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-display text-2xl">Concours en cours</h2>
        <div className="grid gap-3">
          {live.length === 0 && (
            <EmptyState
              title="Aucun concours actif"
              body="Créez un concours, ouvrez les inscriptions, puis enchaînez tirage, scores et tableau final."
              actions={
                <Button asChild>
                  <Link to="/app/concours/nouveau">Créer un concours</Link>
                </Button>
              }
            />
          )}
          {live.map((t) => (
            <Link
              key={t.id}
              to="/app/concours/$id"
              params={{ id: t.id }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cream/10 bg-navy-900 p-5 hover:border-sand-500/40"
            >
              <div>
                <p className="font-display text-xl">{t.name}</p>
                <p className="text-xs text-muted-light">
                  {formatDateShort(t.date)} · {t.validatedCount}/{t.maxTeams} équipes · {t.matchesDone}/{t.matchCount}{" "}
                  matchs
                </p>
              </div>
              <div className="flex items-center gap-3">
                <TournamentStatusBadge status={t.status} />
                <ArrowRight className="size-4 text-sand-400" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
