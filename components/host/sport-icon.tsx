import type { ReactNode } from "react";

const ICON_CLASS = "h-7 w-7";

const SPORT_ICONS: Record<string, ReactNode> = {
  basketball: (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.5v17M4.5 12h15M7 7c3 2.5 6.5 2.5 10 0M7 17c3-2.5 6.5-2.5 10 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  pickleball: (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="0.9" fill="currentColor" />
      <circle cx="13" cy="9" r="0.9" fill="currentColor" />
      <circle cx="15" cy="13" r="0.9" fill="currentColor" />
      <circle cx="10" cy="14" r="0.9" fill="currentColor" />
    </svg>
  ),
  football: (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 4.5 15 8l-1 4.5H10L9 8l3-3.5ZM8 14l2.5 2 3-2 2.5-2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
  badminton: (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" aria-hidden>
      <path
        d="M6 18 16 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 8c2-2 4-1.5 5 0s1 3-1 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <ellipse cx="6" cy="18" rx="2.2" ry="1.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  volleyball: (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.5v17M4.5 12h15M6.5 7.5 12 12l5.5 4.5M17.5 7.5 12 12 6.5 16.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  ),
  tennis: (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" aria-hidden>
      <circle cx="10" cy="14" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15 5c2 2 2.5 4.5 1.5 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  table_tennis: (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" aria-hidden>
      <circle cx="9" cy="15" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13.5 9.5c2-1 4-1 5.5 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="18.5" cy="8" r="1" fill="currentColor" />
    </svg>
  ),
};

export function SportIcon({ slug }: { slug: string }) {
  return SPORT_ICONS[slug] ?? (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
