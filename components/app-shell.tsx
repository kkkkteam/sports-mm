"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { BottomNav } from "@/components/bottom-nav";

const HIDE_TABBAR_PREFIXES = ["/login", "/register"];

function shouldHideTabBar(pathname: string) {
  return HIDE_TABBAR_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Admin panel uses its own desktop layout — skip consumer App Shell.
  if (pathname === "/admin-manage" || pathname.startsWith("/admin-manage/")) {
    return <>{children}</>;
  }

  const hideTabBar = shouldHideTabBar(pathname);

  return (
    <div className="min-h-dvh bg-slate-100 md:px-4 md:py-6">
      <div
        className={[
          "relative mx-auto flex min-h-dvh w-full flex-col overflow-hidden bg-canvas text-ink",
          "md:min-h-[calc(100dvh-3rem)] md:w-[90%] md:max-w-7xl md:rounded-2xl md:shadow-xl",
        ].join(" ")}
      >
        <div
          className={[
            "no-scrollbar flex-1 overflow-y-auto overscroll-y-contain pt-safe",
            hideTabBar ? "pb-safe" : "pb-tabbar",
          ].join(" ")}
        >
          {children}
        </div>
        {hideTabBar ? null : <BottomNav />}
      </div>
    </div>
  );
}
