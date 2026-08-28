import { CircleDot, Clock3, MapPin } from "lucide-react";
import { buildCourtBoard, teamName } from "@/lib/court-board";
import type { Court, Match, Team } from "@/lib/server/types";
import { cn } from "@/lib/utils";

const STATE_LABEL = {
  live: "Match en cours",
  upcoming: "Prochain match",
  free: "Disponible",
} as const;

export function CourtBoard({
  courts,
  matches,
  teams,
}: {
  courts: Court[];
  matches: Match[];
  teams: Team[];
}) {
  const rows = buildCourtBoard(courts, matches);
  if (!rows.length) {
    return <p className="text-sm text-muted-light">Aucun terrain configuré pour ce concours.</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => {
        const match = row.current ?? row.next;
        return (
          <article
            key={row.court.id}
            className={cn(
              "rounded-2xl border p-4",
              row.state === "live"
                ? "border-live/40 bg-live/8"
                : row.state === "upcoming"
                  ? "border-sand-500/30 bg-navy-850"
                  : "border-cream/10 bg-navy-850",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-2 font-display text-xl">
                <MapPin className="size-4 text-sand-400" aria-hidden />
                {row.court.name}
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] uppercase tracking-wide",
                  row.state === "live"
                    ? "bg-live/20 text-live"
                    : row.state === "upcoming"
                      ? "bg-sand-500/15 text-sand-400"
                      : "bg-success/15 text-success-fg",
                )}
              >
                {row.state === "live" ? (
                  <CircleDot className="size-3" aria-hidden />
                ) : (
                  <Clock3 className="size-3" aria-hidden />
                )}
                {STATE_LABEL[row.state]}
              </span>
            </div>
            {match ? (
              <p className="mt-3 text-sm text-cream/85">
                {teamName(teams, match.team1Id)}
                <span className="mx-1.5 text-muted-light">–</span>
                {teamName(teams, match.team2Id)}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-light">Aucun match affecté.</p>
            )}
            <p className="mt-2 text-xs text-muted-light">
              {match?.scheduledAt ? `Heure ${match.scheduledAt}` : `${row.doneCount} match${row.doneCount > 1 ? "s" : ""} terminé${row.doneCount > 1 ? "s" : ""}`}
            </p>
          </article>
        );
      })}
    </div>
  );
}
