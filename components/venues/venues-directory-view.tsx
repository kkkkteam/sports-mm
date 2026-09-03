"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { VenueCard } from "@/components/venues/venue-card";
import { PRIVATE_VENUE_SPORT_OPTIONS } from "@/lib/private-venues";
import {
  HK_DISTRICT_LABELS,
  HK_DISTRICT_OPTIONS,
  type HkDistrict,
  type PrivateVenue,
} from "@/types/database";

export type VenueListItem = Pick<
  PrivateVenue,
  | "id"
  | "name"
  | "description"
  | "sport_types"
  | "district"
  | "address"
  | "images"
>;

const ALL_DISTRICTS = "all" as const;

export function VenuesDirectoryView({
  venues,
  loadIssue = false,
}: {
  venues: VenueListItem[];
  loadIssue?: boolean;
}) {
  const t = useTranslations("venuesPage");
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState<HkDistrict | typeof ALL_DISTRICTS>(
    ALL_DISTRICTS,
  );
  const [sportFilter, setSportFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return venues.filter((venue) => {
      if (district !== ALL_DISTRICTS && venue.district !== district) {
        return false;
      }
      if (sportFilter && !venue.sport_types.includes(sportFilter)) {
        return false;
      }
      if (!q) return true;

      const haystack = [
        venue.name,
        venue.address,
        venue.description ?? "",
        HK_DISTRICT_LABELS[venue.district],
        ...venue.sport_types,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [venues, query, district, sportFilter]);

  return (
    <div className="px-4 pb-28 pt-4 md:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          SportsShare HK
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </header>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="sr-only">{t("searchPlaceholder")}</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="m16 16 4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="min-h-12 w-full rounded-2xl border border-line-subtle bg-card py-3 pl-12 pr-4 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </label>

        <div className="flex flex-col gap-3 rounded-2xl border border-line-subtle bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted">{t("districtFilter")}</span>
            <select
              value={district}
              onChange={(event) =>
                setDistrict(event.target.value as HkDistrict | typeof ALL_DISTRICTS)
              }
              className="min-h-11 rounded-xl border border-line-subtle bg-canvas px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value={ALL_DISTRICTS}>{t("allDistricts")}</option>
              {HK_DISTRICT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <p className="shrink-0 text-sm text-muted">
            {t("resultCount", { count: filtered.length })}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted">{t("sportFilter")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSportFilter(null)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                sportFilter === null
                  ? "border-primary/35 bg-primary/10 text-primary"
                  : "border-line-subtle bg-card text-foreground hover:bg-mist",
              ].join(" ")}
            >
              {t("allSports")}
            </button>
            {PRIVATE_VENUE_SPORT_OPTIONS.map((sport) => {
              const active = sportFilter === sport;
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSportFilter(active ? null : sport)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-primary/35 bg-primary/10 text-primary"
                      : "border-line-subtle bg-card text-foreground hover:bg-mist",
                  ].join(" ")}
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-subtle bg-card px-6 py-16 text-center">
          {loadIssue && venues.length === 0 ? (
            <>
              <p className="text-base font-semibold text-foreground">
                {t("emptyLoadTitle")}
              </p>
              <p className="mt-2 text-sm text-muted">{t("emptyLoadHint")}</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-foreground">{t("emptyTitle")}</p>
              <p className="mt-2 text-sm text-muted">{t("emptyHint")}</p>
            </>
          )}
          {(query || district !== ALL_DISTRICTS || sportFilter) && venues.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setDistrict(ALL_DISTRICTS);
                setSportFilter(null);
              }}
              className="mt-4 text-sm font-semibold text-primary hover:opacity-80"
            >
              {t("clearFilters")}
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((venue) => (
            <li key={venue.id}>
              <VenueCard venue={venue} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-center text-xs text-muted">
        {t("footerHint")}{" "}
        <Link href="/games" className="font-semibold text-primary hover:opacity-80">
          {t("footerGamesLink")}
        </Link>
      </p>
    </div>
  );
}
