import type { Team } from "@/lib/server/types";
import { cn, fullName } from "@/lib/utils";

export function TeamLine({
  team,
  invert = false,
  size = "md",
  align = "start",
}: {
  team: Team | undefined;
  invert?: boolean;
  size?: "sm" | "md";
  align?: "start" | "end";
}) {
  if (!team) {
    return <span className={cn("italic", invert ? "text-navy-500" : "text-muted-light")}>À déterminer</span>;
  }
  return (
    <span className={cn("flex min-w-0 flex-col", align === "end" && "items-end text-right")}>
      <span className={cn("truncate font-medium", size === "sm" ? "text-sm" : "text-base")}>
        {team.number ? <span className="mr-1.5 font-mono text-xs text-sand-500">#{team.number}</span> : null}
        {team.name}
      </span>
      <span className={cn("truncate text-xs", invert ? "text-navy-600" : "text-muted-light")}>
        {team.players.map((p) => fullName(p.firstName, p.lastName)).join(" · ")}
      </span>
    </span>
  );
}
