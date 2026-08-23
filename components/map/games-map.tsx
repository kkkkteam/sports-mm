"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { fixLeafletIcons } from "@/components/map/fix-leaflet-icons";
import { formatDateChip, formatTimeRange } from "@/lib/format";
import type { GameMapPoint } from "@/lib/map-games";
import "leaflet/dist/leaflet.css";

const HK_CENTER: [number, number] = [22.3193, 114.1694];
const DEFAULT_ZOOM = 12;

function GameMapPopup({ game }: { game: GameMapPoint }) {
  const t = useTranslations("mapPage");
  const locale = useLocale();
  const sportName = locale === "en" ? game.sportNameEn : game.sportNameZh;

  return (
    <div className="min-w-[11rem] max-w-[14rem] space-y-2 p-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
        {sportName}
      </p>
      <p className="text-sm font-bold leading-snug text-foreground">{game.title}</p>
      <p className="text-xs text-muted">{game.venueLabel}</p>
      <p className="text-xs text-muted">
        {formatDateChip(game.startsAt, locale)} ·{" "}
        {formatTimeRange(game.startsAt, game.endsAt, locale)}
      </p>
      <Link
        href={`/games/${game.id}`}
        className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {t("viewDetails")}
      </Link>
    </div>
  );
}

export function GamesMap({ games }: { games: GameMapPoint[] }) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer
      center={HK_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {games.map((game) => (
        <Marker key={game.id} position={[game.lat, game.lng]}>
          <Popup closeButton minWidth={180} maxWidth={240}>
            <GameMapPopup game={game} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
