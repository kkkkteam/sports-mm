/** Extract a display label from a Google Place result. */
export function extractVenueFromPlace(
  place: google.maps.places.PlaceResult,
): string {
  const name = place.name?.trim();
  if (name) return name.slice(0, 80);

  const address = place.formatted_address ?? "";
  const firstSegment = address.split(",")[0]?.trim();
  return (firstSegment || address).slice(0, 80);
}

/** Read lat/lng from a Google Place result. */
export function extractCoordsFromPlace(
  place: google.maps.places.PlaceResult,
): { lat: number; lng: number } | null {
  const lat = place.geometry?.location?.lat();
  const lng = place.geometry?.location?.lng();

  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
