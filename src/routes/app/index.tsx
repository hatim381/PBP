import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Dices, Radio, Trophy, Users } from "lucide-react";
import { TournamentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { dashboardPublic, listTournaments } from "@/lib/server/api-public";
import { getMe } from "@/lib/server/api-staff";
import { formatDateShort } from "@/lib/utils";

export const Route = createFileRoute("/app/")({ component: Dashboard });

const STEPS = [
  "Créer le concours",
  "Ouvrir les inscriptions",
  "Valider les équipes",
  "Clôturer les inscriptions",
  "Configurer les poules",
  "Effectuer le tirage",
  "Lancer les matchs",
  "Saisir les résultats",
  "Générer la phase finale",
  "Clôturer le concours",
];

function Dashboard() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const dash = useQuery({ queryKey: ["dash"], queryFn: () => dashboardPublic() });
  const list = useQuery({ queryKey: ["tournaments"], queryFn: () => listTournaments() });
  const live = (list.data ?? []).filter((t) =>
    ["in_progress", "drawn", "draw_pending", "registrations_open"].includes(t.status),
  );

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
          <Link to="/app/concours/nouveau">Nouveau concours</Link>
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
            <s.icon className="size-4 text-sand-400" />
            <p className="mt-3 font-display text-3xl tabular-nums">{s.n}</p>
            <p className="text-xs text-muted-light">{s.l}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 font-display text-2xl">Concours en cours</h2>
        <div className="grid gap-3">
          {live.length === 0 && (
            <p className="text-sm text-muted-light">Aucun concours actif. Créez-en un pour commencer.</p>
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
                  {formatDateShort(t.date)} · {t.validatedCount}/{t.maxTeams} équipes · {t.matchesDone}/{t.matchCount} matchs
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

      <section className="rounded-2xl border border-cream/10 bg-navy-900 p-5">
        <h2 className="font-display text-2xl">Parcours organisateur</h2>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-3 text-sm text-cream/80">
              <span className="grid size-7 place-items-center rounded-full bg-sand-500/15 font-mono text-xs text-sand-400">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
