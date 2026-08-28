import { createFileRoute, Link } from "@tanstack/react-router";
import { useSnapshot } from "@/hooks/use-snapshot";
import { MatchCard } from "@/components/match-card";
import { TeamLine } from "@/components/team-line";
import { TeamStatusBadge } from "@/components/status-badge";
import { CRITERIA_LABELS } from "@/lib/engine/types";

export const Route = createFileRoute("/concours/$id/")({ component: Overview });

function Overview() {
  const { id } = Route.useParams();
  const { data } = useSnapshot(id);
  if (!data) return null;
  const { tournament, teams, matches, courts } = data;
  const validated = teams.filter((t) => t.status === "validated");
  const live = matches.filter((m) => m.status === "live").slice(0, 4);
  const winner = teams.find((t) => t.id === tournament.winnerTeamId);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-6">
        {winner && (
          <div className="rounded-2xl border border-sand-500/40 bg-sand-500/10 p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-sand-400">Vainqueur</p>
            <p className="mt-1 font-display text-3xl">{winner.name}</p>
          </div>
        )}
        {live.length > 0 && (
          <div>
            <h2 className="mb-3 font-display text-2xl">En ce moment</h2>
            <div className="grid gap-3">
              {live.map((m) => (
                <MatchCard key={m.id} match={m} teams={teams} courts={courts} />
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl">Équipes</h2>
            <span className="text-sm text-muted-light">
              {validated.length} / {tournament.maxTeams}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between gap-3 rounded-xl border border-cream/10 bg-navy-850 px-4 py-3">
                <TeamLine team={team} size="sm" />
                <TeamStatusBadge status={team.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-cream/10 bg-navy-850 p-5">
          <h3 className="font-display text-xl">Règlement</h3>
          <p className="mt-2 text-sm text-muted-light">{tournament.rules || "Règlement standard PBP."}</p>
          <ul className="mt-4 space-y-1.5 text-sm text-cream/75">
            <li>Format {tournament.teamFormat.replaceAll("_", "-")}</li>
            <li>{tournament.qualifiedPerGroup} qualifié{tournament.qualifiedPerGroup > 1 ? "s" : ""} par poule</li>
            <li>Départage :</li>
            {tournament.rankingCriteria.map((c) => (
              <li key={c} className="pl-3 text-muted-light">
                {CRITERIA_LABELS[c]}
              </li>
            ))}
          </ul>
        </div>
        {tournament.status === "registrations_open" ? (
          <Link
            to="/concours/$id/inscription"
            params={{ id }}
            className="block rounded-2xl border border-sand-500/30 bg-sand-500/10 px-5 py-4 text-sm text-sand-300 hover:bg-sand-500/15"
          >
            Inscrire une équipe — {validated.length}/{tournament.maxTeams} places
          </Link>
        ) : null}
        <Link
          to="/concours/$id/live"
          params={{ id }}
          className="block rounded-2xl border border-sand-500/30 bg-sand-500/10 px-5 py-4 text-sm text-sand-300 hover:bg-sand-500/15"
        >
          Ouvrir le suivi en direct
        </Link>
        <Link
          to="/concours/$id/equipe"
          params={{ id }}
          className="block rounded-2xl border border-cream/10 px-5 py-4 text-sm text-cream/80 hover:border-sand-500/30"
        >
          Retrouver mon équipe, mon terrain et mon prochain match
        </Link>
      </aside>
    </div>
  );
}
