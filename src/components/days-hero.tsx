import { ProgressRing } from "@/components/progress-ring";

export function DaysHero({ days, progress }: { days: number; progress: number }) {
  return (
    <div className="relative mx-auto grid size-[17.5rem] place-items-center">
      <ProgressRing value={progress} size={280} stroke={8} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Smoke-free for
        </p>
        <p className="mt-1 font-display text-6xl font-medium leading-none tracking-tight tabular-nums">
          {days}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{days === 1 ? "day" : "days"}</p>
      </div>
    </div>
  );
}
