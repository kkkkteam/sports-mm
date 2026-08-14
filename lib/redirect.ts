import { getLocale } from "next-intl/server";
import { redirect as intlRedirect } from "@/i18n/navigation";

/** Locale-aware redirect for Server Components (next-intl v4). */
export async function redirect(href: string): Promise<never> {
  const locale = await getLocale();
  intlRedirect({ href, locale });
  throw new Error("Unreachable: redirect");
}
