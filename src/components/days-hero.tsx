import { ProgressRing } from "@/components/progress-ring";

export function DaysHero({
  value,
  unit,
  progress,
}: {
  value: number;
  unit: string;
  progress: number;
}) {
  return (
    <div className="relative mx-auto grid size-[17.5rem] place-items-center">
      <ProgressRing value={progress} size={280} stroke={7} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Smoke-free
        </p>
        <p className="mt-1 font-display text-6xl font-medium leading-none tracking-tight tabular-nums">
          {value}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{unit}</p>
      </div>
    </div>
  );
}
