import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listPlayersStaff, upsertPlayer } from "@/lib/server/api-staff";
import { fullName, initials } from "@/lib/utils";
import type { Player } from "@/lib/server/types";

export const Route = createFileRoute("/app/joueurs")({ component: JoueursAdmin });

function JoueursAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Partial<Player> | null>(null);
  const list = useQuery({
    queryKey: ["players-staff", q],
    queryFn: () => listPlayersStaff({ data: { q } }),
  });
  const mut = useMutation({
    mutationFn: (p: { id?: string; firstName: string; lastName: string; phone?: string; email?: string; licenseNumber?: string; club?: string }) =>
      upsertPlayer({ data: p }),
    onSuccess: () => {
      toast.success("Joueur enregistré");
      setEdit(null);
      void qc.invalidateQueries({ queryKey: ["players-staff"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Joueurs</h1>
          <p className="text-sm text-muted-light">Annuaire du club — recherche par nom, téléphone ou licence.</p>
        </div>
        <Button onClick={() => setEdit({ firstName: "", lastName: "" })}>
          <Plus className="size-4" /> Nouveau joueur
        </Button>
      </div>
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-light" />
        <Input className="pl-9" placeholder="Rechercher un joueur" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid gap-2">
        {(list.data ?? []).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setEdit(p)}
            className="flex items-center gap-3 rounded-2xl border border-cream/10 bg-navy-900 px-4 py-3 text-left hover:border-sand-500/30"
          >
            <span className="grid size-10 place-items-center rounded-full bg-sand-500/15 font-display text-sm text-sand-400">
              {initials(p.firstName, p.lastName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{fullName(p.firstName, p.lastName)}</p>
              <p className="truncate text-xs text-muted-light">
                {p.club ?? "—"} · {p.licenseNumber ?? "sans licence"} · {p.phone ?? "pas de téléphone"}
              </p>
            </div>
          </button>
        ))}
      </div>
      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Modifier le joueur" : "Nouveau joueur"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                mut.mutate({
                  id: edit.id,
                  firstName: edit.firstName ?? "",
                  lastName: edit.lastName ?? "",
                  phone: edit.phone ?? undefined,
                  email: edit.email ?? undefined,
                  licenseNumber: edit.licenseNumber ?? undefined,
                  club: edit.club ?? undefined,
                });
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Prénom</Label>
                  <Input required value={edit.firstName ?? ""} onChange={(e) => setEdit({ ...edit, firstName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Nom</Label>
                  <Input required value={edit.lastName ?? ""} onChange={(e) => setEdit({ ...edit, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <Input value={edit.phone ?? ""} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" value={edit.email ?? ""} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Licence</Label>
                  <Input value={edit.licenseNumber ?? ""} onChange={(e) => setEdit({ ...edit, licenseNumber: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Club</Label>
                  <Input value={edit.club ?? ""} onChange={(e) => setEdit({ ...edit, club: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={mut.isPending}>
                Enregistrer
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
