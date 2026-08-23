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

function supabaseAuthCookiePrefix(supabaseUrl: string) {
  try {
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    return `sb-${projectRef}-auth-token`;
  } catch {
    return null;
  }
}

function clearSupabaseAuthCookies(
  request: NextRequest,
  response: NextResponse,
  supabaseUrl: string,
) {
  const prefix = supabaseAuthCookiePrefix(supabaseUrl);
  if (!prefix) return;

  for (const cookie of request.cookies.getAll()) {
    if (cookie.name === prefix || cookie.name.startsWith(`${prefix}.`)) {
      response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
    }
  }
}

function shouldClearAuthSession(error: { code?: string; message?: string } | null) {
  if (!error) return false;

  const code = error.code ?? "";
  const message = error.message ?? "";

  return (
    code === "refresh_token_not_found" ||
    code === "session_not_found" ||
    code === "invalid_refresh_token" ||
    /refresh token/i.test(message) ||
    /session.*expired/i.test(message)
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

  let supabaseResponse = response;

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
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  let user = null;

  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (shouldClearAuthSession(error)) {
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch {
          clearSupabaseAuthCookies(request, supabaseResponse, url);
        }
      }
    } else {
      user = authUser;
    }
  } catch {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      clearSupabaseAuthCookies(request, supabaseResponse, url);
    }
  }

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
    path.startsWith("/chat/") ||
    path === "/admin-manage" ||
    path.startsWith("/admin-manage/");

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

  return supabaseResponse;
}
