import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, House, Menu, Trophy, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AuthSlot } from "@/components/auth-slot";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/concours", label: "Concours" },
  { to: "/inscriptions", label: "Inscriptions" },
  { to: "/resultats", label: "Résultats" },
  { to: "/association", label: "Association" },
] as const;

export function PublicShell({
  children,
  paper = false,
  tournamentId,
}: {
  children: ReactNode;
  paper?: boolean;
  tournamentId?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const dockClass = (active: boolean) =>
    cn(
      "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium",
      active ? "text-sand-400" : "text-cream/60",
    );

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
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
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
              <Button
                size="icon"
                variant={paper ? "invert" : "ghost"}
                className="lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <Menu className="size-5" />
              </Button>
              <SheetContent side="right">
                <div className="px-5 pt-12">
                  <Wordmark />
                  <nav className="mt-8 flex flex-col gap-1" aria-label="Menu mobile">
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
                    <Link
                      to="/contact"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-3 text-base text-cream hover:bg-cream/8"
                    >
                      Contact
                    </Link>
                    <Link
                      to="/app"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-3 text-base text-sand-400 hover:bg-cream/8"
                    >
                      Organisation
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="pb-24 lg:pb-0">{children}</main>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-navy-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Raccourcis"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {tournamentId ? (
            <>
              <li>
                <Link to="/" className={dockClass(pathname === "/")}>
                  <House className="size-5" aria-hidden />
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/concours" className={dockClass(pathname.startsWith("/concours"))}>
                  <Trophy className="size-5" aria-hidden />
                  Concours
                </Link>
              </li>
              <li>
                <Link
                  to="/concours/$id/live"
                  params={{ id: tournamentId }}
                  className={dockClass(pathname.includes("/live"))}
                >
                  <CalendarDays className="size-5" aria-hidden />
                  Matchs
                </Link>
              </li>
              <li>
                <Link
                  to="/concours/$id/classement"
                  params={{ id: tournamentId }}
                  className={dockClass(pathname.includes("/classement"))}
                >
                  <Trophy className="size-5" aria-hidden />
                  Classement
                </Link>
              </li>
              <li>
                <Link
                  to="/concours/$id/equipe"
                  params={{ id: tournamentId }}
                  className={dockClass(pathname.includes("/equipe"))}
                >
                  <Users className="size-5" aria-hidden />
                  Mon équipe
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/" className={dockClass(pathname === "/")}>
                  <House className="size-5" aria-hidden />
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/concours" className={dockClass(pathname.startsWith("/concours"))}>
                  <Trophy className="size-5" aria-hidden />
                  Concours
                </Link>
              </li>
              <li>
                <Link to="/inscriptions" className={dockClass(pathname.startsWith("/inscriptions"))}>
                  <CalendarDays className="size-5" aria-hidden />
                  Inscriptions
                </Link>
              </li>
              <li>
                <Link to="/resultats" className={dockClass(pathname.startsWith("/resultats"))}>
                  <Trophy className="size-5" aria-hidden />
                  Résultats
                </Link>
              </li>
              <li>
                <Link to="/association" className={dockClass(pathname.startsWith("/association"))}>
                  <Users className="size-5" aria-hidden />
                  Club
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <footer className={cn("mt-16 border-t", paper ? "border-navy-900/10" : "border-cream/10")}>
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className={paper ? "text-navy-600" : "text-muted-light"}>
            Pétanque Bohra Paris · Square des Batignolles
          </p>
          <div className={cn("flex flex-wrap gap-4", paper ? "text-navy-500" : "text-muted-light/80")}>
            <Link to="/association" className="hover:underline">
              Association
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
            <Link to="/app" className="hover:underline">
              Organisation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
