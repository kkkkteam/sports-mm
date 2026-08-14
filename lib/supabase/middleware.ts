import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { routing } from "@/i18n/routing";

function stripLocale(pathname: string) {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

function detectLocale(pathname: string) {
  return (
    routing.locales.find(
      (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    ) ?? routing.defaultLocale
  );
}

export async function updateSession(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = stripLocale(request.nextUrl.pathname);
  const locale = detectLocale(request.nextUrl.pathname);
  const isAuthPage = path === "/login" || path === "/register";
  const isProtected =
    path === "/profile" ||
    path.startsWith("/profile/") ||
    path === "/games/new" ||
    path === "/host" ||
    path.startsWith("/host/") ||
    path === "/friends" ||
    path.startsWith("/friends/") ||
    path === "/chat" ||
    path.startsWith("/chat/");

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/login`;
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/games`;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
