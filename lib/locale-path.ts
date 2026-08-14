import { routing, type AppLocale } from "@/i18n/routing";

export function withLocalePath(path: string, locale: AppLocale) {
  if (routing.locales.some((item) => path === `/${item}` || path.startsWith(`/${item}/`))) {
    return path;
  }
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}
