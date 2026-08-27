import { MapPin } from "lucide-react";
import { MatchStatusBadge } from "@/components/status-badge";
import { TeamLine } from "@/components/team-line";
import { PHASE_LABELS } from "@/lib/engine/types";
import type { Court, Match, Team } from "@/lib/server/types";
import { cn } from "@/lib/utils";

export function MatchCard({
  match,
  teams,
  courts,
  onClick,
  compact = false,
}: {
  match: Match;
  teams: Team[];
  courts: Court[];
  onClick?: () => void;
  compact?: boolean;
}) {
  const t1 = teams.find((t) => t.id === match.team1Id);
  const t2 = teams.find((t) => t.id === match.team2Id);
  const court = courts.find((c) => c.id === match.courtId);
  const live = match.status === "live";
  const done = match.status === "validated" || match.status === "finished";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition-colors",
        live
          ? "border-live/40 bg-live/8"
          : "border-cream/10 bg-navy-850 hover:border-sand-500/30",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted-light">
          {match.phase === "pool" ? `Poule · Tour ${match.roundIndex}` : PHASE_LABELS[match.phase]}
        </span>
        <MatchStatusBadge status={match.status} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0">
          {t1 ? <TeamLine team={t1} size={compact ? "sm" : "md"} /> : <span className="text-sm italic text-muted-light">{match.placeholder1 ?? "—"}</span>}
        </div>
        <div className="flex min-w-[4.5rem] flex-col items-center">
          <div className={cn("score-digit font-display text-3xl font-semibold tabular-nums", live && "text-live")}>
            {match.score1 ?? "–"}
            <span className="mx-1 text-lg text-muted-light">:</span>
            {match.score2 ?? "–"}
          </div>
        </div>
        <div className="min-w-0 text-right">
          {t2 ? (
            <TeamLine team={t2} size={compact ? "sm" : "md"} align="end" />
          ) : (
            <span className="text-sm italic text-muted-light">{match.placeholder2 ?? "—"}</span>
          )}
        </div>
      </div>
      {(court || match.scheduledAt || done) && (
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-light">
          {court && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {court.name}
            </span>
          )}
          {match.scheduledAt && <span>{match.scheduledAt}</span>}
        </div>
      )}
    </button>
  );
}
