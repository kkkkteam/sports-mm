"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";

const links = [
  { href: "/admin-manage", label: "儀表板", exact: true },
  { href: "/admin-manage/games", label: "場地管理" },
  { href: "/admin-manage/messages", label: "留言審核" },
  { href: "/admin-manage/users", label: "用戶管理" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ nickname }: { nickname: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-5 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Admin
        </p>
        <p className="mt-2 text-lg font-bold tracking-tight text-white">
          Sports Map & Match
        </p>
        <p className="mt-1 truncate text-xs text-slate-400">{nickname}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {links.map((link) => {
          const active = isActive(pathname, link.href, "exact" in link ? link.exact : false);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white text-slate-900"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-3 py-4">
        <Link
          href="/games"
          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
        >
          ← 返回前台
        </Link>
        <form action="/auth/signout" method="post" className="mt-1">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
          >
            登出
          </button>
        </form>
      </div>
    </aside>
  );
}

export function AdminShell({
  nickname,
  children,
}: {
  nickname: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-slate-100 text-slate-900">
      <AdminSidebar nickname={nickname} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-8">
          <p className="text-sm font-medium text-slate-500">管理後台 · Desktop</p>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
