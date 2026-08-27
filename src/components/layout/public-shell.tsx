import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AuthSlot } from "@/components/auth-slot";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/concours", label: "Concours" },
  { to: "/joueurs", label: "Joueurs" },
] as const;

export function PublicShell({ children, paper = false }: { children: ReactNode; paper?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("min-h-dvh", paper ? "paper-page" : "bg-navy-900 text-cream")}>
      <header
        className={cn(
          "sticky top-0 z-40 border-b backdrop-blur-md",
          paper ? "border-navy-900/10 bg-paper/90" : "border-cream/10 bg-navy-900/85",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="shrink-0">
            <Wordmark compact invert={paper} />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    paper
                      ? active
                        ? "bg-navy-900 text-cream"
                        : "text-navy-700 hover:bg-navy-900/5"
                      : active
                        ? "bg-cream/10 text-cream"
                        : "text-cream/70 hover:bg-cream/8 hover:text-cream",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <AuthSlot invert={paper} />
            <Sheet open={open} onOpenChange={setOpen}>
              <Button size="icon" variant={paper ? "invert" : "ghost"} className="md:hidden" onClick={() => setOpen(true)}>
                <Menu className="size-5" />
              </Button>
              <SheetContent side="right">
                <div className="px-5 pt-12">
                  <Wordmark />
                  <nav className="mt-8 flex flex-col gap-1">
                    {NAV.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-3 text-base text-cream hover:bg-cream/8"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className={cn("mt-16 border-t", paper ? "border-navy-900/10" : "border-cream/10")}>
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className={paper ? "text-navy-600" : "text-muted-light"}>
            Pétanque Bohra Paris · Square des Batignolles
          </p>
          <p className={paper ? "text-navy-500" : "text-muted-light/80"}>Gestion des concours · PBP Concours</p>
        </div>
      </footer>
    </div>
  );
}
