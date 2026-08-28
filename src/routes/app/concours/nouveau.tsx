import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CRITERIA_LABELS, FORMAT_OPTIONS, RANKING_CRITERIA, type RankingCriterion, type TeamFormat } from "@/lib/engine/types";
import { createTournament } from "@/lib/server/api-staff";

export const Route = createFileRoute("/app/concours/nouveau")({ component: Nouveau });

function Nouveau() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [venueName, setVenueName] = useState("Square des Batignolles");
  const [address, setAddress] = useState("Place Charles Fillion, 75017 Paris");
  const [courtCount, setCourtCount] = useState(8);
  const [maxTeams, setMaxTeams] = useState(32);
  const [teamFormat, setTeamFormat] = useState<TeamFormat>("doublette");
  const [groupSize, setGroupSize] = useState(4);
  const [qualifiedPerGroup, setQualifiedPerGroup] = useState(2);
  const [targetPoints, setTargetPoints] = useState(13);
  const [rules, setRules] = useState("");
  const [criteria, setCriteria] = useState<RankingCriterion[]>(["wins", "head_to_head", "point_diff", "points_for"]);

  const mut = useMutation({
    mutationFn: () =>
      createTournament({
        data: {
          name,
          description,
          date,
          startTime,
          venueName,
          address,
          courtCount,
          maxTeams,
          teamFormat,
          groupSize,
          qualifiedPerGroup,
          targetPoints,
          rankingCriteria: criteria,
          rules,
        },
      }),
    onSuccess: (t) => {
      toast.success("Concours créé");
      if (t) nav({ to: "/app/concours/$id", params: { id: t.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function toggleCriterion(c: RankingCriterion) {
    setCriteria((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  return (
    <form
      className="mx-auto max-w-2xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        mut.mutate();
      }}
    >
      <div>
        <h1 className="font-display text-4xl">Nouveau concours</h1>
        <p className="text-sm text-muted-light">Étape 1 — créer et configurer l'épreuve.</p>
      </div>
      <Field label="Nom">
        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Grand Prix PBP" />
      </Field>
      <Field label="Description">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Heure de début">
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lieu">
          <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} />
        </Field>
        <Field label="Adresse">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type de jeu">
          <Select value={teamFormat} onValueChange={(v) => setTeamFormat(v as TeamFormat)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Équipes max">
          <Input type="number" min={2} value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Terrains">
          <Input type="number" min={1} value={courtCount} onChange={(e) => setCourtCount(Number(e.target.value))} />
        </Field>
        <Field label="Équipes / poule">
          <Input type="number" min={3} max={6} value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} />
        </Field>
        <Field label="Qualifiés / poule">
          <Input type="number" min={1} value={qualifiedPerGroup} onChange={(e) => setQualifiedPerGroup(Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Points pour gagner">
        <Input type="number" min={7} max={13} value={targetPoints} onChange={(e) => setTargetPoints(Number(e.target.value))} />
      </Field>
      <div>
        <Label>Ordre de départage</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {RANKING_CRITERIA.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCriterion(c)}
              className={`rounded-full px-3 py-1.5 text-xs ${criteria.includes(c) ? "bg-sand-500 text-navy-900" : "bg-cream/10 text-cream/70"}`}
            >
              {criteria.includes(c) ? `${criteria.indexOf(c) + 1}. ` : ""}
              {CRITERIA_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      <Field label="Règlement spécifique">
        <Textarea value={rules} onChange={(e) => setRules(e.target.value)} />
      </Field>
      <Button type="submit" size="lg" disabled={mut.isPending || !name.trim()}>
        Créer le concours
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
