import L from "leaflet";

let iconsFixed = false;

/** Fix default marker icons broken by bundlers (Next.js / webpack). */
export function fixLeafletIcons() {
  if (iconsFixed || typeof window === "undefined") return;
  iconsFixed = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}
