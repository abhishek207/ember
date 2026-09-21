import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Phase = { label: string; seconds: number; scale: number };

const CYCLE: Phase[] = [
  { label: "Breathe in", seconds: 4, scale: 1.12 },
  { label: "Hold", seconds: 7, scale: 1.12 },
  { label: "Breathe out", seconds: 8, scale: 0.92 },
];

export function Breathing() {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(CYCLE[0]!.seconds);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        setPhaseIndex((i) => (i + 1) % CYCLE.length);
        return CYCLE[(phaseIndex + 1) % CYCLE.length]!.seconds;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, phaseIndex]);

  const phase = CYCLE[phaseIndex]!;

  function toggle() {
    if (running) {
      setRunning(false);
      setPhaseIndex(0);
      setRemaining(CYCLE[0]!.seconds);
      return;
    }
    setRunning(true);
    setPhaseIndex(0);
    setRemaining(CYCLE[0]!.seconds);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="grid size-56 place-items-center">
        <div
          className="size-40 rounded-full border-[10px] border-primary/80 bg-primary/10"
          style={{
            transform: `scale(${running ? phase.scale : 1})`,
            transitionProperty: "transform",
            transitionDuration: running ? `${phase.seconds}s` : "0.4s",
            transitionTimingFunction: "ease-in-out",
          }}
        />
      </div>
      <div className="text-center">
        <p className="font-display text-2xl font-medium">
          {running ? phase.label : "4–7–8"}
        </p>
        <p className="mt-1 tabular-nums text-sm text-muted-foreground">
          {running ? remaining : "In 4, hold 7, out 8"}
        </p>
      </div>
      <Button type="button" variant={running ? "secondary" : "default"} onClick={toggle}>
        {running ? "Stop" : "Breathe"}
      </Button>
    </div>
  );
}
