import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCigsPerDay, parseCigsPerDay } from "@/lib/quit/format";

type Props = {
  value: string;
  onChange: (next: string) => void;
  onCommit?: (n: number) => void;
};

export function CigsPerDayField({ value, onChange, onCommit }: Props) {
  const n = parseCigsPerDay(value);
  const slider = Math.min(40, Math.max(0, n));

  function commit(raw: string) {
    const parsed = parseCigsPerDay(raw);
    onChange(formatCigsPerDay(parsed));
    onCommit?.(parsed);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <Label htmlFor="cigs-day">Cigarettes a day</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Average is fine, like 2.5.
          </p>
        </div>
        <Input
          id="cigs-day"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => commit(value)}
          aria-describedby="cigs-day-hint"
          className="h-11 w-20 shrink-0 text-right tabular-nums"
        />
      </div>
      <p id="cigs-day-hint" className="sr-only">
        Daily average. Use a decimal if some days are 2 and some are 3.
      </p>
      <Slider
        min={0}
        max={40}
        step={0.1}
        value={[slider]}
        onValueChange={(v) => onChange(formatCigsPerDay(v[0] ?? 0))}
        onValueCommit={(v) => commit(String(v[0] ?? 0))}
      />
    </div>
  );
}
