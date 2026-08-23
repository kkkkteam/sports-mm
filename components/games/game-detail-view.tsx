"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  formatDetailDateTime,
  formatDurationHours,
  formatHkdCompact,
  formatTimeRange,
  gameCostPerPerson,
} from "@/lib/format";
import { handleAddToCalendar } from "@/components/games/game-calendar-action";
import { HostPaymentMethodsBlock } from "@/components/games/host-payment-methods-block";
import { openMap } from "@/lib/open-map";
import {
  HK_DISTRICT_LABELS,
  SKILL_LEVEL_LABELS,
  type HkDistrict,
  type SkillLevel,
} from "@/types/database";

export type GameDetailTab = "details" | "participants";

export type GameDetailParticipant = {
  userId: string;
  nickname: string;
  isHost: boolean;
  rating: number | null;
  ratingCount: number;
};

export type GameDetailData = {
  id: string;
  title: string;
  description: string | null;
  venueLabel: string;
  district: HkDistrict;
  lat: number | null;
  lng: number | null;
  startsAt: string;
  endsAt: string;
  maxPlayers: number;
  currentPlayers: number;
  spotsNeeded: number;
  totalCostHkd: number;
  costSplitMode: "all_players" | "joiners_only";
  minSkill: SkillLevel | null;
  sportName: string;
  host: {
    id: string;
    nickname: string;
    rating: number | null;
    ratingCount: number;
    acceptedPaymentMethods: string[];
  };
  participants: GameDetailParticipant[];
};

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M14.5 6 9 11.5l5.5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 16V8m0 0 3.5 3.5M12 8 8.5 11.5M6 14.5v3A1.5 1.5 0 0 0 7.5 19h9a1.5 1.5 0 0 0 1.5-1.5v-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-muted" fill="none" aria-hidden>
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-accent" fill="none" aria-hidden>
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-accent" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HostAvatar({ name }: { name: string }) {
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xl font-black text-accent">
      {name.slice(0, 1)}
    </span>
  );
}

function ParticipantAvatar({ name }: { name: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist text-sm font-bold text-ink">
      {name.slice(0, 1)}
    </span>
  );
}

function InfoGridItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-mist/70 px-3 py-3 text-center ring-1 ring-line-subtle dark:bg-surface dark:ring-line-subtle/60">
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function DetailsTab({
  game,
  locale,
  calendarDescription,
}: {
  game: GameDetailData;
  locale: string;
  calendarDescription: string;
}) {
  const t = useTranslations("gameDetail");
  const fee = gameCostPerPerson({
    total_cost_hkd: game.totalCostHkd,
    max_players: game.maxPlayers,
    cost_split_mode: game.costSplitMode,
  });
  const progress = Math.min(
    100,
    Math.round((game.currentPlayers / Math.max(game.maxPlayers, 1)) * 100),
  );
  const matchType = game.minSkill
    ? `${game.sportName} · ${SKILL_LEVEL_LABELS[game.minSkill]}`
    : game.sportName;
  const duration = formatDurationHours(game.startsAt, game.endsAt, locale);
  const capacityLabel = t("capacityValue", { max: game.maxPlayers });
  const districtLabel = HK_DISTRICT_LABELS[game.district];

  function handleOpenMap() {
    openMap({
      lat: game.lat,
      lng: game.lng,
      venueLabel: game.venueLabel,
      districtLabel,
    });
  }

  function onAddToCalendar() {
    handleAddToCalendar({
      id: game.id,
      title: game.title,
      startsAt: game.startsAt,
      endsAt: game.endsAt,
      venueLabel: game.venueLabel,
      location: `${game.venueLabel}, ${districtLabel}`,
      description: calendarDescription,
    });
  }

  return (
    <div className="space-y-5 px-4 pb-4">
      <section className="rounded-2xl bg-surface p-4 ring-1 ring-line-subtle">
        <div className="flex items-center gap-3">
          <HostAvatar name={game.host.nickname} />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-ink">{game.host.nickname}</p>
            <span className="mt-1 inline-flex rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">
              {t("hostBadge")}
            </span>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-canvas px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("hostRemarks")}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">
            {game.description?.trim() || t("hostRemarksEmpty")}
          </p>
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-4 ring-1 ring-line-subtle">
        <div className="flex items-start gap-3">
          <CalendarIcon />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-ink">
              {formatDetailDateTime(game.startsAt, locale)}
            </p>
            <p className="mt-1 text-sm text-muted">
              {formatTimeRange(game.startsAt, game.endsAt, locale)}
            </p>
            <button
              type="button"
              onClick={onAddToCalendar}
              className="mt-3 cursor-pointer text-sm font-semibold text-accent hover:opacity-80"
            >
              {t("addToCalendar")}
            </button>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={handleOpenMap}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-surface p-4 text-left ring-1 ring-line-subtle transition-colors hover:bg-mist/40"
      >
        <LocationIcon />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-ink">{game.venueLabel}</p>
          <p className="mt-0.5 text-sm text-muted">{districtLabel}</p>
        </div>
        <ChevronRightIcon />
      </button>

      <section className="rounded-2xl bg-surface p-4 ring-1 ring-line-subtle">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted">{t("feeLabel")}</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-ink">
              {formatHkdCompact(fee)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted">{t("rosterLabel")}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-ink">
              {t("spotsTaken", {
                current: game.currentPlayers,
                max: game.maxPlayers,
              })}
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <HostPaymentMethodsBlock
        acceptedPaymentMethods={game.host.acceptedPaymentMethods}
      />

      <div className="grid grid-cols-3 gap-2">
        <InfoGridItem label={t("matchType")} value={matchType} />
        <InfoGridItem label={t("duration")} value={duration} />
        <InfoGridItem label={t("capacity")} value={capacityLabel} />
      </div>
    </div>
  );
}

function ParticipantsTab({ game }: { game: GameDetailData }) {
  const t = useTranslations("gameDetail");
  const accepted = game.participants;

  return (
    <div className="px-4 pb-4">
      <p className="mb-4 text-sm font-semibold text-muted">
        {t("acceptedParticipants", {
          current: accepted.length,
          max: game.maxPlayers,
        })}
      </p>

      <ul className="space-y-3">
        {accepted.map((participant) => (
          <li
            key={participant.userId}
            className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-line-subtle"
          >
            <ParticipantAvatar name={participant.nickname} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink">{participant.nickname}</p>
              {participant.isHost ? (
                <span className="mt-0.5 inline-flex rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                  {t("hostBadge")}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {game.spotsNeeded > 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line-subtle px-4 py-3 text-center text-sm text-muted">
          {t("emptySlots", { count: game.spotsNeeded })}
        </p>
      ) : (
        <p className="mt-4 text-center text-sm font-medium text-muted">{t("full")}</p>
      )}
    </div>
  );
}

export function GameDetailView({
  game,
  footer,
  extra,
  calendarDescription,
}: {
  game: GameDetailData;
  footer: ReactNode;
  extra?: ReactNode;
  calendarDescription: string;
}) {
  const t = useTranslations("gameDetail");
  const locale = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<GameDetailTab>("details");

  async function shareGame() {
    const url = window.location.href;
    const payload = {
      title: game.title,
      text: `${game.title} · ${game.venueLabel}`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      window.alert(t("linkCopied"));
    } catch {
      window.prompt(t("copyLink"), url);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-line-subtle bg-canvas/95 backdrop-blur-md pt-safe">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
            aria-label={t("back")}
          >
            <BackIcon />
          </button>
          <h1 className="truncate text-base font-bold">{t("pageTitle")}</h1>
          <button
            type="button"
            onClick={shareGame}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
            aria-label={t("share")}
          >
            <ShareIcon />
          </button>
        </div>

        <div
          role="tablist"
          aria-label={t("pageTitle")}
          className="flex border-t border-line-subtle"
        >
          {(
            [
              { key: "details" as const, label: t("tabDetails") },
              { key: "participants" as const, label: t("tabParticipants") },
            ] as const
          ).map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.key)}
                className={[
                  "relative flex-1 py-3 text-sm font-semibold transition-colors",
                  active ? "text-accent" : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-accent" />
                ) : null}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-40 pt-4 [-webkit-overflow-scrolling:touch]">
        <div className="px-4 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            {game.sportName}
          </p>
          <h2 className="mt-1 text-2xl font-black leading-tight tracking-tight text-ink">
            {game.title}
          </h2>
        </div>

        {tab === "details" ? (
          <DetailsTab
            game={game}
            locale={locale}
            calendarDescription={calendarDescription}
          />
        ) : (
          <ParticipantsTab game={game} />
        )}

        {extra ? <div className="mt-6 px-4">{extra}</div> : null}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[80px] z-40">
        <div className="pointer-events-auto mx-auto w-full px-4 md:w-[90%] md:max-w-7xl">
          <div className="rounded-t-2xl bg-white/90 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-sm dark:bg-card/90">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
