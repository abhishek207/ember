import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Phase = { label: string; seconds: number; open: boolean };

const CYCLE: Phase[] = [
  { label: "Breathe in", seconds: 4, open: true },
  { label: "Breathe out", seconds: 4, open: false },
];

const PETALS = 6;

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
  const open = running ? phase.open : false;

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
      <div className="relative grid size-56 place-items-center">
        {Array.from({ length: PETALS }, (_, i) => (
          <span
            key={i}
            className="breathe-petal"
            style={{
              transform: `rotate(${i * (360 / PETALS)}deg) translateY(${open ? "-18%" : "-4%"}) scale(${open ? 1 : 0.62})`,
              transitionDuration: running ? `${phase.seconds}s` : "0.5s",
            }}
          />
        ))}
        <span
          className="breathe-core"
          style={{
            transform: `scale(${open ? 1 : 0.72})`,
            transitionDuration: running ? `${phase.seconds}s` : "0.5s",
          }}
        />
      </div>
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
