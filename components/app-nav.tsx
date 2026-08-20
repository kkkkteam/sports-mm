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
    <header className="sticky top-0 z-30 border-b border-line-subtle bg-surface/90 px-6 py-4 backdrop-blur-md pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 pr-2">
          <Link
            href="/games"
            className="block truncate text-[15px] font-bold tracking-tight text-ink"
          >
            {title ?? "Sports Map & Match"}
          </Link>
          {nickname ? (
            <p className="mt-0.5 truncate text-xs text-muted">{nickname}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5">
          <ThemeSwitcher compact />
          <LanguageSwitcher variant="light" />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink transition-colors hover:opacity-80"
            >
              {t("logout")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
