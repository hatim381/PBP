import { Badge } from "@/components/ui/badge";
import {
  MATCH_STATUS_LABELS,
  STATUS_LABELS,
  TEAM_STATUS_LABELS,
  type MatchStatus,
  type TeamStatus,
  type TournamentStatus,
} from "@/lib/engine/types";

export function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  const variant =
    status === "in_progress"
      ? "live"
      : status === "registrations_open"
        ? "success"
        : status === "archived" || status === "finished"
          ? "navy"
          : status === "draw_pending" || status === "drawn"
            ? "warn"
            : "default";
  return <Badge variant={variant}>{STATUS_LABELS[status]}</Badge>;
}

export function TeamStatusBadge({ status }: { status: TeamStatus }) {
  const variant =
    status === "validated" ? "success" : status === "refused" || status === "cancelled" ? "danger" : "warn";
  return <Badge variant={variant}>{TEAM_STATUS_LABELS[status]}</Badge>;
}

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const variant =
    status === "live" ? "live" : status === "validated" || status === "finished" ? "success" : "outline";
  return <Badge variant={variant}>{MATCH_STATUS_LABELS[status]}</Badge>;
}
