import { createFileRoute } from "@tanstack/react-router";
import { BracketView } from "@/components/bracket-view";
import { useSnapshot } from "@/hooks/use-snapshot";

export const Route = createFileRoute("/concours/$id/tableau")({ component: Tableau });

function Tableau() {
  const { id } = Route.useParams();
  const { data } = useSnapshot(id);
  if (!data) return null;
  return <BracketView matches={data.matches} teams={data.teams} />;
}
