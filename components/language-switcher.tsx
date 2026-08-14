"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS, routing, type AppLocale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        aria-label={t("language")}
        onChange={(event) => {
          const next = event.target.value as AppLocale;
          router.replace(pathname, { locale: next });
        }}
        className="min-h-9 border-2 border-ink/15 bg-transparent px-2 text-sm font-medium text-ink/80 outline-none focus:border-court"
      >
        {routing.locales.map((item) => (
          <option key={item} value={item}>
            {LOCALE_LABELS[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
