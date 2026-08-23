"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  formatDateChip,
  formatHkdCompact,
  formatTimeRange,
  gameCostPerPerson,
} from "@/lib/format";
import {
  distanceKm,
  formatDistanceKm,
  resolveGameLocation,
  type LatLng,
} from "@/lib/geo";
import {
  HK_DISTRICT_LABELS,
  SKILL_LEVEL_LABELS,
  type HkDistrict,
  type SkillLevel,
} from "@/types/database";
import type { GameListRow } from "@/components/games/game-list-item";

const SPORT_EMOJI: Record<string, string> = {
  basketball: "🏀",
  badminton: "🏸",
  table_tennis: "🏓",
  tennis: "🎾",
  football: "⚽",
  volleyball: "🏐",
  pickleball: "🎾",
};

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
      {name.slice(0, 1)}
    </span>
  );
}

function InfoChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-mist/80 px-2.5 py-1.5 text-xs font-medium text-ink ring-1 ring-line-subtle/60 dark:bg-surface">
      {children}
    </span>
  );
}

export function GameCard({
  game,
  userPosition,
  locating = false,
}: {
  game: GameListRow;
  userPosition?: LatLng | null;
  locating?: boolean;
}) {
  const t = useTranslations("games");
  const locale = useLocale();
  const fee = gameCostPerPerson(game);
  const district = game.district as HkDistrict;
  const skill = game.min_skill as SkillLevel | null;
  const hostName = game.profiles?.nickname ?? "—";
  const sportSlug = game.sports?.slug ?? "";
  const sportName =
    locale === "en"
      ? (game.sports?.name_en ?? game.sports?.name_zh ?? "—")
      : (game.sports?.name_zh ?? "—");
  const sportEmoji = SPORT_EMOJI[sportSlug] ?? "🏅";
  const dateChip = formatDateChip(game.starts_at, locale);
  const timeChip = formatTimeRange(game.starts_at, game.ends_at, locale);
  const progress = Math.min(
    100,
    Math.round((game.current_players / Math.max(game.max_players, 1)) * 100),
  );

  const venue = resolveGameLocation(game);
  let locationChip = HK_DISTRICT_LABELS[district];
  if (locating) {
    locationChip = t("distanceLocating");
  } else if (userPosition && venue) {
    locationChip = t("districtWithDistance", {
      district: HK_DISTRICT_LABELS[district],
      km: formatDistanceKm(distanceKm(userPosition, venue)),
    });
  }

  const skillChip = skill ? SKILL_LEVEL_LABELS[skill] : t("skillAny");

  return (
    <Link
      href={`/games/${game.id}`}
      className="flex h-full flex-col rounded-2xl bg-surface p-4 shadow-[0_2px_14px_rgba(15,23,42,0.05)] ring-1 ring-line-subtle/70 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.3)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={hostName} />
          <p className="min-w-0 text-sm text-muted">
            <span className="font-semibold text-ink">{hostName}</span>{" "}
            {t("initiatedActivity")}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
          {sportEmoji} {sportName}
        </span>
      </div>

      {/* Body */}
      <h2 className="mt-4 text-lg font-black leading-snug tracking-tight text-ink">
        {game.title}
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        <InfoChip>
          <span aria-hidden>🗓️</span>
          {dateChip}
        </InfoChip>
        <InfoChip>
          <span aria-hidden>⏰</span>
          {timeChip}
        </InfoChip>
        <InfoChip>
          <span aria-hidden>📍</span>
          {locationChip}
        </InfoChip>
        <InfoChip>
          <span aria-hidden>📊</span>
          {skillChip}
        </InfoChip>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-end justify-between gap-4 pt-5">
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-xs font-semibold tabular-nums text-muted">
            {t("spotsTakenPeople", {
              current: game.current_players,
              max: game.max_players,
            })}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="shrink-0 text-xl font-black tracking-tight text-ink">
          {formatHkdCompact(fee)}
        </p>
      </div>
    </Link>
  );
}
