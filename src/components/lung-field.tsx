import { BodyScene, MILESTONE_REGION, REGION_LABEL } from "@/components/body-scene";
import { nextMilestone } from "@/lib/quit/milestones";

const H12 = 12 * 3600;
const D3 = 3 * 86400;
const D30 = 30 * 86400;
const D90 = 90 * 86400;
const D365 = 365 * 86400;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function lungHeal(seconds: number): number {
  const s = Math.max(0, seconds);
  return clamp01(
    0.12 * (s / H12) + 0.18 * (s / D3) + 0.22 * (s / D30) + 0.24 * (s / D90) + 0.24 * (s / D365),
  );
}

export function LungField({ seconds }: { seconds: number }) {
  const heal = lungHeal(seconds);
  const mile = nextMilestone(seconds);
  const region = MILESTONE_REGION[mile.next.id] ?? "lungs";
  const allDone = mile.current?.id === mile.next.id && mile.progress === 1;

  return (
    <div className="mx-auto w-full max-w-sm">
      <BodyScene region={region} heal={heal} className="mx-auto aspect-square w-full" />
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {allDone ? "Healing holds" : `Next: ${REGION_LABEL[region]}`}
        <span className="mx-1.5 text-border">·</span>
        {Math.round(heal * 100)}% clearer
      </p>
    </div>
  );
}
