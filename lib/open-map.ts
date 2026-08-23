export type OpenMapParams = {
  lat?: number | null;
  lng?: number | null;
  venueLabel: string;
  districtLabel?: string;
};

/** Detect iPhone / iPad / iPod (incl. iPadOS desktop UA). */
export function isIosDevice() {
  if (typeof navigator === "undefined") return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function buildPlaceQuery(params: OpenMapParams) {
  const { lat, lng, venueLabel, districtLabel } = params;
  const hasCoords =
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  if (hasCoords) {
    return { hasCoords: true as const, coords: `${lat},${lng}` };
  }

  const place = districtLabel
    ? `${venueLabel}, ${districtLabel}`
    : venueLabel;

  return { hasCoords: false as const, place, encodedPlace: encodeURIComponent(place) };
}

/**
 * Open the system map app / website for a venue.
 * - iOS: Apple Maps (`maps.apple.com`)
 * - Android & desktop: Google Maps universal link
 */
export function openMap(params: OpenMapParams) {
  if (typeof window === "undefined") return;

  const query = buildPlaceQuery(params);

  const url = isIosDevice()
    ? query.hasCoords
      ? `http://maps.apple.com/?q=${query.coords}`
      : `http://maps.apple.com/?q=${query.encodedPlace}`
    : query.hasCoords
      ? `https://www.google.com/maps/search/?api=1&query=${query.coords}`
      : `https://www.google.com/maps/search/?api=1&query=${query.encodedPlace}`;

  window.open(url, "_blank", "noopener,noreferrer");
}
