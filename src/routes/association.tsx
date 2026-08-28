import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/association")({ component: Association });

function Association() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-[11px] uppercase tracking-[0.22em] text-sand-400">Le club</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Pétanque Bohra Paris</h1>
        <p className="mt-4 text-lg leading-relaxed text-cream/80">
          Association sportive du 17e arrondissement, Pétanque Bohra Paris organise ses concours au square des
          Batignolles : tête-à-tête, doublettes et triplettes, mixtes ou non, du premier tirage au tableau final.
        </p>
        <dl className="mt-10 grid gap-6 sm:grid-cols-2">
          {[
            { k: "Siège / terrain", v: "Square des Batignolles, Place Charles Fillion, 75017 Paris" },
            { k: "Pratique", v: "Concours club, inscriptions d'équipes, suivi en direct le jour J" },
            { k: "Formats", v: "Tête-à-tête, doublette, doublette mixte, triplette, triplette mixte" },
            { k: "Organisation", v: "Poules, tirage, terrains et phase finale gérés sur PBP Concours" },
          ].map((item) => (
            <div key={item.k} className="rounded-2xl border border-cream/10 bg-navy-850 p-5">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-sand-400">{item.k}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-cream/80">{item.v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/concours">Voir les concours</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Contact</Link>
          </Button>
        </div>
      </article>
    </PublicShell>
  );
}
