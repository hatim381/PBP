import { Check, CircleDashed, CircleDot, Clock3, Pause } from "lucide-react";
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
  const Icon =
    status === "in_progress" ? CircleDot : status === "finished" || status === "archived" ? Check : Clock3;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="size-3" aria-hidden />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function TeamStatusBadge({ status }: { status: TeamStatus }) {
  const variant =
    status === "validated"
      ? "success"
      : status === "refused" || status === "cancelled"
        ? "danger"
        : status === "waitlist"
          ? "navy"
          : "warn";
  const Icon = status === "validated" ? Check : status === "waitlist" ? Pause : CircleDashed;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="size-3" aria-hidden />
      {TEAM_STATUS_LABELS[status]}
    </Badge>
  );
}

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const variant =
    status === "live" ? "live" : status === "validated" || status === "finished" ? "success" : "outline";
  const Icon = status === "live" ? CircleDot : status === "validated" || status === "finished" ? Check : Clock3;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="size-3" aria-hidden />
      {MATCH_STATUS_LABELS[status]}
    </Badge>
  );
}
