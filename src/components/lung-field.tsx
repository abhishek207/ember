import { nextMilestone } from "@/lib/quit/milestones";
import { cn } from "@/lib/utils";

export type BodyRegion = "heart" | "lungs" | "bronchi" | "cilia" | "circulation" | "senses" | "vessels";

export const MILESTONE_REGION: Record<string, BodyRegion> = {
  "20m": "heart",
  "8h": "circulation",
  "24h": "heart",
  "48h": "senses",
  "72h": "bronchi",
  "1w": "circulation",
  "2w": "circulation",
  "1mo": "cilia",
  "3mo": "lungs",
  "9mo": "lungs",
  "1y": "heart",
  "5y": "vessels",
  "10y": "lungs",
  "15y": "heart",
};

export const REGION_LABEL: Record<BodyRegion, string> = {
  heart: "Heart",
  lungs: "Lungs",
  bronchi: "Airways",
  cilia: "Airway lining",
  circulation: "Circulation",
  senses: "Senses",
  vessels: "Vessels",
};

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
  const on = (r: BodyRegion) => region === r;

  return (
    <div className="mx-auto w-full max-w-sm">
      <svg
        viewBox="0 0 200 260"
        className="mx-auto block w-full max-w-[220px]"
        aria-hidden
      >
        <defs>
          <radialGradient id="bodyGlow" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="rgb(143 176 137)" stopOpacity={0.18 + heal * 0.28} />
            <stop offset="100%" stopColor="rgb(143 176 137)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(232 236 228)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="rgb(143 176 137)" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <rect width="200" height="260" fill="url(#bodyGlow)" />
        <g fill="none" stroke="rgb(232 236 228)" strokeOpacity="0.22" strokeWidth="1.4">
          <circle cx="100" cy="36" r="18" />
          <path d="M100 54v16" />
          <path d="M64 86c0-12 16-20 36-20s36 8 36 20v78c0 22-16 38-36 38s-36-16-36-38z" fill="url(#bodyFill)" />
        </g>
        <g
          className={cn(on("senses") && "body-pulse")}
          fill={on("senses") ? "rgb(183 201 176)" : "rgb(232 236 228)"}
          fillOpacity={on("senses") ? 0.85 : 0.18}
        >
          <circle cx="93" cy="34" r="2.2" />
          <circle cx="107" cy="34" r="2.2" />
        </g>
        <path
          className={cn(on("cilia") || on("bronchi") ? "body-pulse" : undefined)}
          d="M100 70v28m0 0c-6 14-11 22-16 36m16-36c6 14 11 22 16 36"
          fill="none"
          stroke={on("cilia") || on("bronchi") ? "rgb(143 176 137)" : "rgb(232 236 228)"}
          strokeOpacity={on("cilia") || on("bronchi") ? 0.95 : 0.22}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          className={cn(on("lungs") && "body-pulse")}
          d="M86 102c-16-2-28 10-30 28-2 16 6 36 18 42 8 4 16-2 18-12 3-16 4-36-6-58z"
          fill={on("lungs") ? "rgb(143 176 137)" : "rgb(232 236 228)"}
          fillOpacity={on("lungs") ? 0.55 : 0.12 + heal * 0.18}
        />
        <path
          className={cn(on("lungs") && "body-pulse")}
          d="M114 102c16-2 28 10 30 28 2 16-6 36-18 42-8 4-16-2-18-12-3-16-4-36 6-58z"
          fill={on("lungs") ? "rgb(143 176 137)" : "rgb(232 236 228)"}
          fillOpacity={on("lungs") ? 0.55 : 0.12 + heal * 0.18}
        />
        <path
          className={cn(on("heart") && "body-pulse")}
          d="M100 118c4-10 16-12 22-4 6 8 2 18-6 26-8 8-14 12-16 14-2-2-8-6-16-14-8-8-12-18-6-26 6-8 18-6 22 4z"
          fill={on("heart") ? "rgb(201 122 108)" : "rgb(201 122 108)"}
          fillOpacity={on("heart") ? 0.9 : 0.28 + heal * 0.2}
        />
        <path
          className={cn((on("circulation") || on("vessels")) && "body-pulse")}
          d="M78 92c-18 8-26 28-22 48m66-48c18 8 26 28 22 48M100 168v36"
          fill="none"
          stroke={on("circulation") || on("vessels") ? "rgb(201 122 108)" : "rgb(232 236 228)"}
          strokeOpacity={on("circulation") || on("vessels") ? 0.85 : 0.2}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {allDone ? "Healing holds" : `Next: ${REGION_LABEL[region]}`}
        <span className="mx-1.5 text-border">·</span>
        {Math.round(heal * 100)}% clearer
      </p>
    </div>
  );
}
