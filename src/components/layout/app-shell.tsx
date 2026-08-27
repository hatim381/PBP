import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Dices,
  LayoutDashboard,
  Menu,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { AuthSlot } from "@/components/auth-slot";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/app", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/app/concours", label: "Concours", icon: Trophy, exact: false },
  { to: "/app/joueurs", label: "Joueurs", icon: Users, exact: false },
  { to: "/app/statistiques", label: "Statistiques", icon: BarChart3, exact: false },
  { to: "/app/parametres", label: "Paramètres", icon: Settings, exact: false },
] as const;

function Nav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-sand-500 text-navy-900" : "text-cream/75 hover:bg-cream/8 hover:text-cream",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      <Link
        to="/"
        onClick={onNavigate}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/50 hover:bg-cream/8 hover:text-cream"
      >
        <Dices className="size-4" />
        Site public
      </Link>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-navy-900">
        <div className="size-10 animate-pulse rounded-full bg-cream/10" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="min-h-dvh bg-navy-950 text-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-cream/10 bg-navy-900 md:flex">
        <div className="px-4 py-5">
          <Wordmark compact />
        </div>
        <Nav pathname={pathname} />
        <div className="mt-auto border-t border-cream/10 p-4">
          <AuthSlot />
        </div>
      </aside>
      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-cream/10 bg-navy-900/90 px-4 backdrop-blur md:hidden">
          <Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <Wordmark compact />
          <AuthSlot />
        </header>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left">
            <div className="px-2 pt-10">
              <Wordmark compact />
            </div>
            <div className="mt-6">
              <Nav pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </div>
    </div>
  );
}
