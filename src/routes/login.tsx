import { createFileRoute, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { BootScreen } from "@/components/boot-screen";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) return <BootScreen />;
  if (user) return <Navigate to="/" />;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <p className="text-sm font-medium tracking-wide text-primary">Ember</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One account. Google or X — your quit log stays with you.
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
      </div>
    </main>
  );
}
