import type { AppLocale } from "@/i18n/routing";
import en from "@/messages/en.json";
import zhCN from "@/messages/zh-CN.json";
import zhHK from "@/messages/zh-HK.json";

export const localeMessages = {
  "zh-HK": zhHK,
  "zh-CN": zhCN,
  en,
} as const satisfies Record<AppLocale, typeof zhHK>;

export function getLocaleMessages(locale: AppLocale) {
  return localeMessages[locale];
}
