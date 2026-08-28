import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import { TournamentStatusBadge } from "@/components/status-badge";
import { formatLabel, type TeamFormat, type TournamentStatus } from "@/lib/engine/types";
import { formatDateFr } from "@/lib/utils";

export type ListedTournament = {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  startTime: string | null;
  venueName: string | null;
  teamFormat: TeamFormat;
  maxTeams: number;
  validatedCount: number;
  status: TournamentStatus;
  matchesLive?: number;
};

export function TournamentCard({ t }: { t: ListedTournament }) {
  return (
    <Link
      to="/concours/$id"
      params={{ id: t.id }}
      className="block rounded-2xl border border-cream/10 bg-navy-850 p-5 transition-colors hover:border-sand-500/40"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl">{t.name}</h3>
          {t.description ? <p className="mt-1 line-clamp-2 text-sm text-muted-light">{t.description}</p> : null}
        </div>
        <TournamentStatusBadge status={t.status} />
      </div>
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream/65">
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3.5" aria-hidden />
          {formatDateFr(t.date)}
          {t.startTime ? ` · ${t.startTime}` : ""}
        </span>
        {t.venueName ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {t.venueName}
          </span>
        ) : null}
        <span>{formatLabel(t.teamFormat)}</span>
        <span className="inline-flex items-center gap-1">
          <Users className="size-3.5" aria-hidden />
          {t.validatedCount}/{t.maxTeams} équipes
        </span>
        {t.status === "registrations_open" ? <span>Inscriptions ouvertes</span> : null}
        {(t.matchesLive ?? 0) > 0 ? <span className="text-live">{t.matchesLive} matchs en cours</span> : null}
      </p>
    </Link>
  );
}
