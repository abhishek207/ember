import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Phase = { label: string; seconds: number; scale: number };

const CYCLE: Phase[] = [
  { label: "Inhale", seconds: 4, scale: 1.18 },
  { label: "Hold", seconds: 7, scale: 1.18 },
  { label: "Exhale", seconds: 8, scale: 1 },
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
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="grid size-44 place-items-center">
        <div
          className="size-28 rounded-full bg-primary/20 shadow-[0_0_0_1px_rgba(143,154,134,0.35)_inset]"
          style={{
            transform: `scale(${running ? phase.scale : 1})`,
            transitionProperty: "transform",
            transitionDuration: `${phase.seconds}s`,
            transitionTimingFunction: "ease-in-out",
          }}
        />
      </div>
      <div className="text-center">
        <p className="font-display text-xl font-medium">
          {running ? phase.label : "4–7–8"}
        </p>
        <p className="mt-1 tabular-nums text-sm text-muted-foreground">
          {running ? `${remaining}s` : "Inhale 4, hold 7, out 8"}
        </p>
      </div>
      <Button type="button" variant={running ? "secondary" : "default"} onClick={toggle}>
        {running ? "Stop" : "Breathe with me"}
      </Button>
    </div>
  );
}
