import { Link } from "@/i18n/navigation";
import {
  formatHkDate,
  formatHkTime,
  formatHkd,
  gameCostPerPerson,
} from "@/lib/format";
import {
  GAME_STATUS_LABELS,
  HK_DISTRICT_LABELS,
  type Game,
  type GameStatus,
  type HkDistrict,
  type Profile,
  type Sport,
} from "@/types/database";

export type GameListRow = Game & {
  sports: Pick<Sport, "name_zh" | "name_en" | "slug"> | null;
  profiles: Pick<Profile, "nickname"> | null;
};

export function GameListItem({ game }: { game: GameListRow }) {
  const status = game.status as GameStatus;
  const district = game.district as HkDistrict;
  const fee = gameCostPerPerson(game);

  return (
    <Link
      href={`/games/${game.id}`}
      className="block border-b border-ink/15 py-6 transition-colors hover:bg-mist/40"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-court">
            {game.sports?.name_zh ?? "運動"} · {HK_DISTRICT_LABELS[district]}
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
            {game.title}
          </h2>
          <p className="mt-2 text-sm text-ink/65 md:text-base">
            {game.venue_label} · {formatHkDate(game.starts_at)}{" "}
            {formatHkTime(game.starts_at)}–{formatHkTime(game.ends_at)}
          </p>
          <p className="mt-1 text-sm text-ink/55">
            房主 {game.profiles?.nickname ?? "—"} · 尚欠 {game.spots_needed} 人 ·{" "}
            {formatHkd(fee)}／人
          </p>
        </div>
        <span className="text-sm font-bold text-ink/70">
          {GAME_STATUS_LABELS[status]}
        </span>
      </div>
    </Link>
  );
}
