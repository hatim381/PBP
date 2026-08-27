import { createFileRoute } from "@tanstack/react-router";
import { TournamentWorkspace } from "@/components/workspace/tournament-workspace";

export const Route = createFileRoute("/app/concours/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <TournamentWorkspace id={id} />;
}
