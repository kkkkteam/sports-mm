"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

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
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 px-5 py-3 backdrop-blur-md pt-safe">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href="/games" className="block truncate text-sm font-bold tracking-tight text-slate-900">
            {title ?? "Sports Map & Match"}
          </Link>
          {nickname ? (
            <p className="truncate text-xs text-slate-500">{nickname}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher variant="light" />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              {t("logout")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
