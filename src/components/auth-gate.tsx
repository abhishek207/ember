import { useEffect, useState, type ReactNode } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useQuitStore } from "@/lib/quit/store";
import { BootScreen } from "@/components/boot-screen";
import { Onboarding } from "@/components/onboarding";

const SPLASH_MS = 1600;
let splashAlreadyShown = false;

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const hasHydrated = useQuitStore((s) => s.hasHydrated);
  const remoteReady = useQuitStore((s) => s.remoteReady);
  const profile = useQuitStore((s) => s.profile);
  const [minTimeDone, setMinTimeDone] = useState(splashAlreadyShown);
  const userId = user?.id;

  useEffect(() => {
    if (splashAlreadyShown) {
      setMinTimeDone(true);
      return;
    }
    const t = window.setTimeout(() => {
      splashAlreadyShown = true;
      setMinTimeDone(true);
    }, SPLASH_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const finish = () => useQuitStore.getState().markHydrated();
    const unsub = useQuitStore.persist.onFinishHydration(finish);
    if (useQuitStore.persist.hasHydrated()) finish();
    const t = window.setTimeout(finish, 80);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      useQuitStore.setState({ remoteReady: true });
      return;
    }
    const last = sessionStorage.getItem("ember-uid");
    sessionStorage.setItem("ember-uid", userId);
    const state = useQuitStore.getState();
    // Always pull when this account has no log yet. Skipping here is why a
    // Google/X sign-in after email looked like a brand-new quit.
    if (last === userId && state.remoteReady && state.profile) return;
    useQuitStore.setState({ remoteReady: false });
    void useQuitStore.getState().pullRemote();
  }, [userId]);

  const waitingOnRemote = Boolean(user) && !remoteReady;
  if (isPending || !hasHydrated || !minTimeDone || waitingOnRemote) {
    return <BootScreen />;
  }
  if (!user) return <RedirectToSignIn />;
  if (!profile) return <Onboarding />;
  return <>{children}</>;
}
