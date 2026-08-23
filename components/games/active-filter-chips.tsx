"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  dateFilterKey,
  DEFAULT_GAME_FILTERS,
  hasActiveFilters,
  resolveDateFilterBounds,
  type DateFilter,
  type GameFilters,
  type TimeSlot,
} from "@/lib/game-filters";
import {
  HK_DISTRICT_LABELS,
  type HkDistrict,
  type Sport,
} from "@/types/database";

type FilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

function ChipRemoveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatDateFilterChipLabel(
  filter: DateFilter,
  t: ReturnType<typeof useTranslations<"games">>,
) {
  if (filter.type === "preset") {
    return t(`datePreset_${filter.preset}`);
  }

  if (filter.type === "single") {
    return filter.date;
  }

  const { from, to } = resolveDateFilterBounds(filter);
  return from === to ? from : t("filterDateRangeActive", { from, to });
}

function buildActiveFilterChips(
  filters: GameFilters,
  sports: Sport[],
  locale: string,
  t: ReturnType<typeof useTranslations<"games">>,
  onFiltersChange: (patch: Partial<GameFilters>) => void,
): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.sport !== "all") {
    const sport = sports.find((item) => item.slug === filters.sport);
    const label =
      sport != null
        ? locale === "en"
          ? sport.name_en
          : sport.name_zh
        : filters.sport;

    chips.push({
      id: `sport-${filters.sport}`,
      label,
      onRemove: () => onFiltersChange({ sport: "all" }),
    });
  }

  if (filters.dateFilter) {
    chips.push({
      id: `date-${dateFilterKey(filters.dateFilter)}`,
      label: formatDateFilterChipLabel(filters.dateFilter, t),
      onRemove: () => onFiltersChange({ dateFilter: null }),
    });
  }

  for (const slot of filters.timeOfDay) {
    chips.push({
      id: `time-${slot}`,
      label: t(`timeSlot_${slot}` as `timeSlot_${TimeSlot}`),
      onRemove: () =>
        onFiltersChange({
          timeOfDay: filters.timeOfDay.filter((item) => item !== slot),
        }),
    });
  }

  for (const district of filters.districts) {
    chips.push({
      id: `district-${district}`,
      label: HK_DISTRICT_LABELS[district as HkDistrict],
      onRemove: () =>
        onFiltersChange({
          districts: filters.districts.filter((item) => item !== district),
        }),
    });
  }

  if (filters.minSpots > DEFAULT_GAME_FILTERS.minSpots) {
    chips.push({
      id: `minSpots-${filters.minSpots}`,
      label: t("filterChipMinSpots", { count: filters.minSpots }),
      onRemove: () =>
        onFiltersChange({ minSpots: DEFAULT_GAME_FILTERS.minSpots }),
    });
  }

  return chips;
}

export function ActiveFilterChips({
  filters,
  sports,
  onFiltersChange,
  onClearAll,
}: {
  filters: GameFilters;
  sports: Sport[];
  onFiltersChange: (patch: Partial<GameFilters>) => void;
  onClearAll: () => void;
}) {
  const t = useTranslations("games");
  const locale = useLocale();

  const chips = useMemo(
    () =>
      buildActiveFilterChips(filters, sports, locale, t, onFiltersChange),
    [filters, sports, locale, t, onFiltersChange],
  );

  if (!hasActiveFilters(filters)) {
    return null;
  }

  return (
    <div
      className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 pb-1"
      role="list"
      aria-label={t("activeFiltersLabel")}
    >
      {chips.map((chip) => (
        <span
          key={chip.id}
          role="listitem"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary/10 py-1 pl-2.5 pr-1.5 text-sm text-primary"
        >
          <span className="max-w-[12rem] truncate">{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={t("removeFilter", { label: chip.label })}
            className="rounded-full p-0.5 transition-colors hover:bg-primary/15"
          >
            <ChipRemoveIcon />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="shrink-0 px-1 text-sm font-semibold text-primary underline-offset-2 hover:underline"
      >
        {t("clearAll")}
      </button>
    </div>
  );
}

export function formatDateFilterButtonLabel(
  filter: DateFilter | null,
  t: ReturnType<typeof useTranslations<"games">>,
) {
  if (!filter) return t("filterDate");

  if (filter.type === "preset") {
    return t(`datePreset_${filter.preset}`);
  }

  if (filter.type === "single") {
    return t("filterDateActive", { date: filter.date });
  }

  const { from, to } = resolveDateFilterBounds(filter);
  return from === to
    ? t("filterDateActive", { date: from })
    : t("filterDateRangeActive", { from, to });
}

export function FilterResultCount({
  filteredCount,
  totalCount,
}: {
  filteredCount: number;
  totalCount: number;
}) {
  const t = useTranslations("games");

  if (totalCount === 0) {
    return null;
  }

  return (
    <p className="mb-3 text-sm text-muted">
      {t.rich("resultCount", {
        filtered: filteredCount,
        total: totalCount,
        highlight: (chunks) => (
          <span className="font-semibold text-foreground">{chunks}</span>
        ),
      })}
    </p>
  );
}
