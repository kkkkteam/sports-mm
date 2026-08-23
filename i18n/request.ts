import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { getLocaleMessages } from "@/i18n/messages";
import { routing, type AppLocale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: AppLocale = hasLocale(routing.locales, requested)
    ? (requested as AppLocale)
    : routing.defaultLocale;

  return {
    locale,
    messages: getLocaleMessages(locale),
  };
});
