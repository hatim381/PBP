import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { Input } from "@/components/ui/input";
import { listPlayersPublic } from "@/lib/server/api-public";
import { fullName, initials } from "@/lib/utils";

export const Route = createFileRoute("/joueurs")({ component: JoueursPublic });

function JoueursPublic() {
  const [q, setQ] = useState("");
  const list = useQuery({
    queryKey: ["players-public", q],
    queryFn: () => listPlayersPublic({ data: { q } }),
  });

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-sand-400">Annuaire</p>
        <h1 className="mt-2 font-display text-4xl">Joueurs</h1>
        <div className="relative mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-light" />
          <Input
            className="pl-9"
            placeholder="Rechercher un joueur"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(list.data ?? []).map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-cream/10 bg-navy-850 p-4">
              <span className="grid size-11 place-items-center rounded-full bg-sand-500/15 font-display text-sm text-sand-400">
                {initials(p.firstName, p.lastName)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{fullName(p.firstName, p.lastName)}</p>
                <p className="truncate text-xs text-muted-light">{p.club ?? "Club libre"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
