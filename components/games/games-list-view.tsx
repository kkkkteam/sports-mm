"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { GameCard } from "@/components/games/game-card";
import {
  ActiveFilterChips,
  FilterResultCount,
} from "@/components/games/active-filter-chips";
import { GamesFilterBar } from "@/components/games/games-filter-bar";
import {
  DEFAULT_GAME_FILTERS,
  filterGames,
  hasActiveFilters,
  type GameFilters,
} from "@/lib/game-filters";
import {
  distanceKm,
  resolveGameLocation,
} from "@/lib/geo";
import { useUserLocation } from "@/hooks/use-user-location";
import type { Sport } from "@/types/database";
import type { GameListRow } from "@/components/games/game-list-item";

export type GamesTab = "discover" | "hosting" | "joined";

function SegmentedTabs({
  tabs,
  activeIndex,
  onSelect,
}: {
  tabs: { key: GamesTab; label: string; disabled?: boolean }[];
  activeIndex: number;
  onSelect: (key: GamesTab, disabled?: boolean) => void;
}) {
  return (
    <div
      role="tablist"
      className="relative mx-4 grid grid-cols-3 rounded-full bg-mist p-1 ring-1 ring-line-subtle/80"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-out"
        style={{
          width: "calc((100% - 0.5rem) / 3)",
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
      />
      {tabs.map((item, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onSelect(item.key, item.disabled)}
            className={[
              "relative z-10 rounded-full px-2 py-2 text-xs font-semibold transition-colors sm:text-sm",
              active ? "text-accent" : "text-muted hover:text-ink",
              item.disabled ? "opacity-50" : "",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function FilteredEmptyState({ onClear }: { onClear: () => void }) {
  const t = useTranslations("games");

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent/20 bg-accent-soft/50 px-6 py-16 text-center ring-1 ring-line-subtle/60">
      <p className="text-base font-semibold text-ink">{t("emptyFiltered")}</p>
      <p className="max-w-xs text-sm text-muted">{t("emptyFilteredHint")}</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-1 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
      >
        {t("clearAllFilters")}
      </button>
    </div>
  );
}

export function GamesListView({
  games,
  sports,
  tab,
  isAuthed,
}: {
  games: GameListRow[];
  sports: Sport[];
  tab: GamesTab;
  isAuthed: boolean;
}) {
  const t = useTranslations("games");
  const locale = useLocale();
  const router = useRouter();
  const { status, position, request } = useUserLocation(tab === "discover");
  const locating = status === "idle" || status === "locating";

  const [allGames, setAllGames] = useState<GameListRow[]>(games);
  const [filters, setFilters] = useState<GameFilters>(DEFAULT_GAME_FILTERS);

  useEffect(() => {
    setAllGames(games);
  }, [games]);

  useEffect(() => {
    setFilters(DEFAULT_GAME_FILTERS);
  }, [tab]);

  const updateFilters = useCallback((patch: Partial<GameFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const sortedGames = useMemo(() => {
    if (!position) return allGames;
    return [...allGames].sort((a, b) => {
      const locA = resolveGameLocation(a);
      const locB = resolveGameLocation(b);
      if (!locA && !locB) return 0;
      if (!locA) return 1;
      if (!locB) return -1;
      return distanceKm(position, locA) - distanceKm(position, locB);
    });
  }, [allGames, position]);

  const filteredGames = useMemo(
    () => filterGames(sortedGames, filters),
    [sortedGames, filters],
  );

  const tabs: { key: GamesTab; label: string; requiresAuth?: boolean }[] = [
    { key: "discover", label: t("tabDiscover") },
    { key: "hosting", label: t("tabHosting"), requiresAuth: true },
    { key: "joined", label: t("tabJoined"), requiresAuth: true },
  ];

  const activeIndex = Math.max(
    0,
    tabs.findIndex((item) => item.key === tab),
  );

  function pushTab(nextTab: GamesTab) {
    if (nextTab === "discover") {
      router.push("/games");
      return;
    }
    router.push(`/games?tab=${nextTab}`);
  }

  const tabEmptyMessage =
    tab === "hosting"
      ? t("emptyHosting")
      : tab === "joined"
        ? t("emptyJoined")
        : t("empty");

  const showFilteredEmpty =
    allGames.length > 0 &&
    filteredGames.length === 0 &&
    hasActiveFilters(filters);

  return (
    <div className="relative pb-28">
      <div className="sticky top-0 z-20 space-y-3 bg-canvas/95 pb-3 pt-2 backdrop-blur-md">
        <div className="px-4">
          <h1 className="text-xl font-black tracking-tight text-ink">
            {t("findTitle")}
          </h1>
          <p className="mt-0.5 text-sm text-muted">{t("findLede")}</p>
        </div>

        <SegmentedTabs
          tabs={tabs.map((item) => ({
            key: item.key,
            label: item.label,
            disabled: item.requiresAuth && !isAuthed,
          }))}
          activeIndex={activeIndex}
          onSelect={(key, disabled) => {
            if (disabled) {
              router.push("/login?next=/games");
              return;
            }
            pushTab(key);
          }}
        />

        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
          <button
            type="button"
            onClick={() => updateFilters({ sport: "all" })}
            className={[
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              filters.sport === "all"
                ? "bg-accent text-on-accent"
                : "bg-mist text-ink hover:bg-line-subtle",
            ].join(" ")}
          >
            {t("all")}
          </button>
          {sports.map((sport) => {
            const active = filters.sport === sport.slug;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => updateFilters({ sport: sport.slug })}
                className={[
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-accent text-on-accent"
                    : "bg-mist text-ink hover:bg-line-subtle",
                ].join(" ")}
              >
                {locale === "en" ? sport.name_en : sport.name_zh}
              </button>
            );
          })}
        </div>

        <GamesFilterBar filters={filters} onFiltersChange={updateFilters} />

        <ActiveFilterChips
          filters={filters}
          sports={sports}
          onFiltersChange={updateFilters}
          onClearAll={() => setFilters(DEFAULT_GAME_FILTERS)}
        />
      </div>

      <div className="px-4 pt-2 md:px-6">
        <FilterResultCount
          filteredCount={filteredGames.length}
          totalCount={allGames.length}
        />
        {tab === "discover" &&
        (status === "denied" ||
          status === "unavailable" ||
          status === "error") ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-mist/60 px-4 py-3 text-sm ring-1 ring-line-subtle">
            <p className="text-muted">{t("distancePermissionHint")}</p>
            <button
              type="button"
              onClick={request}
              className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-on-accent"
            >
              {t("distanceEnable")}
            </button>
          </div>
        ) : null}

        {allGames.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">{tabEmptyMessage}</p>
        ) : showFilteredEmpty ? (
          <FilteredEmptyState
            onClear={() => setFilters(DEFAULT_GAME_FILTERS)}
          />
        ) : filteredGames.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">{tabEmptyMessage}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {filteredGames.map((game) => (
              <li key={game.id} className="min-h-0">
                <GameCard
                  game={game}
                  userPosition={position}
                  locating={locating}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href={isAuthed ? "/games/new" : "/login?next=/games/new"}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-90"
      >
        <span className="text-lg leading-none">+</span>
        {t("createGame")}
      </Link>
    </div>
  );
}
