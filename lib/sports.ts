import type { Sport } from "@/types/database";

/** Sports hidden from UI (legacy rows may still exist until migration runs). */
export const DISABLED_SPORT_SLUGS = new Set(["dodgebee"]);

export function filterActiveSports<T extends Pick<Sport, "slug">>(sports: T[]): T[] {
  return sports.filter((sport) => !DISABLED_SPORT_SLUGS.has(sport.slug));
}
