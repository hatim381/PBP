import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Dices, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BracketView } from "@/components/bracket-view";
import { MatchCard } from "@/components/match-card";
import { PoolTable } from "@/components/pool-table";
import { ScorePad } from "@/components/score-pad";
import { MatchStatusBadge, TeamStatusBadge, TournamentStatusBadge } from "@/components/status-badge";
import { TeamLine } from "@/components/team-line";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  confirmDraw,
  createTeam,
  deleteTeam,
  generateFinals,
  getMe,
  getPoolProposals,
  getSnapshotStaff,
  listPlayersStaff,
  moveTeamPool,
  previewDraw,
  saveScore,
  setTournamentStatus,
  updateTeam,
  upsertPlayer,
} from "@/lib/server/api-staff";
import { playersPerTeam, STATUS_LABELS, type TournamentStatus } from "@/lib/engine/types";
import type { Match, Team } from "@/lib/server/types";
import { cn, fullName } from "@/lib/utils";
import type { PoolProposal } from "@/lib/engine";

const TABS = [
  { id: "overview", label: "Vue" },
  { id: "teams", label: "Équipes" },
  { id: "draw", label: "Tirage" },
  { id: "pools", label: "Poules" },
  { id: "matches", label: "Matchs" },
  { id: "ranking", label: "Classement" },
  { id: "finals", label: "Finale" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function TournamentWorkspace({ id }: { id: string }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabId>("overview");
  const snap = useQuery({
    queryKey: ["t", id],
    queryFn: () => getSnapshotStaff({ data: { id } }),
    refetchInterval: 7000,
  });
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["t", id] });
    void qc.invalidateQueries({ queryKey: ["tournaments"] });
  };

  if (snap.isError) {
    return <p className="text-sm text-danger-fg">Accès réservé aux organisateurs. Connectez-vous avec un compte club.</p>;
  }
  if (!snap.data) return <p className="text-sm text-muted-light">Chargement du concours…</p>;

  const data = snap.data;
  const t = data.tournament;
  const isAdmin = me.data?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-sand-400">Gestion</p>
          <h1 className="font-display text-3xl sm:text-4xl">{t.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TournamentStatusBadge status={t.status} />
            <Link to="/concours/$id/live" params={{ id }} className="text-xs text-sand-400 hover:underline">
              Vue publique
            </Link>
          </div>
        </div>
        <StatusActions id={id} status={t.status} onDone={invalidate} />
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-cream/10 bg-navy-900 p-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "h-10 shrink-0 rounded-lg px-3 text-sm font-medium",
              tab === item.id ? "bg-sand-500 text-navy-900" : "text-cream/70 hover:text-cream",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewPanel data={data} />}
      {tab === "teams" && <TeamsPanel data={data} onDone={invalidate} />}
      {tab === "draw" && <DrawPanel data={data} onDone={invalidate} />}
      {tab === "pools" && <PoolsPanel data={data} isAdmin={!!isAdmin} onDone={invalidate} />}
      {tab === "matches" && <MatchesPanel data={data} onDone={invalidate} />}
      {tab === "ranking" && <RankingPanel data={data} onDone={invalidate} />}
      {tab === "finals" && <FinalsPanel data={data} />}
    </div>
  );
}

function StatusActions({
  id,
  status,
  onDone,
}: {
  id: string;
  status: TournamentStatus;
  onDone: () => void;
}) {
  const mut = useMutation({
    mutationFn: (next: TournamentStatus) => setTournamentStatus({ data: { id, status: next } }),
    onSuccess: () => {
      toast.success("Statut mis à jour");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const actions: { label: string; next: TournamentStatus }[] = [];
  if (status === "draft") actions.push({ label: "Ouvrir les inscriptions", next: "registrations_open" });
  if (status === "registrations_open") {
    actions.push({ label: "Clôturer les inscriptions", next: "registrations_closed" });
  }
  if (status === "registrations_closed") actions.push({ label: "Préparer le tirage", next: "draw_pending" });
  if (status === "drawn") actions.push({ label: "Lancer les matchs", next: "in_progress" });
  if (status === "in_progress") actions.push({ label: "Clôturer le concours", next: "finished" });
  if (status === "finished") actions.push({ label: "Archiver", next: "archived" });

  if (!actions.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Button key={a.next} onClick={() => mut.mutate(a.next)} disabled={mut.isPending}>
          {a.label}
        </Button>
      ))}
    </div>
  );
}

function OverviewPanel({ data }: { data: NonNullable<Awaited<ReturnType<typeof getSnapshotStaff>>> }) {
  const t = data.tournament;
  const validated = data.teams.filter((x) => x.status === "validated").length;
  const done = data.matches.filter((m) => m.status === "validated" || m.status === "finished").length;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { n: `${validated} / ${t.maxTeams}`, l: "Équipes validées" },
        { n: data.pools.length, l: "Poules" },
        { n: `${done} / ${data.matches.length}`, l: "Matchs joués" },
        { n: t.courtCount, l: "Terrains" },
      ].map((s) => (
        <div key={s.l} className="rounded-2xl border border-cream/10 bg-navy-900 p-4">
          <p className="font-display text-3xl tabular-nums">{s.n}</p>
          <p className="text-xs text-muted-light">{s.l}</p>
        </div>
      ))}
      <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-cream/10 bg-navy-900 p-5">
        <p className="text-sm text-muted-light">Statut actuel · {STATUS_LABELS[t.status]}</p>
        <p className="mt-2 text-sm">{t.rules}</p>
      </div>
    </div>
  );
}

function TeamsPanel({
  data,
  onDone,
}: {
  data: NonNullable<Awaited<ReturnType<typeof getSnapshotStaff>>>;
  onDone: () => void;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Team["status"]>("all");
  const [open, setOpen] = useState(false);
  const validated = data.teams.filter((t) => t.status === "validated").length;
  const rows = data.teams.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (!q.trim()) return true;
    const blob = `${t.name} ${t.players.map((p) => fullName(p.firstName, p.lastName)).join(" ")}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  const statusMut = useMutation({
    mutationFn: (p: { teamId: string; status: Team["status"] }) => updateTeam({ data: p }),
    onSuccess: onDone,
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (teamId: string) => deleteTeam({ data: { teamId } }),
    onSuccess: onDone,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-2xl">
          {validated} / {data.tournament.maxTeams}{" "}
          <span className="text-base font-sans text-muted-light">équipes validées</span>
        </p>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Ajouter une équipe
        </Button>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-light" />
          <Input className="pl-9" placeholder="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {(["all", "pending", "validated", "refused"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn("rounded-full px-3 py-1.5 text-xs", filter === f ? "bg-sand-500 text-navy-900" : "bg-cream/10")}
          >
            {f === "all" ? "Toutes" : f}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="bg-navy-900 text-[11px] uppercase tracking-wider text-muted-light">
            <tr>
              <th className="px-3 py-2 text-left">N°</th>
              <th className="px-3 py-2 text-left">Équipe</th>
              <th className="px-3 py-2 text-left">Joueurs</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((team) => (
              <tr key={team.id} className="border-t border-cream/8">
                <td className="px-3 py-3 font-mono text-sand-400">{team.number ?? "—"}</td>
                <td className="px-3 py-3 font-medium">{team.name}</td>
                <td className="px-3 py-3 text-muted-light">
                  {team.players.map((p) => fullName(p.firstName, p.lastName)).join(" · ")}
                </td>
                <td className="px-3 py-3">
                  <TeamStatusBadge status={team.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    {team.status !== "validated" && (
                      <Button size="sm" onClick={() => statusMut.mutate({ teamId: team.id, status: "validated" })}>
                        <Check className="size-3.5" /> Valider
                      </Button>
                    )}
                    {team.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => statusMut.mutate({ teamId: team.id, status: "refused" })}>
                        Refuser
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => delMut.mutate(team.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddTeamDialog
        open={open}
        onOpenChange={setOpen}
        tournamentId={data.tournament.id}
        needed={playersPerTeam(data.tournament.teamFormat)}
        onDone={() => {
          setOpen(false);
          onDone();
        }}
      />
    </div>
  );
}

function AddTeamDialog({
  open,
  onOpenChange,
  tournamentId,
  needed,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tournamentId: string;
  needed: number;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const players = useQuery({
    queryKey: ["players-staff", q],
    queryFn: () => listPlayersStaff({ data: { q } }),
    enabled: open,
  });

  const createMut = useMutation({
    mutationFn: () =>
      createTeam({
        data: { tournamentId, name, playerIds: selected, status: "validated" },
      }),
    onSuccess: () => {
      toast.success("Équipe créée");
      setName("");
      setSelected([]);
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addPlayer = useMutation({
    mutationFn: () => upsertPlayer({ data: { firstName: newFirst, lastName: newLast } }),
    onSuccess: (p) => {
      setSelected((s) => (s.includes(p.id) || s.length >= needed ? s : [...s, p.id]));
      setNewFirst("");
      setNewLast("");
      void players.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function toggle(id: string) {
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= needed) return s;
      return [...s, id];
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle équipe</DialogTitle>
          <DialogDescription>
            {needed} joueur{needed > 1 ? "s" : ""} requis.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nom de l'équipe</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Les Aces" />
          </div>
          <Input placeholder="Rechercher un joueur" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {(players.data ?? []).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                  selected.includes(p.id) ? "bg-sand-500 text-navy-900" : "hover:bg-cream/8",
                )}
              >
                <span>{fullName(p.firstName, p.lastName)}</span>
                <span className="text-xs opacity-70">{p.club}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input placeholder="Prénom" value={newFirst} onChange={(e) => setNewFirst(e.target.value)} />
            <Input placeholder="Nom" value={newLast} onChange={(e) => setNewLast(e.target.value)} />
            <Button
              type="button"
              variant="outline"
              disabled={!newFirst.trim() || !newLast.trim()}
              onClick={() => addPlayer.mutate()}
            >
              Créer
            </Button>
          </div>
          <Button
            className="w-full"
            disabled={selected.length !== needed || createMut.isPending}
            onClick={() => createMut.mutate()}
          >
            Enregistrer l'équipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DrawPanel({
  data,
  onDone,
}: {
  data: NonNullable<Awaited<ReturnType<typeof getSnapshotStaff>>>;
  onDone: () => void;
}) {
  const t = data.tournament;
  const locked = ["in_progress", "finished", "archived"].includes(t.status);
  const proposals = useQuery({
    queryKey: ["proposals", t.id],
    queryFn: () => getPoolProposals({ data: { tournamentId: t.id } }),
  });
  const [chosen, setChosen] = useState<PoolProposal | null>(null);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewDraw>> | null>(null);

  const previewMut = useMutation({
    mutationFn: (sizes: number[]) => previewDraw({ data: { tournamentId: t.id, sizes } }),
    onSuccess: setPreview,
    onError: (e: Error) => toast.error(e.message),
  });
  const confirmMut = useMutation({
    mutationFn: () => {
      if (!preview) throw new Error("Aperçu manquant");
      return confirmDraw({
        data: {
          tournamentId: t.id,
          groups: preview.groups,
        },
      });
    },
    onSuccess: () => {
      toast.success("Tirage enregistré, matchs générés");
      setPreview(null);
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const teamById = useMemo(() => new Map(data.teams.map((x) => [x.id, x])), [data.teams]);
  const selected = chosen ?? proposals.data?.proposals[0] ?? null;

  if (locked && data.pools.length) {
    return <p className="text-sm text-muted-light">Le tirage est verrouillé : le concours est déjà lancé.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl">Tirage au sort</h2>
        <p className="mt-1 text-sm text-muted-light">
          {proposals.data?.teamCount ?? 0} équipes validées · {t.courtCount} terrains
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(proposals.data?.proposals ?? []).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setChosen(p);
              setPreview(null);
            }}
            className={cn(
              "rounded-2xl border p-4 text-left",
              selected?.id === p.id ? "border-sand-500 bg-sand-500/10" : "border-cream/10 bg-navy-900",
            )}
          >
            <p className="font-display text-xl">{p.label}</p>
            <p className="mt-1 text-xs text-muted-light">{p.description}</p>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="lg"
          disabled={!selected || previewMut.isPending}
          onClick={() => selected && previewMut.mutate(selected.sizes)}
        >
          <Dices className="size-4" /> Effectuer le tirage
        </Button>
        {preview && (
          <Button variant="outline" onClick={() => selected && previewMut.mutate(selected.sizes)}>
            Relancer le mélange
          </Button>
        )}
      </div>
      {preview && (
        <div className="space-y-4 rounded-2xl border border-sand-500/30 bg-navy-900 p-5">
          <p className="text-sm text-muted-light">
            Aperçu · {preview.poolCount} poules · {preview.matchCount} matchs. Confirmez pour enregistrer.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {preview.groups.map((g) => (
              <div key={g.letter} className="rounded-xl border border-cream/10 p-3">
                <p className="mb-2 font-display text-lg">Poule {g.letter}</p>
                <ul className="space-y-2">
                  {g.teamIds.map((tid) => (
                    <li key={tid}>
                      <TeamLine team={teamById.get(tid)} size="sm" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Button size="lg" disabled={confirmMut.isPending} onClick={() => confirmMut.mutate()}>
            Confirmer le tirage
          </Button>
        </div>
      )}
    </div>
  );
}

function PoolsPanel({
  data,
  isAdmin,
  onDone,
}: {
  data: NonNullable<Awaited<ReturnType<typeof getSnapshotStaff>>>;
  isAdmin: boolean;
  onDone: () => void;
}) {
  const mut = useMutation({
    mutationFn: (p: { teamId: string; toPoolId: string }) =>
      moveTeamPool({ data: { tournamentId: data.tournament.id, ...p } }),
    onSuccess: () => {
      toast.success("Équipe déplacée, matchs mis à jour");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!data.pools.length) return <p className="text-sm text-muted-light">Effectuez d'abord le tirage.</p>;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {data.pools.map((p) => (
        <div key={p.id} className="space-y-2">
          <PoolTable letter={p.letter} standings={data.standings[p.id] ?? []} teams={data.teams} />
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              {p.teamIds.map((tid) => {
                const team = data.teams.find((x) => x.id === tid);
                return (
                  <div key={tid} className="flex items-center gap-2 rounded-lg border border-cream/10 px-2 py-1 text-xs">
                    <span>{team?.name}</span>
                    <Select
                      value={p.id}
                      onValueChange={(toPoolId) => {
                        if (toPoolId !== p.id) mut.mutate({ teamId: tid, toPoolId });
                      }}
                    >
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue placeholder="Déplacer" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.pools.map((dest) => (
                          <SelectItem key={dest.id} value={dest.id}>
                            Poule {dest.letter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MatchesPanel({
  data,
  onDone,
}: {
  data: NonNullable<Awaited<ReturnType<typeof getSnapshotStaff>>>;
  onDone: () => void;
}) {
  const [active, setActive] = useState<Match | null>(null);
  const mut = useMutation({
    mutationFn: (p: { matchId: string; score1: number; score2: number; live?: boolean }) => saveScore({ data: p }),
    onSuccess: () => {
      toast.success("Score enregistré");
      setActive(null);
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const groups = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of data.matches) {
      const key = m.phase === "pool" ? `Poule ${data.pools.find((p) => p.id === m.poolId)?.letter ?? "?"}` : m.phase;
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [data]);

  return (
    <div className="space-y-6">
      {groups.map(([label, list]) => (
        <section key={label}>
          <h3 className="mb-3 font-display text-xl">{label}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {list.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                teams={data.teams}
                courts={data.courts}
                onClick={() => setActive(m)}
              />
            ))}
          </div>
        </section>
      ))}
      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saisie du score</DialogTitle>
            <DialogDescription>Partie en {data.tournament.targetPoints} points.</DialogDescription>
          </DialogHeader>
          {active && (
            <div className="space-y-3">
              <MatchStatusBadge status={active.status} />
              <ScorePad
                match={active}
                teams={data.teams}
                targetPoints={data.tournament.targetPoints}
                busy={mut.isPending}
                onLive={(s1, s2) => mut.mutate({ matchId: active.id, score1: s1, score2: s2, live: true })}
                onValidate={(s1, s2) => mut.mutate({ matchId: active.id, score1: s1, score2: s2 })}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RankingPanel({
  data,
  onDone,
}: {
  data: NonNullable<Awaited<ReturnType<typeof getSnapshotStaff>>>;
  onDone: () => void;
}) {
  const unfinished = data.matches.filter(
    (m) => m.phase === "pool" && m.status !== "validated" && m.status !== "finished",
  ).length;
  const hasKo = data.matches.some((m) => m.phase !== "pool");
  const mut = useMutation({
    mutationFn: () => generateFinals({ data: { tournamentId: data.tournament.id } }),
    onSuccess: () => {
      toast.success("Tableau final généré");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-light">
          {unfinished ? `${unfinished} matchs de poule restants.` : "Poules terminées — les équipes sablées sont qualifiées."}
        </p>
        {!hasKo && (
          <Button disabled={unfinished > 0 || mut.isPending} onClick={() => mut.mutate()}>
            Générer la phase finale
          </Button>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.pools.map((p) => (
          <PoolTable key={p.id} letter={p.letter} standings={data.standings[p.id] ?? []} teams={data.teams} />
        ))}
      </div>
    </div>
  );
}

function FinalsPanel({ data }: { data: NonNullable<Awaited<ReturnType<typeof getSnapshotStaff>>> }) {
  return <BracketView matches={data.matches} teams={data.teams} />;
}
