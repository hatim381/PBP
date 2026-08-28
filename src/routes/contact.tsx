import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-[11px] uppercase tracking-[0.22em] text-sand-400">Nous trouver</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Contact</h1>
        <p className="mt-4 text-lg text-cream/80">
          Pour une inscription, un concours ou une question d'organisation, passez par l'espace concours ou
          l'espace organisateur.
        </p>
        <div className="mt-8 space-y-4 rounded-2xl border border-cream/10 bg-navy-850 p-6">
          <p className="font-display text-2xl">Square des Batignolles</p>
          <p className="text-sm text-muted-light">Place Charles Fillion, 75017 Paris</p>
          <p className="text-sm text-cream/80">
            Le jour d'un concours, les terrains, les scores et le prochain match sont affichés ici en direct.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/inscriptions">Inscrire une équipe</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app">Espace organisateur</Link>
          </Button>
        </div>
      </article>
    </PublicShell>
  );
}
