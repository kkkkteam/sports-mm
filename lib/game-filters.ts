import type { GameListRow } from "@/components/games/game-list-item";
import type { HkDistrict } from "@/types/database";

export type TimeSlot = "morning" | "afternoon" | "evening";

export type DatePreset =
  | "today"
  | "tomorrow"
  | "this_weekend"
  | "next_7_days"
  | "next_30_days";

export type DateFilter =
  | { type: "single"; date: string }
  | { type: "range"; from: string; to: string }
  | { type: "preset"; preset: DatePreset };

export type GameFilters = {
  sport: string;
  dateFilter: DateFilter | null;
  timeOfDay: TimeSlot[];
  districts: HkDistrict[];
  minSpots: number;
};

export const DEFAULT_GAME_FILTERS: GameFilters = {
  sport: "all",
  dateFilter: null,
  timeOfDay: [],
  districts: [],
  minSpots: 1,
};

export const DATE_PRESETS: DatePreset[] = [
  "today",
  "tomorrow",
  "this_weekend",
  "next_7_days",
  "next_30_days",
];

const HK_TZ = "Asia/Hong_Kong";

export function hkTodayString(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: HK_TZ }).format(now);
}

export function hkDateFromIso(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: HK_TZ }).format(
    new Date(iso),
  );
}

export function addHkDays(dateStr: string, days: number) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day + days, 12, 0, 0);
  return new Intl.DateTimeFormat("en-CA", { timeZone: HK_TZ }).format(
    new Date(utc),
  );
}

export function hkWeekdayIndex(dateStr: string) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: HK_TZ,
    weekday: "short",
  }).format(new Date(`${dateStr}T12:00:00+08:00`));
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekday] ?? 0;
}

export function resolveDateFilterBounds(
  filter: DateFilter,
  now = new Date(),
): { from: string; to: string } {
  const today = hkTodayString(now);

  if (filter.type === "single") {
    return { from: filter.date, to: filter.date };
  }

  if (filter.type === "range") {
    const from = filter.from <= filter.to ? filter.from : filter.to;
    const to = filter.from <= filter.to ? filter.to : filter.from;
    return { from, to };
  }

  switch (filter.preset) {
    case "today":
      return { from: today, to: today };
    case "tomorrow": {
      const tomorrow = addHkDays(today, 1);
      return { from: tomorrow, to: tomorrow };
    }
    case "this_weekend": {
      const weekday = hkWeekdayIndex(today);
      if (weekday === 6) {
        const sunday = addHkDays(today, 1);
        return { from: today, to: sunday };
      }
      if (weekday === 0) {
        return { from: today, to: today };
      }
      const daysUntilSaturday = 6 - weekday;
      const saturday = addHkDays(today, daysUntilSaturday);
      const sunday = addHkDays(saturday, 1);
      return { from: saturday, to: sunday };
    }
    case "next_7_days":
      return { from: today, to: addHkDays(today, 6) };
    case "next_30_days":
      return { from: today, to: addHkDays(today, 29) };
  }
}

export function isDateWithinFilter(iso: string, filter: DateFilter) {
  const { from, to } = resolveDateFilterBounds(filter);
  const date = hkDateFromIso(iso);
  return date >= from && date <= to;
}

export function dateFilterKey(filter: DateFilter) {
  if (filter.type === "single") return `single:${filter.date}`;
  if (filter.type === "range") return `range:${filter.from}:${filter.to}`;
  return `preset:${filter.preset}`;
}

export function hkHour(iso: string) {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: HK_TZ,
      hour: "numeric",
      hour12: false,
    }).format(new Date(iso)),
  );
}

export function matchesTimeSlot(iso: string, slot: TimeSlot) {
  const hour = hkHour(iso);
  if (slot === "morning") return hour >= 6 && hour < 12;
  if (slot === "afternoon") return hour >= 12 && hour < 18;
  return hour >= 18 && hour <= 23;
}

export function hasActiveFilters(filters: GameFilters) {
  return (
    filters.sport !== "all" ||
    filters.dateFilter !== null ||
    filters.timeOfDay.length > 0 ||
    filters.districts.length > 0 ||
    filters.minSpots > DEFAULT_GAME_FILTERS.minSpots
  );
}

export function filterGames(
  games: GameListRow[],
  filters: GameFilters,
): GameListRow[] {
  return games.filter((game) => {
    if (filters.sport !== "all" && game.sports?.slug !== filters.sport) {
      return false;
    }

    if (filters.dateFilter && !isDateWithinFilter(game.starts_at, filters.dateFilter)) {
      return false;
    }

    if (
      filters.timeOfDay.length > 0 &&
      !filters.timeOfDay.some((slot) => matchesTimeSlot(game.starts_at, slot))
    ) {
      return false;
    }

    if (
      filters.districts.length > 0 &&
      !filters.districts.includes(game.district as HkDistrict)
    ) {
      return false;
    }

    if (game.spots_needed < filters.minSpots) {
      return false;
    }

    return true;
  });
}
