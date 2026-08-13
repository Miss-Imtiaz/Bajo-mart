// All "day" concepts in this app are calendar days for the physical store —
// not UTC instants. Every part of the app (dashboard, daily entry, reports)
// must agree on the exact same Date value for a given calendar day, or
// lookups silently miss.

export function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}