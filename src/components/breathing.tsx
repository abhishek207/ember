import { useEffect, useState } from "react";
import { BreatheScene } from "@/components/breathe-scene";
import { Button } from "@/components/ui/button";
import { CALM, PATTERNS, cycleAt, type BreathePattern } from "@/lib/quit/breathe";
import { cn } from "@/lib/utils";

export function Breathing() {
  const [pattern, setPattern] = useState<BreathePattern>(CALM);
  const [running, setRunning] = useState(false);
  const [originMs, setOriginMs] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = (t: number) => {
      setNow(t);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [running, originMs]);

  const elapsed = running ? (now - originMs) / 1000 : 0;
  const beat = cycleAt(elapsed, pattern);
  const remain = Math.max(1, Math.ceil(beat.remaining - 0.001));

  function startWith(next: BreathePattern) {
    setPattern(next);
    setOriginMs(performance.now());
    setNow(performance.now());
    setRunning(true);
  }

  function toggle() {
    if (running) {
      setRunning(false);
      return;
    }
    startWith(pattern);
  }

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <BreatheScene running={running} pattern={pattern} originMs={originMs} className="size-64" />
      <div className="text-center">
        <p className="font-display text-2xl font-medium">{running ? beat.step.label : "Breathe"}</p>
        <p className="mt-1 tabular-nums text-sm text-muted-foreground">
          {running ? remain : pattern.hint}
        </p>
      </div>
      <div className="flex w-full flex-wrap justify-center gap-1.5">
        {PATTERNS.map((p) => {
          const on = pattern.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => (running && on ? undefined : startWith(p))}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium tracking-wide",
                on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              {p.name}
            </button>
          );
        })}
      </div>
      <Button type="button" variant={running ? "secondary" : "default"} onClick={toggle}>
        {running ? "Stop" : "Start"}
      </Button>
    </div>
  );
}
