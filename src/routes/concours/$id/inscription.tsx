import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatLabel, playersPerTeam, TEAM_STATUS_LABELS } from "@/lib/engine/types";
import { getTournamentPublic, registerTeamPublic } from "@/lib/server/api-public";

export const Route = createFileRoute("/concours/$id/inscription")({
  component: Inscription,
});

function Inscription() {
  const { id } = Route.useParams();
  const snap = useQuery({
    queryKey: ["t", id],
    queryFn: () => getTournamentPublic({ data: { id } }),
  });
  const t = snap.data?.tournament;
  const needed = t ? playersPerTeam(t.teamFormat) : 2;
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<{ firstName: string; lastName: string; phone: string }[]>([
    { firstName: "", lastName: "", phone: "" },
    { firstName: "", lastName: "", phone: "" },
  ]);
  const [done, setDone] = useState<{ number: number; name: string; status: string } | null>(null);

  useEffect(() => {
    setPlayers(Array.from({ length: needed }, () => ({ firstName: "", lastName: "", phone: "" })));
  }, [needed]);

  const mut = useMutation({
    mutationFn: () =>
      registerTeamPublic({
        data: {
          tournamentId: id,
          teamName,
          players: players.map((p, i) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            phone: i === 0 ? p.phone : p.phone || undefined,
          })),
        },
      }),
    onSuccess: (res) => {
      setDone({ number: res.number, name: res.name, status: res.status });
      toast.success(res.status === "waitlist" ? "Inscrits en liste d'attente" : "Inscription envoyée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!t) return null;
  if (t.status !== "registrations_open") {
    return (
      <div className="rounded-2xl border border-cream/10 bg-navy-850 p-6">
        <h2 className="font-display text-2xl">Inscriptions fermées</h2>
        <p className="mt-2 text-sm text-muted-light">Ce concours n'accepte plus de nouvelles équipes.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/concours/$id" params={{ id }}>
            Retour à la fiche
          </Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-sand-500/30 bg-navy-850 p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-sand-400">Inscription reçue</p>
        <h2 className="mt-2 font-display text-3xl">{done.name}</h2>
        <p className="mt-3 text-sm text-cream/80">
          Numéro d'équipe <span className="font-mono text-sand-400">{done.number}</span>
          <span className="mx-2">·</span>
          {TEAM_STATUS_LABELS[done.status as keyof typeof TEAM_STATUS_LABELS] ?? done.status}
        </p>
        <p className="mt-2 text-sm text-muted-light">
          Conservez ce numéro. L'organisateur valide l'équipe, puis le tirage et les matchs apparaissent ici.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/concours/$id/equipe" params={{ id }}>
              Suivre mon équipe
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/concours/$id" params={{ id }}>
              Fiche du concours
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="mx-auto max-w-xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        mut.mutate();
      }}
    >
      <div>
        <h2 className="font-display text-3xl">Inscrire une équipe</h2>
        <p className="mt-1 text-sm text-muted-light">
          {formatLabel(t.teamFormat)} · {t.maxTeams} équipes maximum · {t.venueName}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="team-name">Nom de l'équipe</Label>
        <Input
          id="team-name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Les Aces"
        />
      </div>
      {players.map((p, i) => (
        <fieldset key={i} className="space-y-3 rounded-2xl border border-cream/10 p-4">
          <legend className="px-1 text-sm font-medium">Joueur {i + 1}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`first-${i}`}>Prénom</Label>
              <Input
                id={`first-${i}`}
                required
                value={p.firstName}
                onChange={(e) =>
                  setPlayers((prev) => prev.map((x, n) => (n === i ? { ...x, firstName: e.target.value } : x)))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`last-${i}`}>Nom</Label>
              <Input
                id={`last-${i}`}
                required
                value={p.lastName}
                onChange={(e) =>
                  setPlayers((prev) => prev.map((x, n) => (n === i ? { ...x, lastName: e.target.value } : x)))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`phone-${i}`}>Téléphone {i === 0 ? "(obligatoire)" : "(optionnel)"}</Label>
            <Input
              id={`phone-${i}`}
              type="tel"
              required={i === 0}
              value={p.phone}
              onChange={(e) =>
                setPlayers((prev) => prev.map((x, n) => (n === i ? { ...x, phone: e.target.value } : x)))
              }
            />
          </div>
        </fieldset>
      ))}
      <Button type="submit" size="lg" className="w-full" disabled={mut.isPending}>
        Envoyer l'inscription
      </Button>
    </form>
  );
}
