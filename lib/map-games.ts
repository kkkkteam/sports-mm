import { resolveGameLocation } from "@/lib/geo";

export type GameMapPoint = {
  id: string;
  title: string;
  venueLabel: string;
  startsAt: string;
  endsAt: string;
  lat: number;
  lng: number;
  sportNameZh: string;
  sportNameEn: string;
};

export function toGameMapPoints(
  games: Array<{
    id: string;
    title: string;
    venue_label: string;
    starts_at: string;
    ends_at: string;
    lat: number | null;
    lng: number | null;
    district: string | null;
    sports:
      | { name_zh: string; name_en: string }
      | { name_zh: string; name_en: string }[]
      | null;
  }>,
): GameMapPoint[] {
  return games.flatMap((game) => {
    const location = resolveGameLocation(game);
    if (!location) return [];

    const sport = Array.isArray(game.sports) ? game.sports[0] : game.sports;

    return [
      {
        id: game.id,
        title: game.title,
        venueLabel: game.venue_label,
        startsAt: game.starts_at,
        endsAt: game.ends_at,
        lat: location.lat,
        lng: location.lng,
        sportNameZh: sport?.name_zh ?? "運動",
        sportNameEn: sport?.name_en ?? "Sport",
      },
    ];
  });
}
