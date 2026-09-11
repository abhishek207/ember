import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChipRow } from "@/components/chip-row";
import { LiveClock } from "@/components/live-clock";
import { ProgressRing } from "@/components/progress-ring";
import { formatCompactDuration, formatLongDate } from "@/lib/quit/format";
import { nextMilestone } from "@/lib/quit/milestones";
import { computeStats } from "@/lib/quit/stats";
import { useQuitStore } from "@/lib/quit/store";

export const Route = createFileRoute("/_app/")({ component: Home });

function Home() {
  const profile = useQuitStore((s) => s.profile);
  const stats = useMemo(() => computeStats(profile), [profile]);
  const mile = nextMilestone(stats.seconds);
  const greeting = profile?.displayName ? `Hello, ${profile.displayName}` : "Still here.";

  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-8 pb-6">
      <p className="text-sm font-medium tracking-wide text-primary">Ember</p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">{greeting}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Clock started {profile ? formatLongDate(profile.quitAt) : "—"}.
      </p>

      <div className="mt-8">
        <LiveClock seconds={stats.seconds} />
      </div>

      <div className="mt-5">
        <ChipRow stats={stats} currency={profile?.currency ?? "INR"} />
      </div>

      <Link
        to="/health"
        className="mt-5 flex items-center gap-4 rounded-2xl bg-card p-4 shadow-[0_0_0_1px_rgba(242,240,235,0.08)]"
      >
        <ProgressRing value={mile.progress} />
        <div className="min-w-0">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Next</p>
          <p className="font-display text-lg font-medium leading-snug">{mile.next.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatCompactDuration(Math.max(0, mile.next.afterSeconds - stats.seconds))} to go
          </p>
        </div>
      </Link>

      {mile.current ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Latest: <span className="text-foreground">{mile.current.title}</span>
        </p>
      ) : null}
    </div>
  );
}
