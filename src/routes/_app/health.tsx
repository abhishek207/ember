import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LungField } from "@/components/lung-field";
import { formatCompactDuration, formatDayMonth, milestoneReachedAt } from "@/lib/quit/format";
import { MILESTONES } from "@/lib/quit/milestones";
import { computeStats } from "@/lib/quit/stats";
import { useQuitStore } from "@/lib/quit/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/health")({ component: Body });

function Body() {
  const profile = useQuitStore((s) => s.profile);
  const stats = useMemo(() => computeStats(profile), [profile]);
  const nextIndex = MILESTONES.findIndex((m) => stats.seconds < m.afterSeconds);
  const focus = nextIndex === -1 ? MILESTONES.length - 1 : nextIndex;
  const quitAt = profile?.quitAt;

  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-10">
      <p className="text-sm font-medium tracking-wide text-primary">Body</p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Your body is healing</h1>
      <p className="mt-2 text-sm text-muted-foreground">A picture of recovery, not a diagnosis.</p>

      <div className="mt-6">
        <LungField seconds={stats.seconds} />
      </div>

      <ol className="relative mt-10 space-y-0">
        {MILESTONES.map((m, i) => {
          const done = stats.seconds >= m.afterSeconds;
          const current = i === focus && !done;
          const reached =
            done && quitAt ? formatDayMonth(milestoneReachedAt(quitAt, m.afterSeconds)) : "";
          return (
            <li key={m.id} className="group relative flex gap-4 pb-6 last:pb-0">
              {i < MILESTONES.length - 1 ? (
                <span className="absolute top-7 left-[11px] h-[calc(100%-12px)] w-px bg-border" />
              ) : null}
              <span
                className={cn(
                  "relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
                  done
                    ? "bg-primary text-primary-foreground"
                    : current
                      ? "border border-primary bg-background text-primary"
                      : "border border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={2.4} /> : null}
              </span>
              <div className={cn("relative min-w-0 flex-1 pt-0.5", !done && !current && "opacity-55")}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium leading-snug">{m.title}</p>
                  {reached ? (
                    <time className="shrink-0 pt-0.5 text-xs tabular-nums text-foreground/35 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100">
                      {reached}
                    </time>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                  {done ? "Reached" : `In ${formatCompactDuration(m.afterSeconds - stats.seconds)}`}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
