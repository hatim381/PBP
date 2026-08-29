import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: Login });

function frenchAuthError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("invalid origin") || msg.includes("unable to verify")) {
    return "Ouvrez l'application via http://127.0.0.1:8080 (pas une autre adresse).";
  }
  if (msg.includes("already exists") || msg.includes("user already")) {
    return "Ce compte existe déjà. Connectez-vous, ou utilisez un autre e-mail.";
  }
  if (msg.includes("invalid email") || msg.includes("email")) {
    return "Vérifiez l'adresse e-mail.";
  }
  if (msg.includes("password") && (msg.includes("short") || msg.includes("least") || msg.includes("weak"))) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (msg.includes("invalid password") || msg.includes("invalid credentials") || msg.includes("unauthorized")) {
    return "E-mail ou mot de passe incorrect.";
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "Connexion au serveur impossible. Réessayez dans un instant.";
  }
  return raw || "Inscription impossible pour le moment.";
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "up" && password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0] || "Organisateur",
        });
        if (res.error) throw new Error(res.error.message || "Inscription impossible.");
      } else {
        const res = await authClient.signIn.email({ email: email.trim(), password });
        if (res.error) throw new Error(res.error.message || "Connexion impossible.");
      }
      const session = await authClient.getSession();
      if (!session.data?.user) {
        setMode("in");
        setError("Compte créé. Connectez-vous maintenant avec le même e-mail.");
        return;
      }
      window.location.assign("/app");
    } catch (err) {
      setError(frenchAuthError(err instanceof Error ? err.message : "Erreur"));
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
        <h1 className="font-display text-3xl">
          {mode === "up" ? "Créer un compte" : "Connexion"}
        </h1>
        <p className="mt-2 text-sm text-muted-light">
          {mode === "up"
            ? "Le premier compte devient administrateur du club et peut créer les concours."
            : "Espace organisateur — concours, équipes et scores."}
        </p>

        {authEnabled ? (
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-2 rounded-xl border border-cream/10 p-1">
              <button
                type="button"
                className={`h-11 rounded-lg text-sm font-medium ${mode === "up" ? "bg-sand-500 text-navy-900" : "text-cream/70"}`}
                onClick={() => {
                  setMode("up");
                  setError(null);
                }}
              >
                Créer un compte
              </button>
              <button
                type="button"
                className={`h-11 rounded-lg text-sm font-medium ${mode === "in" ? "bg-sand-500 text-navy-900" : "text-cream/70"}`}
                onClick={() => {
                  setMode("in");
                  setError(null);
                }}
              >
                Se connecter
              </button>
            </div>

            <form className="space-y-3" onSubmit={onEmail}>
              {mode === "up" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Votre nom</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Hatim Adnane"
                    autoComplete="name"
                  />
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
                  placeholder="vous@club.fr"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe (8 caractères min.)</Label>
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
              {mode === "up" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              )}
              {error && (
                <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-fg" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy ? "Patientez…" : mode === "up" ? "Créer mon compte" : "Entrer dans l'espace"}
              </Button>
            </form>

            <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-widest text-muted-light">
              <span className="h-px flex-1 bg-cream/10" />
              ou
              <span className="h-px flex-1 bg-cream/10" />
            </div>
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                className="w-full"
                disabled={busy}
                onClick={async () => {
                  setError(null);
                  setBusy(true);
                  try {
                    await signIn(p.providerId, { callbackURL: "/app", errorCallbackURL: "/login" });
                  } catch (err) {
                    setError(
                      frenchAuthError(err instanceof Error ? err.message : "") +
                        " Le plus simple est de créer un compte par e-mail.",
                    );
                    setBusy(false);
                  }
                }}
              >
                Continuer avec {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-light">La connexion n'est pas activée.</p>
        )}
      </div>
    </main>
  );
}
