import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Cigarette, Clock3, Wallet } from "lucide-react";
import { DaysHero } from "@/components/days-hero";
import { dayGreeting, firstName, formatCount, formatLifeMinutes, formatMoney, splitDuration } from "@/lib/quit/format";
import { nextMilestone } from "@/lib/quit/milestones";
import { homeLineFor } from "@/lib/quit/quotes";
import { computeStats } from "@/lib/quit/stats";
import { useQuitStore } from "@/lib/quit/store";

export const Route = createFileRoute("/_app/")({ component: Home });

function Home() {
  const profile = useQuitStore((s) => s.profile);
  const stats = useMemo(() => computeStats(profile), [profile]);
  const mile = nextMilestone(stats.seconds);
  const { days } = splitDuration(stats.seconds);
  const name = firstName(profile?.displayName);
  const hello = name ? `${dayGreeting()}, ${name}` : dayGreeting();
  const quote = homeLineFor();

  return (
    <div className="scene-home min-h-full">
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8">
        <p className="text-sm font-medium tracking-wide text-primary">Ember</p>
        <h1 className="mt-5 font-display text-[2rem] leading-tight font-medium tracking-tight">
          {hello}
        </h1>

        <div className="mt-8 flex flex-1 flex-col items-center">
          <DaysHero days={days} progress={mile.progress} />

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

          <p className="mt-8 max-w-[18rem] text-center font-display text-base leading-snug text-foreground/90">
            “{quote}”
          </p>
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
