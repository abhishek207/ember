import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Cigarette, Clock3, Wallet } from "lucide-react";
import { DaysHero } from "@/components/days-hero";
import { dayGreeting, firstName, formatCompactDuration, formatCount, formatLifeMinutes, formatMoney, splitDuration } from "@/lib/quit/format";
import { ringGoal } from "@/lib/quit/milestones";
import { computeStats } from "@/lib/quit/stats";
import { useQuitStore } from "@/lib/quit/store";

export const Route = createFileRoute("/_app/")({ component: Home });

function Home() {
  const profile = useQuitStore((s) => s.profile);
  const stats = useMemo(() => computeStats(profile), [profile]);
  const goal = ringGoal(stats.seconds);
  const { days, hours } = splitDuration(stats.seconds);
  const name = firstName(profile?.displayName);
  const hello = name ? `${dayGreeting()}, ${name}` : dayGreeting();
  const heroValue = days > 0 ? days : hours;
  const heroUnit = days > 0 ? (days === 1 ? "day" : "days") : hours === 1 ? "hour" : "hours";
  const goalLine = goal.complete
    ? "Year mark reached"
    : `${formatCompactDuration(goal.remainingSeconds)} to ${goal.label}`;

  return (
    <div className="scene-home min-h-full">
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8">
        <p className="text-sm font-medium tracking-wide text-primary">Ember</p>
        <h1 className="mt-5 font-display text-[2rem] leading-tight font-medium tracking-tight">
          {hello}
        </h1>

        <div className="mt-8 flex flex-1 flex-col items-center">
          <DaysHero value={heroValue} unit={heroUnit} progress={goal.progress} />
          <p className="mt-4 text-sm text-muted-foreground">{goalLine}</p>

          <div className="mt-8 grid w-full grid-cols-3 gap-2">
            <Stat
              icon={Cigarette}
              value={formatCount(stats.cigarettesAvoided)}
              label="Not smoked"
            />
            <Stat
              icon={Wallet}
              value={formatMoney(stats.moneySaved, profile?.currency ?? "INR")}
              label="Saved"
            />
            <Stat
              icon={Clock3}
              value={formatLifeMinutes(stats.minutesReturned)}
              label="Time back"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Cigarette;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-card/80 px-2 py-3 text-center shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_8%,transparent)] backdrop-blur-sm">
      <Icon className="mx-auto size-4 text-primary" strokeWidth={1.8} />
      <p className="mt-2 font-display text-lg leading-none font-medium tabular-nums">{value}</p>
      <p className="mt-1.5 text-[10px] tracking-wide text-muted-foreground uppercase">{label}</p>
    </div>
  );
}
