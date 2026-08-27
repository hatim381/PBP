import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-navy-900 px-6 text-center text-cream">
      <span className="text-sand-400" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-2xl">Une erreur est survenue</h1>
      <p className="max-w-md text-sm break-words text-muted-light">
        {error.message || "Réessayez de recharger la page."}
      </p>
    </main>
  );
}
