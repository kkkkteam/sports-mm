"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

const links = [
  { href: "/games", labelKey: "findGames", key: "games" },
  { href: "/games/new", labelKey: "hostGame", key: "new" },
  { href: "/host", labelKey: "approvals", key: "host" },
  { href: "/friends", labelKey: "friends", key: "friends" },
  { href: "/chat", labelKey: "chat", key: "chat" },
  { href: "/profile", labelKey: "profile", key: "profile" },
] as const;

export function AppNav({
  nickname,
  active,
}: {
  nickname?: string | null;
  active?: "games" | "new" | "host" | "friends" | "chat" | "profile" | "home";
}) {
  const t = useTranslations("nav");

  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-12">
        <Link href="/" className="font-display text-xl tracking-wide text-court md:text-2xl">
          SPORTS MAP & MATCH
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium md:gap-x-5">
          {links.map((link) => {
            const isActive = active === link.key;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive ? "text-court" : "text-ink/65 transition-colors hover:text-ink"
                }
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
          <LanguageSwitcher />
          {nickname ? (
            <span className="hidden text-ink/40 lg:inline">{nickname}</span>
          ) : null}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-ink/55 transition-colors hover:text-court"
            >
              {t("logout")}
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
