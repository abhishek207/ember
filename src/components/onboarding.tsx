import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CigsPerDayField } from "@/components/cigs-per-day-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fromLocalInputs, parseCigsPerDay, toLocalDateInput, toLocalTimeInput } from "@/lib/quit/format";
import { useQuitStore } from "@/lib/quit/store";

export function Onboarding() {
  const navigate = useNavigate();
  const updateProfile = useQuitStore((s) => s.updateProfile);
  const saving = useQuitStore((s) => s.saving);
  const now = new Date();
  const [date, setDate] = useState(toLocalDateInput(now.toISOString()));
  const [time, setTime] = useState(toLocalTimeInput(now.toISOString()));
  const [cigsPerDay, setCigsPerDay] = useState("10");
  const [costPerPack, setCostPerPack] = useState("20");
  const [cigsPerPack, setCigsPerPack] = useState("20");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onStart(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updateProfile({
        quitAt: fromLocalInputs(date, time),
        cigsPerDay: parseCigsPerDay(cigsPerDay),
        costPerPack: Number(costPerPack) || 0,
        cigsPerPack: Math.max(1, Number(cigsPerPack) || 20),
        currency: "INR",
        displayName: displayName.trim(),
      });
      void navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start. Try again.");
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <p className="text-sm font-medium tracking-wide text-primary">Ember</p>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">When did you stop?</h1>
      <p className="mt-2 text-pretty text-sm text-muted-foreground">
        Just a few facts. You can change them later. Nothing here is a lecture.
      </p>
      <form onSubmit={onStart} className="mt-8 flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="quit-date">Date</Label>
            <Input
              id="quit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="quit-time">Time</Label>
            <Input
              id="quit-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>
        <CigsPerDayField value={cigsPerDay} onChange={setCigsPerDay} />
        <div className="grid grid-cols-2 gap-4">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="pack-cost">Pack cost</Label>
            <Input
              id="pack-cost"
              inputMode="decimal"
              value={costPerPack}
              onChange={(e) => setCostPerPack(e.target.value)}
            />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="pack-size">Cigs per pack</Label>
            <Input
              id="pack-size"
              inputMode="numeric"
              value={cigsPerPack}
              onChange={(e) => setCigsPerPack(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="display-name">Name, if you want</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Optional"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Start the clock"}
        </Button>
      </form>
    </div>
  );
}
