import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { setAccountPassword } from "@/lib/account";
import { GROK_PROVIDERS, authClient } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { InstallPwa } from "@/components/install-pwa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CigsPerDayField } from "@/components/cigs-per-day-field";
import { fromLocalInputs, parseCigsPerDay, toLocalDateInput, toLocalTimeInput } from "@/lib/quit/format";
import { useQuitStore } from "@/lib/quit/store";
import type { Profile } from "@/lib/quit/types";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

function Settings() {
  const navigate = useNavigate();
  const profile = useQuitStore((s) => s.profile);
  const updateProfile = useQuitStore((s) => s.updateProfile);
  const clearAll = useQuitStore((s) => s.clearAll);
  const saving = useQuitStore((s) => s.saving);
  const saveError = useQuitStore((s) => s.saveError);

  const [date, setDate] = useState(() => (profile ? toLocalDateInput(profile.quitAt) : ""));
  const [time, setTime] = useState(() => (profile ? toLocalTimeInput(profile.quitAt) : ""));
  const [cigsPerDay, setCigsPerDay] = useState(
    String(profile?.cigsPerDay ?? 10),
  );
  const [costPerPack, setCostPerPack] = useState(String(profile?.costPerPack ?? 20));
  const [cigsPerPack, setCigsPerPack] = useState(String(profile?.cigsPerPack ?? 20));
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [currency, setCurrency] = useState(profile?.currency ?? "INR");
  const [eraseError, setEraseError] = useState<string | null>(null);
  const [eraseBusy, setEraseBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDate(toLocalDateInput(profile.quitAt));
    setTime(toLocalTimeInput(profile.quitAt));
    setCigsPerDay(String(profile.cigsPerDay));
    setCostPerPack(String(profile.costPerPack));
    setCigsPerPack(String(profile.cigsPerPack));
    setDisplayName(profile.displayName);
    setCurrency(profile.currency);
  }, [profile]);

  function snapshot(overrides: Partial<Profile> = {}): Profile {
    return {
      quitAt: fromLocalInputs(date, time),
      cigsPerDay: parseCigsPerDay(cigsPerDay),
      costPerPack: Number(costPerPack) || 0,
      cigsPerPack: Math.max(1, Number(cigsPerPack) || 20),
      currency,
      displayName: displayName.trim(),
      ...overrides,
    };
  }

  async function persist(overrides: Partial<Profile> = {}) {
    try {
      await updateProfile(snapshot(overrides));
    } catch {
      /* saveError is stored on the quit store */
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    await persist();
  }

  async function onErase() {
    setEraseError(null);
    setEraseBusy(true);
    try {
      await clearAll();
      void navigate({ to: "/" });
    } catch (err) {
      setEraseError(err instanceof Error ? err.message : "Could not erase the log");
      setEraseBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-8 pb-10">
      <p className="text-sm font-medium tracking-wide text-primary">Settings</p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Your log</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Changes apply on Home as soon as you save. They are stored with your account.
      </p>

      <form onSubmit={onSave} className="mt-8 flex flex-col gap-5">
        <div className="space-y-2">
          <Label htmlFor="display-name">Name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={() => void persist({ displayName: displayName.trim() })}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="quit-date">Quit date</Label>
            <Input
              id="quit-date"
              type="date"
              value={date}
              onChange={(e) => {
                const next = e.target.value;
                setDate(next);
                void persist({ quitAt: fromLocalInputs(next, time) });
              }}
            />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="quit-time">Quit time</Label>
            <Input
              id="quit-time"
              type="time"
              value={time}
              onChange={(e) => {
                const next = e.target.value;
                setTime(next);
                void persist({ quitAt: fromLocalInputs(date, next) });
              }}
            />
          </div>
        </div>
        <CigsPerDayField
          value={cigsPerDay}
          onChange={setCigsPerDay}
          onCommit={(n) => void persist({ cigsPerDay: n })}
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="min-w-0 overflow-hidden space-y-2">
            <Label htmlFor="pack-cost">Pack cost</Label>
            <Input
              id="pack-cost"
              inputMode="decimal"
              value={costPerPack}
              onChange={(e) => setCostPerPack(e.target.value)}
              onBlur={() => void persist({ costPerPack: Number(costPerPack) || 0 })}
            />
          </div>
          <div className="min-w-0 overflow-hidden space-y-2">
            <Label htmlFor="pack-size">Cigs per pack</Label>
            <Input
              id="pack-size"
              inputMode="numeric"
              value={cigsPerPack}
              onChange={(e) => setCigsPerPack(e.target.value)}
              onBlur={() => void persist({ cigsPerPack: Math.max(1, Number(cigsPerPack) || 20) })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => {
              const next = e.target.value;
              setCurrency(next);
              void persist({ currency: next });
            }}
            className="flex h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <Separator className="my-8" />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-medium">Home screen</h2>
        <InstallPwa />
      </section>

      <Separator className="my-8" />

      <AccountConnections />

      <Separator className="my-8" />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-medium">Account</h2>
        <UserButton />
      </section>

      <Separator className="my-8" />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-medium">Erase quit log</h2>
        <p className="text-sm text-muted-foreground">
          Deletes your clock, cravings, and notes from this account. Sign-in stays. You will set a
          new quit time.
        </p>
        {eraseError ? <p className="text-sm text-destructive">{eraseError}</p> : null}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={eraseBusy}>
              {eraseBusy ? "Erasing…" : "Erase quit log"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Erase the quit log?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes your start time, cravings, and notes from the database. Your account
                stays. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground"
                onClick={() => void onErase()}
              >
                Erase
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}

type LinkedAccount = { id: string; providerId: string };

function AccountConnections() {
  const user = useCurrentUser();
  const [accounts, setAccounts] = useState<LinkedAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(user?.primaryEmail ?? "");

  async function refresh() {
    const { data, error: err } = await authClient.listAccounts();
    if (err) {
      setError(err.message ?? "Could not load connected accounts");
      setAccounts([]);
      return;
    }
    setAccounts((data as LinkedAccount[] | null) ?? []);
    setError(null);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const linked = new Set((accounts ?? []).map((a) => a.providerId));
  const hasCredential = linked.has("credential");

  async function connect(providerId: string) {
    setBusy(providerId);
    setError(null);
    try {
      const inPreview =
        typeof window !== "undefined" && window.location.hostname.endsWith(".grok-sandbox.com");
      const popup = inPreview
        ? window.open(
            `${window.location.origin}/settings`,
            `ember-link-${Date.now()}`,
            "popup,width=500,height=650",
          )
        : null;
      const client = authClient as typeof authClient & {
        oauth2: {
          link: (opts: {
            providerId: string;
            callbackURL?: string;
            errorCallbackURL?: string;
          }) => Promise<{ data?: { url?: string }; error?: { message?: string } }>;
        };
      };
      const { data, error: err } = await client.oauth2.link({
        providerId,
        callbackURL: "/settings",
        errorCallbackURL: "/settings",
      });
      if (err || !data?.url) {
        popup?.close();
        throw new Error(err?.message ?? "Could not start account link");
      }
      if (popup) popup.location.href = data.url;
      else window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect");
      setBusy(null);
    }
  }

  async function addPassword(e: FormEvent) {
    e.preventDefault();
    setBusy("credential");
    setError(null);
    try {
      if (email && email !== user?.primaryEmail) {
        const { error: mailErr } = await authClient.changeEmail({ newEmail: email });
        if (mailErr) throw new Error(mailErr.message ?? "Could not update email");
      }
      const { error: pwErr } = await (async () => {
        try {
          await setAccountPassword({ data: { newPassword: password } });
          return { error: null };
        } catch (err) {
          return { error: err instanceof Error ? err : new Error("Could not set password") };
        }
      })();
      if (pwErr) throw new Error(pwErr.message ?? "Could not set password");
      setPassword("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add email sign-in");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-medium">Connected accounts</h2>
      <p className="text-sm text-muted-foreground">
        Same person, same quit log. Link Google, X, or email so you can sign in either way.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="space-y-2">
        {GROK_PROVIDERS.map((p) => {
          const on = linked.has(p.providerId);
          return (
            <li
              key={p.providerId}
              className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 shadow-[0_0_0_1px_rgba(242,240,235,0.08)]"
            >
              <div>
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground">{on ? "Connected" : "Not connected"}</p>
              </div>
              {on ? null : (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={busy === p.providerId}
                  onClick={() => void connect(p.providerId)}
                >
                  {busy === p.providerId ? "Opening…" : "Connect"}
                </Button>
              )}
            </li>
          );
        })}
        <li className="rounded-2xl bg-card px-4 py-3 shadow-[0_0_0_1px_rgba(242,240,235,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Email & password</p>
              <p className="text-xs text-muted-foreground">
                {hasCredential ? user?.primaryEmail ?? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          {hasCredential ? null : (
            <form onSubmit={addPassword} className="mt-3 flex flex-col gap-2">
              <Input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                type="password"
                required
                minLength={8}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button type="submit" size="sm" disabled={busy === "credential"}>
                {busy === "credential" ? "Saving…" : "Add email sign-in"}
              </Button>
            </form>
          )}
        </li>
      </ul>
    </section>
  );
}
