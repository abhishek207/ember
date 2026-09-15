/** Gmail treats dots and +tags as the same inbox. */
export function emailMatchKeys(email: string): string[] {
  const raw = email.trim().toLowerCase();
  if (!raw) return [];
  const keys = new Set<string>([raw]);
  const at = raw.lastIndexOf("@");
  if (at < 1) return [...keys];
  const local = raw.slice(0, at);
  const domain = raw.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    const base = (local.split("+")[0] ?? local).replace(/\./g, "");
    keys.add(`${base}@gmail.com`);
  }
  return [...keys];
}

export function emailsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const left = new Set(emailMatchKeys(a));
  return emailMatchKeys(b).some((key) => left.has(key));
}

export function namesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = (a ?? "").trim().toLowerCase();
  const right = (b ?? "").trim().toLowerCase();
  return Boolean(left) && left === right;
}
