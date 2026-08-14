import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withLocalePath } from "@/lib/locale-path";
import { routing, type AppLocale } from "@/i18n/routing";

function resolveLocale(request: Request, nextPath: string): AppLocale {
  const fromPath = routing.locales.find(
    (locale) => nextPath === `/${locale}` || nextPath.startsWith(`/${locale}/`),
  );
  if (fromPath) return fromPath;

  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const fromCookie = match?.[1];
  if (fromCookie && routing.locales.includes(fromCookie as AppLocale)) {
    return fromCookie as AppLocale;
  }

  return routing.defaultLocale;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = searchParams.get("next") ?? "/profile";
  const safeNext = nextPath.startsWith("/") ? nextPath : "/profile";
  const locale = resolveLocale(request, safeNext);
  const next = withLocalePath(safeNext, locale);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";

      if (isLocal) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=oauth`);
}
