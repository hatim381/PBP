import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";

export function AuthSlot({ invert = false }: { invert?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-9 animate-pulse rounded-full bg-cream/10" />;
  }
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant={invert ? "invert" : "outline"}>
          <Link to="/app">Espace club</Link>
        </Button>
        <UserButton />
      </div>
    );
  }
  return (
    <Button asChild size="sm" variant={invert ? "invert" : "default"}>
      <Link to="/login">Connexion</Link>
    </Button>
  );
}
