import { formatMoney } from "@/lib/quit/format";
import type { QuitStats } from "@/lib/quit/stats";

export function ChipRow({ stats, currency }: { stats: QuitStats; currency: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Chip label="Not smoked" value={formatCount(stats.cigarettesAvoided)} />
      <Chip label="Kept" value={formatMoney(stats.moneySaved, currency)} />
      <Chip label="Time back" value={formatMinutes(stats.minutesReturned)} />
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-card px-2 py-3 text-center shadow-[0_0_0_1px_rgba(242,240,235,0.08)]">
      <div className="truncate font-display text-base font-medium tabular-nums tracking-tight sm:text-lg">
        {value}
      </div>
      <div className="mt-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  if (n < 10) return n.toFixed(1).replace(/\.0$/, "");
  if (n < 1000) return Math.floor(n).toString();
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.floor(n / 1000)}k`;
}

function formatMinutes(n: number): string {
  if (n < 60) return `${Math.floor(n)}m`;
  const h = Math.floor(n / 60);
  if (h < 48) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
