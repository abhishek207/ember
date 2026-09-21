import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Breathing } from "@/components/breathing";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { urgeLineFor } from "@/lib/quit/quotes";
import { useQuitStore } from "@/lib/quit/store";

export const Route = createFileRoute("/_app/cravings")({ component: Urge });

function Urge() {
  const logCraving = useQuitStore((s) => s.logCraving);
  const cravings = useQuitStore((s) => s.cravings);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const line = useMemo(() => urgeLineFor(), []);

  async function onLog() {
    await logCraving(intensity, note);
    setNote("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-10">
      <p className="text-sm font-medium tracking-wide text-primary">Urge</p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Having an urge?</h1>
      <p className="mt-2 text-sm text-muted-foreground">{line}</p>

      <div className="mt-6">
        <Breathing />
      </div>

      <div className="mt-2">
        <button
          type="button"
          className="w-full py-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => setShowLog((v) => !v)}
        >
          {showLog ? "Hide log" : "Log this wave"}
        </button>
      </div>

      {showLog ? (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">How loud is it?</p>
            <span className="tabular-nums text-sm text-muted-foreground">{intensity}/10</span>
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[intensity]}
            onValueChange={(v) => setIntensity(v[0] ?? 5)}
          />
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What pulled at you? Optional."
            rows={3}
          />
          <Button type="button" onClick={() => void onLog()} className="w-full">
            {saved ? "Logged" : "Save"}
          </Button>
        </div>
      ) : null}

      {cravings.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-display text-lg font-medium">Recent</h2>
          <ul className="mt-3 space-y-2">
            {cravings.slice(0, 6).map((c) => (
              <li
                key={c.id}
                className="glass rounded-2xl px-4 py-3 text-sm"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="tabular-nums font-medium">{c.intensity}/10</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {c.note ? <p className="mt-1 text-muted-foreground">{c.note}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
