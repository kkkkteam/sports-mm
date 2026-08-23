"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import type { GameFilters, TimeSlot } from "@/lib/game-filters";
import {
  DATE_PRESETS,
  DEFAULT_GAME_FILTERS,
  type DateFilter,
} from "@/lib/game-filters";
import { formatDateFilterButtonLabel } from "@/components/games/active-filter-chips";
import { HK_DISTRICT_OPTIONS, type HkDistrict } from "@/types/database";

type FilterKey = "date" | "time" | "district" | "spots";

const TIME_SLOTS: { key: TimeSlot; hours: string }[] = [
  { key: "morning", hours: "06:00–12:00" },
  { key: "afternoon", hours: "12:00–18:00" },
  { key: "evening", hours: "18:00–24:00" },
];

function DateFilterPanel({
  listId,
  dateFilter,
  onChange,
  onClear,
  t,
}: {
  listId: string;
  dateFilter: DateFilter | null;
  onChange: (next: DateFilter) => void;
  onClear: () => void;
  t: ReturnType<typeof useTranslations<"games">>;
}) {
  const [rangeFrom, setRangeFrom] = useState(
    dateFilter?.type === "range" ? dateFilter.from : "",
  );
  const [rangeTo, setRangeTo] = useState(
    dateFilter?.type === "range" ? dateFilter.to : "",
  );

  useEffect(() => {
    if (dateFilter?.type === "range") {
      setRangeFrom(dateFilter.from);
      setRangeTo(dateFilter.to);
    }
  }, [dateFilter]);

  function applyRange() {
    if (!rangeFrom || !rangeTo) return;
    onChange({ type: "range", from: rangeFrom, to: rangeTo });
  }

  const activePreset =
    dateFilter?.type === "preset" ? dateFilter.preset : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted">{t("filterDateQuick")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DATE_PRESETS.map((preset) => {
            const selected = activePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ type: "preset", preset })}
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "border border-line-subtle bg-background text-foreground hover:border-primary/30",
                ].join(" ")}
              >
                {t(`datePreset_${preset}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor={`${listId}-date-input`}
          className="block text-xs font-semibold text-muted"
        >
          {t("filterDateSingle")}
        </label>
        <input
          id={`${listId}-date-input`}
          type="date"
          value={dateFilter?.type === "single" ? dateFilter.date : ""}
          onChange={(event) => {
            const next = event.target.value;
            if (next) onChange({ type: "single", date: next });
          }}
          className="mt-1.5 w-full rounded-lg border border-line-subtle bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-muted">{t("filterDateRange")}</p>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={`${listId}-date-from`} className="sr-only">
              {t("filterDateFrom")}
            </label>
            <input
              id={`${listId}-date-from`}
              type="date"
              value={rangeFrom}
              onChange={(event) => setRangeFrom(event.target.value)}
              className="w-full rounded-lg border border-line-subtle bg-background px-2 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor={`${listId}-date-to`} className="sr-only">
              {t("filterDateTo")}
            </label>
            <input
              id={`${listId}-date-to`}
              type="date"
              value={rangeTo}
              onChange={(event) => setRangeTo(event.target.value)}
              className="w-full rounded-lg border border-line-subtle bg-background px-2 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={!rangeFrom || !rangeTo}
          onClick={applyRange}
          className="mt-2 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40"
        >
          {t("filterApply")}
        </button>
      </div>

      {dateFilter ? (
        <button
          type="button"
          onClick={onClear}
          className="w-full text-xs font-semibold text-primary hover:underline"
        >
          {t("filterClear")}
        </button>
      ) : null}
    </div>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "text-[10px] text-muted transition-transform",
        open ? "rotate-180" : "",
      ].join(" ")}
    >
      ▾
    </span>
  );
}

function FilterDropdown({
  id,
  label,
  active,
  open,
  onToggle,
  onClose,
  children,
  panelClassName = "",
}: {
  id: string;
  label: ReactNode;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const panelWidth = panelRef.current?.offsetWidth ?? 224;
      const maxLeft = window.innerWidth - panelWidth - 8;
      const left = Math.max(8, Math.min(rect.left, maxLeft));

      setPosition({
        top: rect.bottom + 8,
        left,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const panel =
    open && mounted
      ? createPortal(
          <div
            id={id}
            ref={panelRef}
            role="dialog"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              zIndex: 60,
            }}
            className={[
              "mt-0 min-w-[14rem] rounded-xl border border-line-subtle bg-card p-3 shadow-lg",
              panelClassName,
            ].join(" ")}
          >
            {children}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className={[
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-line-subtle bg-card text-foreground hover:bg-mist/60",
        ].join(" ")}
      >
        {label}
        <ChevronDown open={open} />
      </button>
      {panel}
    </>
  );
}

export function GamesFilterBar({
  filters,
  onFiltersChange,
}: {
  filters: GameFilters;
  onFiltersChange: (patch: Partial<GameFilters>) => void;
}) {
  const t = useTranslations("games");
  const listId = useId();
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

  function closePanel() {
    setOpenFilter(null);
  }

  function togglePanel(key: FilterKey) {
    setOpenFilter((current) => (current === key ? null : key));
  }

  function toggleTimeSlot(slot: TimeSlot) {
    const next = filters.timeOfDay.includes(slot)
      ? filters.timeOfDay.filter((item) => item !== slot)
      : [...filters.timeOfDay, slot];
    onFiltersChange({ timeOfDay: next });
  }

  function toggleDistrict(value: HkDistrict) {
    const next = filters.districts.includes(value)
      ? filters.districts.filter((item) => item !== value)
      : [...filters.districts, value];
    onFiltersChange({ districts: next });
  }

  const timeLabel =
    filters.timeOfDay.length === 0
      ? t("filterTime")
      : filters.timeOfDay.length === 1
        ? t(`timeSlot_${filters.timeOfDay[0]}`)
        : t("filterTimeActive", { count: filters.timeOfDay.length });

  return (
    <div
      className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1"
      role="group"
      aria-label={t("advancedFilters")}
    >
      {/* Date */}
      <FilterDropdown
        id={`${listId}-date-panel`}
        active={Boolean(filters.dateFilter)}
        open={openFilter === "date"}
        onToggle={() => togglePanel("date")}
        onClose={closePanel}
        panelClassName="w-[min(20rem,calc(100vw-2rem))]"
        label={
          <>
            <span aria-hidden>📅</span>
            {formatDateFilterButtonLabel(filters.dateFilter, t)}
          </>
        }
      >
        <DateFilterPanel
          listId={listId}
          dateFilter={filters.dateFilter}
          t={t}
          onChange={(next) => onFiltersChange({ dateFilter: next })}
          onClear={() => {
            onFiltersChange({ dateFilter: null });
            closePanel();
          }}
        />
      </FilterDropdown>

      {/* Time */}
      <FilterDropdown
        id={`${listId}-time-panel`}
        active={filters.timeOfDay.length > 0}
        open={openFilter === "time"}
        onToggle={() => togglePanel("time")}
        onClose={closePanel}
        label={
          <>
            <span aria-hidden>⏰</span>
            {timeLabel}
          </>
        }
      >
        <p className="mb-2 text-xs font-semibold text-muted">{t("filterTime")}</p>
        <div className="flex flex-col gap-1">
          {TIME_SLOTS.map(({ key, hours }) => {
            const checked = filters.timeOfDay.includes(key);
            return (
              <label
                key={key}
                className={[
                  "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  checked
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground hover:bg-mist",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTimeSlot(key)}
                  className="accent-primary"
                />
                <span>
                  {t(`timeSlot_${key}`)}{" "}
                  <span className="text-xs text-muted">({hours})</span>
                </span>
              </label>
            );
          })}
        </div>
        {filters.timeOfDay.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              onFiltersChange({ timeOfDay: [] });
              closePanel();
            }}
            className="mt-2 w-full text-xs font-semibold text-primary hover:underline"
          >
            {t("filterClear")}
          </button>
        ) : null}
      </FilterDropdown>

      {/* Districts */}
      <FilterDropdown
        id={`${listId}-district-panel`}
        active={filters.districts.length > 0}
        open={openFilter === "district"}
        onToggle={() => togglePanel("district")}
        onClose={closePanel}
        panelClassName="w-[min(18rem,calc(100vw-2rem))]"
        label={
          <>
            <span aria-hidden>📍</span>
            {filters.districts.length > 0
              ? t("filterDistrictActive", { count: filters.districts.length })
              : t("filterDistrict")}
          </>
        }
      >
        <p className="mb-2 text-xs font-semibold text-muted">
          {t("filterDistrictHint")}
        </p>
        <ul className="max-h-60 space-y-1 overflow-y-auto">
          {HK_DISTRICT_OPTIONS.map(([value, label]) => {
            const checked = filters.districts.includes(value);
            return (
              <li key={value}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-mist">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDistrict(value)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              </li>
            );
          })}
        </ul>
        {filters.districts.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              onFiltersChange({ districts: [] });
              closePanel();
            }}
            className="mt-3 w-full text-xs font-semibold text-primary hover:underline"
          >
            {t("filterClear")}
          </button>
        ) : null}
      </FilterDropdown>

      {/* Min spots */}
      <FilterDropdown
        id={`${listId}-spots-panel`}
        active={filters.minSpots > DEFAULT_GAME_FILTERS.minSpots}
        open={openFilter === "spots"}
        onToggle={() => togglePanel("spots")}
        onClose={closePanel}
        label={
          <>
            <span aria-hidden>👥</span>
            {filters.minSpots > DEFAULT_GAME_FILTERS.minSpots
              ? t("filterSpotsActive", { count: filters.minSpots })
              : t("filterSpots")}
          </>
        }
      >
        <label
          htmlFor={`${listId}-min-spots`}
          className="text-xs font-semibold text-muted"
        >
          {t("filterSpotsHint")}
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="-1"
            disabled={filters.minSpots <= 1}
            onClick={() =>
              onFiltersChange({
                minSpots: Math.max(1, filters.minSpots - 1),
              })
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-subtle text-lg font-bold text-foreground hover:bg-mist disabled:opacity-40"
          >
            −
          </button>
          <input
            id={`${listId}-min-spots`}
            type="range"
            min={1}
            max={10}
            value={filters.minSpots}
            onChange={(event) =>
              onFiltersChange({ minSpots: Number(event.target.value) })
            }
            className="h-1.5 flex-1 cursor-pointer accent-primary"
          />
          <button
            type="button"
            aria-label="+1"
            disabled={filters.minSpots >= 10}
            onClick={() =>
              onFiltersChange({
                minSpots: Math.min(10, filters.minSpots + 1),
              })
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-subtle text-lg font-bold text-foreground hover:bg-mist disabled:opacity-40"
          >
            +
          </button>
          <span className="w-8 text-center text-sm font-bold tabular-nums text-primary">
            {filters.minSpots}
          </span>
        </div>
        {filters.minSpots > DEFAULT_GAME_FILTERS.minSpots ? (
          <button
            type="button"
            onClick={() => {
              onFiltersChange({ minSpots: DEFAULT_GAME_FILTERS.minSpots });
              closePanel();
            }}
            className="mt-3 w-full text-xs font-semibold text-primary hover:underline"
          >
            {t("filterClear")}
          </button>
        ) : null}
      </FilterDropdown>
    </div>
  );
}
