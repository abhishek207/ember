const CURRENCY_LOCALES: Record<string, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
};

export function formatMoney(amount: number, currency = "INR"): string {
  const code = currency in CURRENCY_LOCALES ? currency : "INR";
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALES[code], {
      style: "currency",
      currency: code,
      maximumFractionDigits: amount >= 100 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(0)} ${code}`;
  }
}

export function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

export function splitDuration(totalSeconds: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return { days, hours, minutes, seconds };
}

export function formatCompactDuration(totalSeconds: number): string {
  const { days, hours, minutes } = splitDuration(totalSeconds);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function toLocalDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function toLocalTimeInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Combine native date + time inputs into an ISO string in the local zone. */
export function fromLocalInputs(date: string, time: string): string {
  const t = time && time.length >= 4 ? time : "00:00";
  const d = new Date(`${date}T${t}:00`);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
