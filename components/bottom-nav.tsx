"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

type TabKey = "home" | "map" | "venues" | "host" | "chats" | "profile";

const tabs: {
  key: TabKey;
  href: "/games" | "/map" | "/venues" | "/games/new" | "/chat" | "/profile";
  labelKey: "home" | "map" | "venues" | "hostTab" | "chats" | "profile";
  match: (pathname: string) => boolean;
  icon: (active: boolean) => ReactNode;
}[] = [
  {
    key: "home",
    href: "/games",
    labelKey: "home",
    match: (pathname) =>
      pathname === "/games" ||
      (pathname.startsWith("/games/") && !pathname.startsWith("/games/new")),
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinejoin="round"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
      </svg>
    ),
  },
  {
    key: "map",
    href: "/map",
    labelKey: "map",
    match: (pathname) => pathname === "/map" || pathname.startsWith("/map/"),
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5 9 4.5Z"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinejoin="round"
        />
        <path
          d="M9 4.5v13M15 6.5v13"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "venues",
    href: "/venues",
    labelKey: "venues",
    match: (pathname) =>
      pathname === "/venues" || pathname.startsWith("/venues/"),
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
  },
  {
    key: "host",
    href: "/games/new",
    labelKey: "hostTab",
    match: (pathname) => pathname === "/games/new" || pathname.startsWith("/host"),
    icon: () => (
      <span className="flex h-11 w-11 -mt-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
          <path
            d="M12 6v12M6 12h12"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </svg>
      </span>
    ),
  },
  {
    key: "chats",
    href: "/chat",
    labelKey: "chats",
    match: (pathname) => pathname === "/chat" || pathname.startsWith("/chat/"),
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4 3.5V6.5Z"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinejoin="round"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
  },
  {
    key: "profile",
    href: "/profile",
    labelKey: "profile",
    match: (pathname) =>
      pathname === "/profile" ||
      pathname.startsWith("/profile/") ||
      pathname === "/friends" ||
      pathname.startsWith("/friends/"),
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <circle
          cx="12"
          cy="9"
          r="3.25"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
        <path
          d="M5.5 19.5c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="z-40 w-full shrink-0 border-t border-border bg-card/80 pb-safe backdrop-blur-md"
    >
      <ul className="grid h-[4.25rem] grid-cols-6 items-end px-0.5">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const isHost = tab.key === "host";
          return (
            <li key={tab.key} className="flex justify-center">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-[2.75rem] flex-col items-center gap-0.5 px-0.5 pb-2 pt-1 text-[9px] font-semibold tracking-wide transition-colors ${
                  isHost
                    ? "text-primary"
                    : active
                      ? "text-primary"
                      : "text-muted hover:text-foreground"
                }`}
              >
                {tab.icon(active)}
                <span className={isHost ? "mt-0.5" : ""}>{t(tab.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
