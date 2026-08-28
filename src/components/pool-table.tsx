import type { Standing } from "@/lib/engine/ranking";
import type { Team } from "@/lib/server/types";
import { cn } from "@/lib/utils";
import { TeamLine } from "@/components/team-line";

export function PoolTable({
  letter,
  standings,
  teams,
  invert = false,
}: {
  letter: string;
  standings: Standing[];
  teams: Team[];
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        invert ? "border-navy-900/10 bg-white" : "border-cream/10 bg-navy-850",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3",
          invert ? "bg-navy-900 text-cream" : "bg-navy-900/60",
        )}
      >
        <h3 className="font-display text-lg">Poule {letter}</h3>
        <span className={cn("text-xs uppercase tracking-widest", invert ? "text-sand-400" : "text-muted-light")}>
          {standings.length} équipes
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className={cn("text-left text-[11px] uppercase tracking-wider", invert ? "text-navy-500" : "text-muted-light")}>
              <th className="px-3 py-2 font-medium">Rang</th>
              <th className="px-3 py-2 font-medium">Équipe</th>
              <th className="px-2 py-2 text-center font-medium">J</th>
              <th className="px-2 py-2 text-center font-medium">V</th>
              <th className="px-2 py-2 text-center font-medium">D</th>
              <th className="px-2 py-2 text-center font-medium">PP</th>
              <th className="px-2 py-2 text-center font-medium">PC</th>
              <th className="px-2 py-2 text-center font-medium">Diff</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => {
              const team = teams.find((t) => t.id === s.teamId);
              return (
                <tr
                  key={s.teamId}
                  className={cn(
                    "border-t tabular-nums",
                    invert ? "border-navy-900/8" : "border-cream/8",
                    s.qualified && (invert ? "bg-sand-500/15" : "bg-sand-500/10"),
                  )}
                >
                  <td className="px-3 py-2.5 font-display text-base">{s.rank}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <TeamLine team={team} invert={invert} size="sm" />
                      {s.qualified ? (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-sand-400">
                          Qualifiée
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center">{s.played}</td>
                  <td className="px-2 py-2.5 text-center font-medium">{s.wins}</td>
                  <td className="px-2 py-2.5 text-center">{s.losses}</td>
                  <td className="px-2 py-2.5 text-center">{s.pointsFor}</td>
                  <td className="px-2 py-2.5 text-center">{s.pointsAgainst}</td>
                  <td className={cn("px-2 py-2.5 text-center", s.diff > 0 ? "text-success" : s.diff < 0 ? "text-danger" : "")}>
                    {s.diff > 0 ? `+${s.diff}` : s.diff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
