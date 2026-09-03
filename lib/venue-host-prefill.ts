import type { HostGameFormData } from "@/lib/host-game-form";
import type { HkDistrict, PrivateVenue, Sport } from "@/types/database";

export type VenueHostPrefill = {
  venueId: string;
  venueName: string;
  district: HkDistrict;
  lat: number | null;
  lng: number | null;
  sportLabel: string | null;
};

const HK_DISTRICTS = new Set<string>([
  "central_western",
  "wan_chai",
  "eastern",
  "southern",
  "yau_tsim_mong",
  "sham_shui_po",
  "kowloon_city",
  "wong_tai_sin",
  "kwun_tong",
  "kwai_tsing",
  "tsuen_wan",
  "tuen_mun",
  "yuen_long",
  "north",
  "tai_po",
  "sha_tin",
  "sai_kung",
  "islands",
]);

function parseCoord(value: string | null) {
  if (!value?.trim()) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function resolveSportId(sports: Sport[], sportLabel: string | null) {
  if (!sportLabel?.trim()) return null;
  const label = sportLabel.trim();
  const match = sports.find(
    (sport) => sport.name_zh === label || sport.name_en === label,
  );
  return match?.id ?? null;
}

export function parseVenueHostPrefill(
  params: Pick<
    URLSearchParams,
    "get" | "has"
  >,
): VenueHostPrefill | null {
  const venueId = params.get("venue_id")?.trim();
  const venueName = params.get("venue_name")?.trim();
  const district = params.get("district")?.trim();

  if (!venueId || !venueName || !district || !HK_DISTRICTS.has(district)) {
    return null;
  }

  return {
    venueId,
    venueName,
    district: district as HkDistrict,
    lat: parseCoord(params.get("lat")),
    lng: parseCoord(params.get("lng")),
    sportLabel: params.get("sport")?.trim() || null,
  };
}

export function applyVenueHostPrefill(
  form: HostGameFormData,
  prefill: VenueHostPrefill,
  sports: Sport[],
): HostGameFormData {
  const sportId = resolveSportId(sports, prefill.sportLabel);
  const sport = sportId ? sports.find((item) => item.id === sportId) : null;

  return {
    ...form,
    sportId: sportId ?? form.sportId,
    maxPlayers: sport ? Math.max(2, sport.min_players) : form.maxPlayers,
    district: prefill.district,
    venueLabel: prefill.venueName,
    lat: prefill.lat,
    lng: prefill.lng,
  };
}

export function buildVenueHostPrefillSearchParams(venue: PrivateVenue) {
  const params = new URLSearchParams();
  params.set("venue_id", venue.id);
  params.set("venue_name", venue.name);
  params.set("district", venue.district);

  if (venue.lat != null) params.set("lat", String(venue.lat));
  if (venue.lng != null) params.set("lng", String(venue.lng));
  if (venue.sport_types[0]) params.set("sport", venue.sport_types[0]);

  return params;
}

export function buildVenueHostPrefillPath(venue: PrivateVenue) {
  return `/games/new?${buildVenueHostPrefillSearchParams(venue).toString()}`;
}
