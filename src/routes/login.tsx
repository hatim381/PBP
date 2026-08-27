import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Organisateur",
          callbackURL: "/app",
        });
        if (res.error) throw new Error(res.error.message || "Inscription impossible.");
      } else {
        const res = await authClient.signIn.email({ email, password, callbackURL: "/app" });
        if (res.error) throw new Error(res.error.message || "Connexion impossible.");
      }
      window.location.assign("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="court-grain grid min-h-dvh place-items-center bg-navy-900 px-4 py-10 text-cream">
      <div className="w-full max-w-md rounded-3xl border border-cream/10 bg-navy-850 p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <Link to="/" className="mb-6 inline-block">
          <Wordmark />
        </Link>
        <h1 className="font-display text-3xl">Espace organisateur</h1>
        <p className="mt-2 text-sm text-muted-light">
          Connectez-vous pour gérer les concours, les équipes et la saisie des scores.
        </p>

        {authEnabled ? (
          <div className="mt-6 space-y-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/app" })}
              >
                Continuer avec {p.label}
              </Button>
            ))}
            <div className="flex items-center gap-3 py-2 text-xs uppercase tracking-widest text-muted-light">
              <span className="h-px flex-1 bg-cream/10" />
              ou par e-mail
              <span className="h-px flex-1 bg-cream/10" />
            </div>
            <form className="space-y-3" onSubmit={onEmail}>
              {mode === "up" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-danger-fg">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                {mode === "up" ? "Créer un compte" : "Se connecter"}
              </Button>
            </form>
            <button
              type="button"
              className="w-full text-center text-sm text-sand-400 hover:underline"
              onClick={() => setMode(mode === "up" ? "in" : "up")}
            >
              {mode === "up" ? "Déjà un compte ? Connexion" : "Premier accès ? Créer un compte"}
            </button>
            <p className="text-xs text-muted-light">
              Le premier compte créé devient administrateur du club.
            </p>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-light">La connexion n'est pas activée.</p>
        )}
      </div>
    </main>
  );
}
