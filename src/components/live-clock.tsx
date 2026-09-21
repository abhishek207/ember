import { useEffect, useState } from "react";
import { splitDuration } from "@/lib/quit/format";

export function LiveClock({ seconds }: { seconds: number }) {
  const [tick, setTick] = useState(seconds);

  useEffect(() => {
    setTick(seconds);
    const id = window.setInterval(() => setTick((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [seconds]);

  const { days, hours, minutes, seconds: secs } = splitDuration(tick);

  return (
    <div className="text-center">
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        Smoke-free
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <Unit value={days} label="days" />
        <Unit value={hours} label="hrs" />
        <Unit value={minutes} label="min" />
        <Unit value={secs} label="sec" />
      </div>
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-card px-1 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <div className="font-display text-2xl font-medium tabular-nums tracking-tight sm:text-3xl">
        {value}
      </div>
      <div className="mt-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  );
}
