"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GamesMap } from "@/components/map/games-map";
import type { GameMapPoint } from "@/lib/map-games";

export function GamesMapView({ games }: { games: GameMapPoint[] }) {
  const t = useTranslations("mapPage");

  return (
    <div className="relative h-[calc(100dvh-4.25rem-env(safe-area-inset-bottom))] w-full md:h-full">
      <GamesMap games={games} />

      <Link
        href="/games"
        className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-full border border-line-subtle bg-card/95 px-5 py-2.5 text-sm font-semibold text-foreground shadow-lg backdrop-blur-sm transition-opacity hover:opacity-90"
      >
        {t("backToList")}
      </Link>

      {games.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-6 z-[1000] rounded-xl border border-line-subtle bg-card/95 px-4 py-3 text-center text-sm text-muted shadow-lg backdrop-blur-sm">
          {t("empty")}
        </div>
      ) : null}
    </div>
  );
}
