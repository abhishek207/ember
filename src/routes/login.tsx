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
    <main className="scene-login relative flex min-h-dvh flex-col justify-end px-5 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))] text-foreground">
      <div className="mx-auto w-full max-w-sm pb-8">
        <p className="text-sm font-medium tracking-wide text-primary">Ember</p>
        <h1 className="mt-3 font-display text-4xl leading-tight font-medium tracking-tight">
          A clearer tomorrow starts today.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in with Google or X. Your quit log stays with you.
        </p>

        {authEnabled ? (
          <div className="glass-liquid mt-8 flex flex-col gap-2 rounded-3xl p-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant={p.providerId === "grok-google" ? "default" : "secondary"}
                size="lg"
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
