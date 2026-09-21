import { useEffect, useState } from "react";
import { BreatheScene } from "@/components/breathe-scene";
import { Button } from "@/components/ui/button";

type Phase = { label: string; seconds: number };

const CYCLE: Phase[] = [
  { label: "Breathe in", seconds: 4 },
  { label: "Breathe out", seconds: 4 },
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
      <BreatheScene running={running} className="size-64" />
      <div className="text-center">
        <p className="font-display text-2xl font-medium">{running ? phase.label : "Breathe"}</p>
        <p className="mt-1 tabular-nums text-sm text-muted-foreground">
          {running ? remaining : "Four in. Four out."}
        </p>
      </div>
      <Button type="button" variant={running ? "secondary" : "default"} onClick={toggle}>
        {running ? "Stop" : "Start"}
      </Button>
    </div>
  );
}
