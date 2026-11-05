const numberFormatter = new Intl.NumberFormat("en-US");

export const cardSurface =
  "rounded-2xl border border-white/[0.08] bg-zinc-900/60 shadow-sm shadow-black/20";

export function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? numberFormatter.format(number) : "—";
}

export function formatDate(value, options = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  }).format(date);
}

export function formatMonthYear(value, options = {}) {
  return formatDate(value, { month: "long", year: "numeric", day: undefined, ...options });
}
