import { useState, type FormEvent } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BootScreen } from "@/components/boot-screen";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isPending) return <BootScreen />;
  if (user) return <Navigate to="/" />;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "Ember",
          callbackURL: "/",
        });
        if (err) {
          const already = /already|exists/i.test(err.message ?? "");
          if (already) {
            const { error: inErr } = await authClient.signIn.email({
              email,
              password,
              callbackURL: "/",
            });
            if (inErr) throw new Error(inErr.message ?? "Could not sign in");
          } else {
            throw new Error(err.message ?? "Could not create account");
          }
        }
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (err) throw new Error(err.message ?? "Could not sign in");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <p className="text-sm font-medium tracking-wide text-primary">Ember</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One account. Google, X, or email — your quit log stays with you.
        </p>

        {authEnabled ? (
          <div className="mt-8 flex flex-col gap-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Sign-in is disabled.</p>
        )}

        <div className="my-6 flex items-center gap-3 text-xs tracking-wide text-muted-foreground uppercase">
          <span className="h-px flex-1 bg-border" />
          <span className="shrink-0 px-1">Email</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onEmail} className="flex flex-col gap-3">
          {mode === "up" ? (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={busy || !authEnabled}>
            {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in with email"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => {
            setMode((m) => (m === "in" ? "up" : "in"));
            setError(null);
          }}
        >
          {mode === "in" ? "Need an account? Create one" : "Have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
