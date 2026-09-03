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

  if (pathname === "/venue-admin" || pathname.startsWith("/venue-admin/")) {
    return <>{children}</>;
  }

  const hideTabBar = shouldHideTabBar(pathname);
  const isMapPage = pathname === "/map" || pathname.startsWith("/map/");

  return (
    <div className="h-[100dvh] overflow-hidden bg-shell md:px-4 md:py-6">
      <div
        className={[
          "relative mx-auto flex h-full w-full flex-col overflow-hidden bg-canvas text-ink",
          "md:h-[calc(100dvh-3rem)] md:w-[90%] md:max-w-7xl md:rounded-2xl md:shadow-xl",
          "md:ring-1 md:ring-line-subtle",
        ].join(" ")}
      >
        {/* min-h-0 is required so flex-1 can shrink and enable overflow scroll */}
        <main
          className={[
            "no-scrollbar min-h-0 flex-1 overscroll-y-contain",
            isMapPage
              ? "overflow-hidden p-0"
              : "overflow-y-auto pt-safe pb-6 [-webkit-overflow-scrolling:touch]",
            hideTabBar ? "pb-safe" : "",
          ].join(" ")}
        >
          {children}
        </main>
        {hideTabBar ? null : <BottomNav />}
      </div>
    </div>
  );
}
