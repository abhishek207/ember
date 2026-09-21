import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITS, SOUNDS, type SoundId } from "@/lib/medi/engine";
import { useMedi } from "@/lib/medi/use-medi";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/medi")({ component: Medi });

function formatSit(left: number): string {
  const s = Math.max(0, left);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function Medi() {
  const medi = useMedi();
  const sitting = medi.sitEndsAt != null;
  const remaining = medi.sitRemaining();

  return (
    <div className="scene-medi min-h-full">
      <div className="mx-auto w-full max-w-lg px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-10">
        <p className="text-sm font-medium tracking-wide text-primary">Medi</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Sit still.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sound and a timer. Nothing else to manage.
        </p>

        {sitting ? (
          <div className="mt-8 rounded-3xl bg-card/80 px-5 py-8 text-center shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_8%,transparent)] backdrop-blur-sm">
            <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Sitting</p>
            <p className="mt-3 font-display text-5xl font-medium tabular-nums tracking-tight">
              {formatSit(remaining)}
            </p>
            <Button type="button" variant="secondary" className="mt-6" onClick={() => medi.stopSit()}>
              End sit
            </Button>
          </div>
        ) : (
          <div className="mt-8">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Sit</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SITS.map((sit) => (
                <button
                  key={sit.minutes}
                  type="button"
                  onClick={() => medi.startSit(sit.minutes)}
                  className="h-14 rounded-2xl bg-card/80 text-sm font-medium shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_8%,transparent)] backdrop-blur-sm"
                >
                  {sit.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Ambient</p>
          <ul className="mt-3 space-y-2">
            {SOUNDS.map((sound) => {
              const on = medi.playing === sound.id;
              return (
                <li key={sound.id}>
                  <SoundRow
                    label={sound.label}
                    hint={sound.hint}
                    on={on}
                    onToggle={() => {
                      if (on) medi.stopSound();
                      else void medi.play(sound.id as SoundId);
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SoundRow({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_8%,transparent)] backdrop-blur-sm",
        on ? "bg-primary/15" : "bg-card/80",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
        )}
      >
        {on ? <Pause className="size-4" /> : <Play className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}
