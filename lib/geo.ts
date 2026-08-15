export type LatLng = {
  lat: number;
  lng: number;
};

/** Approximate centroids for HK districts (WGS84) — fallback when game.lat/lng is null. */
export const HK_DISTRICT_CENTROIDS: Record<string, LatLng> = {
  central_western: { lat: 22.2866, lng: 114.1551 },
  wan_chai: { lat: 22.2783, lng: 114.1747 },
  eastern: { lat: 22.2841, lng: 114.2242 },
  southern: { lat: 22.247, lng: 114.16 },
  yau_tsim_mong: { lat: 22.3119, lng: 114.1702 },
  sham_shui_po: { lat: 22.3302, lng: 114.1622 },
  kowloon_city: { lat: 22.3282, lng: 114.1916 },
  wong_tai_sin: { lat: 22.342, lng: 114.197 },
  kwun_tong: { lat: 22.312, lng: 114.226 },
  kwai_tsing: { lat: 22.357, lng: 114.128 },
  tsuen_wan: { lat: 22.3714, lng: 114.114 },
  tuen_mun: { lat: 22.391, lng: 113.977 },
  yuen_long: { lat: 22.4445, lng: 114.022 },
  north: { lat: 22.494, lng: 114.138 },
  tai_po: { lat: 22.4508, lng: 114.164 },
  sha_tin: { lat: 22.387, lng: 114.195 },
  sai_kung: { lat: 22.382, lng: 114.274 },
  islands: { lat: 22.287, lng: 113.943 },
};

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometres (Haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km)) return "—";
  if (km < 0.1) return "<0.1";
  if (km < 10) return km.toFixed(1);
  return String(Math.round(km));
}

export function resolveGameLocation(game: {
  lat?: number | null;
  lng?: number | null;
  district?: string | null;
}): LatLng | null {
  if (
    typeof game.lat === "number" &&
    typeof game.lng === "number" &&
    Number.isFinite(game.lat) &&
    Number.isFinite(game.lng)
  ) {
    return { lat: game.lat, lng: game.lng };
  }
  if (game.district && HK_DISTRICT_CENTROIDS[game.district]) {
    return HK_DISTRICT_CENTROIDS[game.district];
  }
  return null;
}
