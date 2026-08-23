import type { CostSplitMode, Game } from "@/types/database";

const hkDate = new Intl.DateTimeFormat("zh-HK", {
  timeZone: "Asia/Hong_Kong",
  year: "numeric",
  month: "short",
  day: "numeric",
  weekday: "short",
});

const hkTime = new Intl.DateTimeFormat("zh-HK", {
  timeZone: "Asia/Hong_Kong",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const hkDateTime = new Intl.DateTimeFormat("zh-HK", {
  timeZone: "Asia/Hong_Kong",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatHkDate(iso: string) {
  return hkDate.format(new Date(iso));
}

export function formatHkTime(iso: string) {
  return hkTime.format(new Date(iso));
}

export function formatHkDateTime(iso: string) {
  return hkDateTime.format(new Date(iso));
}

export function formatHkd(amount: number) {
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Compact fee label for list cards, e.g. HKD$75 */
export function formatHkdCompact(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return "HKD$0";
  const rounded =
    amount % 1 === 0 ? String(Math.round(amount)) : amount.toFixed(2);
  return `HKD$${rounded}`;
}

export function formatGameDateParts(iso: string, locale: string) {
  const date = new Date(iso);
  const timeZone = "Asia/Hong_Kong";

  const month = new Intl.DateTimeFormat(locale, {
    timeZone,
    month: "numeric",
  }).format(date);

  const day = new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "numeric",
  }).format(date);

  const weekday = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "short",
  }).format(date);

  const monthLabel =
    locale === "en"
      ? new Intl.DateTimeFormat(locale, { timeZone, month: "short" }).format(date)
      : `${month}月`;

  return { month: monthLabel, day, weekday };
}

/** Compact date for info chips, e.g. 8月26日 (週三) */
export function formatDateChip(iso: string, locale: string) {
  const { month, day, weekday } = formatGameDateParts(iso, locale);
  if (locale === "en") {
    return `${month} ${day} (${weekday})`;
  }
  return `${month}${day}日 (${weekday})`;
}

export function formatTimeRange(startIso: string, endIso: string, locale: string) {
  const timeZone = "Asia/Hong_Kong";
  const fmt = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${fmt.format(new Date(startIso))} - ${fmt.format(new Date(endIso))}`;
}

export function formatDurationHours(startIso: string, endIso: string, locale: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const hours = Math.round((ms / (1000 * 60 * 60)) * 10) / 10;
  if (locale === "en") {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${hours} 小時`;
}

export function formatDetailDateTime(iso: string, locale: string) {
  const timeZone = "Asia/Hong_Kong";
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function costPerPerson(
  totalCostHkd: number | string,
  maxPlayers: number,
  mode: CostSplitMode = "all_players",
) {
  const total = Number(totalCostHkd);
  if (!Number.isFinite(total) || total <= 0) return 0;
  const divisor =
    mode === "joiners_only" ? Math.max(1, maxPlayers - 1) : Math.max(1, maxPlayers);
  return Math.round((total / divisor) * 100) / 100;
}

export function gameCostPerPerson(game: Pick<Game, "total_cost_hkd" | "max_players" | "cost_split_mode">) {
  return costPerPerson(game.total_cost_hkd, game.max_players, game.cost_split_mode);
}

/** Convert datetime-local value (local wall clock) to ISO string. */
export function datetimeLocalToIso(value: string) {
  return new Date(value).toISOString();
}

export function defaultStartLocal() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);
  return toDatetimeLocalValue(d);
}

export function defaultEndLocal(startLocal: string) {
  const d = new Date(startLocal);
  if (Number.isNaN(d.getTime())) return "";
  d.setHours(d.getHours() + 2);
  return toDatetimeLocalValue(d);
}

export function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
