import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MatchCard } from "@/components/match-card";
import { TeamStatusBadge } from "@/components/status-badge";
import { TeamLine } from "@/components/team-line";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTournamentPublic, lookupMyTeam } from "@/lib/server/api-public";

export const Route = createFileRoute("/concours/$id/equipe")({
  component: MonEquipe,
});

function MonEquipe() {
  const { id } = Route.useParams();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const snap = useQuery({
    queryKey: ["t", id],
    queryFn: () => getTournamentPublic({ data: { id } }),
    refetchInterval: 8000,
  });
  const found = useQuery({
    queryKey: ["my-team", id, submitted],
    queryFn: () => lookupMyTeam({ data: { tournamentId: id, query: submitted } }),
    enabled: submitted.length > 0,
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="font-display text-3xl">Mon équipe</h2>
        <p className="mt-1 text-sm text-muted-light">
          Entrez votre numéro d'équipe ou le nom d'un joueur pour voir le prochain match, le terrain et le
          classement.
        </p>
      </div>
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query.trim());
        }}
      >
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="lookup">Numéro ou nom</Label>
          <Input
            id="lookup"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="12 ou Dupont"
          />
        </div>
        <Button type="submit">Rechercher</Button>
      </form>

      {submitted && found.data === null && !found.isFetching ? (
        <p className="rounded-2xl border border-dashed border-cream/15 px-4 py-6 text-sm text-muted-light">
          Aucune équipe ne correspond. Vérifiez le numéro communiqué à l'inscription.
        </p>
      ) : null}

      {found.data ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-cream/10 bg-navy-850 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-sand-400">
                  Équipe n° {found.data.team.number ?? "—"}
                </p>
                <h3 className="mt-1 font-display text-2xl">{found.data.team.name}</h3>
              </div>
              <TeamStatusBadge status={found.data.team.status} />
            </div>
            <div className="mt-4">
              <TeamLine team={found.data.team} />
            </div>
            <p className="mt-3 text-sm text-muted-light">
              {found.data.poolLetter ? `Poule ${found.data.poolLetter}` : "Poule non encore tirée"}
              {found.data.standing
                ? ` · ${found.data.standing.wins} victoire${found.data.standing.wins > 1 ? "s" : ""} · ${found.data.standing.played} matchs`
                : ""}
            </p>
          </div>
          {found.data.nextMatch && snap.data ? (
            <div>
              <h3 className="mb-2 font-display text-xl">Prochain match</h3>
              <MatchCard
                match={found.data.nextMatch}
                teams={snap.data.teams}
                courts={snap.data.courts}
              />
              <p className="mt-2 text-sm text-cream/80">
                Adversaire : {found.data.opponent?.name ?? "à désigner"}
                {found.data.courtName ? ` · ${found.data.courtName}` : ""}
                {found.data.nextMatch.scheduledAt ? ` · ${found.data.nextMatch.scheduledAt}` : ""}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-light">Pas encore de match programmé pour cette équipe.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
