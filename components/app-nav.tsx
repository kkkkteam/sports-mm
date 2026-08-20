"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

/** Compact top chrome — primary navigation lives in BottomNav. */
export function AppNav({
  nickname,
  title,
}: {
  nickname?: string | null;
  active?: "games" | "new" | "host" | "friends" | "chat" | "profile" | "home";
  title?: string;
}) {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-30 border-b border-line-subtle bg-surface/80 px-5 py-3 backdrop-blur-md pt-safe">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/games"
            className="block truncate text-sm font-bold tracking-tight text-ink"
          >
            {title ?? "Sports Map & Match"}
          </Link>
          {nickname ? (
            <p className="truncate text-xs text-muted">{nickname}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeSwitcher compact />
          <LanguageSwitcher variant="light" />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:opacity-80"
            >
              {t("logout")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
