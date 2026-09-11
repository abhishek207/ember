import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LungField } from "@/components/lung-field";
import { formatCompactDuration } from "@/lib/quit/format";
import { MILESTONES } from "@/lib/quit/milestones";
import { computeStats } from "@/lib/quit/stats";
import { useQuitStore } from "@/lib/quit/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/health")({ component: Body });

function Body() {
  const profile = useQuitStore((s) => s.profile);
  const stats = useMemo(() => computeStats(profile), [profile]);

  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-8 pb-8">
      <p className="text-sm font-medium tracking-wide text-primary">Body</p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Lungs, in time</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Haze lifts as the days stack. This is a picture of recovery, not a diagnosis.
      </p>
      <div className="mt-6">
        <LungField seconds={stats.seconds} />
      </div>
      <ol className="mt-8 space-y-2">
        {MILESTONES.map((m) => {
          const done = stats.seconds >= m.afterSeconds;
          return (
            <li
              key={m.id}
              className={cn(
                "rounded-2xl bg-card p-4 shadow-[0_0_0_1px_rgba(242,240,235,0.08)]",
                !done && "opacity-70",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
                    done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={2.4} /> : null}
                </span>
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{m.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{m.body}</p>
                  <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                    {done
                      ? "Reached"
                      : `In ${formatCompactDuration(m.afterSeconds - stats.seconds)}`}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
