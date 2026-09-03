export const VENUE_SPORT_ICONS: Record<string, string> = {
  籃球: "🏀",
  羽毛球: "🏸",
  乒乓球: "🏓",
  匹克球: "🎾",
  足球: "⚽",
  網球: "🎾",
  排球: "🏐",
};

export function venueSportIcon(sport: string) {
  return VENUE_SPORT_ICONS[sport] ?? "🏟️";
}
