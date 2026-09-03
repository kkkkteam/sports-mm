"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";

const links = [
  { href: "/venue-admin", label: "儀表板", exact: true },
  { href: "/venue-admin/bookings", label: "預訂管理" },
  { href: "/venue-admin/venue", label: "場地資訊" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function VenueAdminSidebar({ nickname }: { nickname: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-emerald-900/40 bg-emerald-950 text-emerald-50">
      <div className="border-b border-emerald-900/50 px-5 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/80">
          Venue Owner
        </p>
        <p className="mt-2 text-lg font-bold tracking-tight text-white">
          館主後台
        </p>
        <p className="mt-1 truncate text-xs text-emerald-200/70">{nickname}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {links.map((link) => {
          const active = isActive(
            pathname,
            link.href,
            "exact" in link ? link.exact : false,
          );
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white text-emerald-950"
                  : "text-emerald-100/90 hover:bg-emerald-900/60 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-emerald-900/50 px-3 py-4">
        <Link
          href="/venues"
          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-200/70 transition-colors hover:bg-emerald-900/60 hover:text-white"
        >
          ← 返回場館目錄
        </Link>
        <form action="/auth/signout" method="post" className="mt-1">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-emerald-200/70 transition-colors hover:bg-emerald-900/60 hover:text-white"
          >
            登出
          </button>
        </form>
      </div>
    </aside>
  );
}

export function VenueAdminShell({
  nickname,
  children,
}: {
  nickname: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-slate-100 text-slate-900">
      <VenueAdminSidebar nickname={nickname} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-8">
          <p className="text-sm font-medium text-slate-500">
            館主後台 · 預訂與場地管理
          </p>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
