import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMe, listMembers, setMemberRole } from "@/lib/server/api-staff";
import type { ClubRole } from "@/lib/server/types";

export const Route = createFileRoute("/app/parametres")({ component: SettingsPage });

function SettingsPage() {
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const members = useQuery({ queryKey: ["members"], queryFn: () => listMembers() });
  const mut = useMutation({
    mutationFn: (p: { userId: string; role: ClubRole }) => setMemberRole({ data: p }),
    onSuccess: () => {
      toast.success("Rôle mis à jour");
      void qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Paramètres</h1>
        <p className="text-sm text-muted-light">Rôles du club. Le premier compte connecté est administrateur.</p>
      </div>
      <div className="rounded-2xl border border-cream/10 bg-navy-900 p-5">
        <p className="text-sm">
          Vous êtes connecté en tant que <span className="text-sand-400">{me.data?.role ?? "…"}</span>
          {me.data?.email ? ` · ${me.data.email}` : ""}.
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[28rem] text-sm">
          <thead className="bg-navy-900 text-[11px] uppercase tracking-wider text-muted-light">
            <tr>
              <th className="px-3 py-2 text-left">Membre</th>
              <th className="px-3 py-2 text-left">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {(members.data?.members ?? []).map((m) => (
              <tr key={m.user_id} className="border-t border-cream/8">
                <td className="px-3 py-3">
                  <p>{m.display_name || m.email || m.user_id}</p>
                  <p className="text-xs text-muted-light">{m.email}</p>
                </td>
                <td className="px-3 py-3">
                  {me.data?.role === "admin" ? (
                    <Select
                      value={m.role}
                      onValueChange={(role) => mut.mutate({ userId: m.user_id, role: role as ClubRole })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="organizer">Organisateur</SelectItem>
                        <SelectItem value="player">Joueur</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{m.role}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
