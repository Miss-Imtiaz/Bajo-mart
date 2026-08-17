// All "day" concepts in this app are calendar days for the physical store —
// not UTC instants. Every part of the app (dashboard, daily entry, reports)
// must agree on the exact same Date value for a given calendar day, or
// lookups silently miss (e.g. dashboard checking a different "today" than
// what was actually saved). These two helpers are the only place dates are
// converted, so there's a single source of truth.

export function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Converts a "YYYY-MM-DD" string into the exact UTC-midnight Date that
// matches how it's stored in the database (a plain DATE column) — regardless
// of what timezone the server or browser happens to be running in.
export function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
