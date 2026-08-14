import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh-HK", "zh-CN", "en"],
  defaultLocale: "zh-HK",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  "zh-HK": "繁體中文",
  "zh-CN": "简体中文",
  en: "English",
};
