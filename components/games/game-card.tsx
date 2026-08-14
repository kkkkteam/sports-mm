"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  formatHkDate,
  formatHkTime,
  formatHkd,
  gameCostPerPerson,
} from "@/lib/format";
import {
  HK_DISTRICT_LABELS,
  type GameStatus,
  type HkDistrict,
} from "@/types/database";
import type { GameListRow } from "@/components/games/game-list-item";

const SPORT_MARK: Record<string, string> = {
  basketball: "B",
  dodgebee: "D",
  pickleball: "P",
  football: "F",
  badminton: "BD",
  volleyball: "V",
  tennis: "T",
  table_tennis: "TT",
};

function SportMark({ slug, name }: { slug?: string; name: string }) {
  const mark = (slug && SPORT_MARK[slug]) || name.slice(0, 1);
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-court text-sm font-black text-paper">
      {mark}
    </span>
  );
}

export function GameCard({ game }: { game: GameListRow }) {
  const t = useTranslations("games");
  const fee = gameCostPerPerson(game);
  const district = game.district as HkDistrict;
  const status = game.status as GameStatus;
  const spots = game.spots_needed;
  const sportName = game.sports?.name_zh ?? "—";
  const hostName = game.profiles?.nickname ?? "—";
  const hostInitial = hostName.slice(0, 1);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-ink/10 bg-paper p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <SportMark slug={game.sports?.slug} name={sportName} />
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-tight">{sportName}</p>
            <p className="text-xs text-ink/45">{HK_DISTRICT_LABELS[district]}</p>
          </div>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 text-xs font-bold ${
            status === "full" || spots <= 0
              ? "bg-ink/10 text-ink/60"
              : "bg-line text-ink"
          }`}
        >
          {status === "full" || spots <= 0
            ? t("full")
            : t("spotsLeft", { count: spots })}
        </span>
      </div>

      <div className="mt-5 flex-1 space-y-2">
        <h2 className="text-xl font-black leading-snug tracking-tight">
          {game.venue_label}
        </h2>
        <p className="text-sm font-bold text-ink/80">
          {formatHkDate(game.starts_at)} · {formatHkTime(game.starts_at)}–
          {formatHkTime(game.ends_at)}
        </p>
        <p className="text-sm text-ink/55">
          {t("fee")}{" "}
          <span className="font-black text-court">
            {t("perPerson", { amount: formatHkd(fee) })}
          </span>
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-ink text-sm font-black text-line">
            {hostInitial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{hostName}</p>
            <p className="text-xs text-ink/45">{t("host")}</p>
          </div>
        </div>
        <Link
          href={`/games/${game.id}`}
          className="inline-flex min-h-10 shrink-0 items-center bg-ink px-4 text-sm font-bold text-paper transition-colors hover:bg-court"
        >
          {t("join")}
        </Link>
      </div>
    </article>
  );
}

export function GameGrid({ games }: { games: GameListRow[] }) {
  const t = useTranslations("games");

  if (games.length === 0) {
    return <p className="py-16 text-ink/60">{t("empty")}</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {games.map((game) => (
        <li key={game.id}>
          <GameCard game={game} />
        </li>
      ))}
    </ul>
  );
}
