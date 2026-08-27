import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TournamentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatLabel } from "@/lib/engine/types";
import { listTournaments } from "@/lib/server/api-public";
import { formatDateShort } from "@/lib/utils";

export const Route = createFileRoute("/app/concours/")({ component: ConcoursAdmin });

function ConcoursAdmin() {
  const list = useQuery({ queryKey: ["tournaments"], queryFn: () => listTournaments() });
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Concours</h1>
          <p className="text-sm text-muted-light">Tous les événements du club.</p>
        </div>
        <Button asChild>
          <Link to="/app/concours/nouveau">Nouveau concours</Link>
        </Button>
      </div>
      <div className="grid gap-3">
        {(list.data ?? []).map((t) => (
          <Link
            key={t.id}
            to="/app/concours/$id"
            params={{ id: t.id }}
            className="rounded-2xl border border-cream/10 bg-navy-900 p-5 hover:border-sand-500/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">{t.name}</h2>
                <p className="mt-1 text-sm text-muted-light">{t.description}</p>
              </div>
              <TournamentStatusBadge status={t.status} />
            </div>
            <p className="mt-3 flex flex-wrap gap-4 text-xs text-cream/65">
              <span>{formatDateShort(t.date)}</span>
              <span>{formatLabel(t.teamFormat)}</span>
              <span>
                {t.validatedCount}/{t.maxTeams} équipes
              </span>
              <span>
                {t.matchesDone}/{t.matchCount} matchs
              </span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
