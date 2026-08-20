import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Admin｜Dashboard",
};

export const dynamic = "force-dynamic";

type StatCard = {
  label: string;
  value: string;
  hint?: string;
  href?: string;
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return await redirect(admin.reason === "unauthenticated" ? "/login?next=/admin-manage" : "/");
  }

  const { supabase } = admin;
  const startOfTodayHk = (() => {
    // Asia/Hong_Kong day boundary as ISO for timestamptz compare
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Hong_Kong",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    return `${y}-${m}-${d}T00:00:00+08:00`;
  })();

  const [
    usersResult,
    activeGamesResult,
    completedGamesResult,
    todayMessagesResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("games")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "full"]),
    supabase
      .from("games")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfTodayHk)
      .is("deleted_at", null),
  ]);

  const queryErrors = [
    usersResult.error?.message,
    activeGamesResult.error?.message,
    completedGamesResult.error?.message,
    todayMessagesResult.error?.message,
  ].filter(Boolean);

  const stats: StatCard[] = [
    {
      label: "總註冊用戶",
      value: usersResult.error ? "—" : String(usersResult.count ?? 0),
      hint: "profiles",
      href: "/admin-manage/users",
    },
    {
      label: "進行中活動",
      value: activeGamesResult.error ? "—" : String(activeGamesResult.count ?? 0),
      hint: "open + full",
      href: "/admin-manage/games",
    },
    {
      label: "已完成活動",
      value: completedGamesResult.error ? "—" : String(completedGamesResult.count ?? 0),
      hint: "completed",
    },
    {
      label: "今日新增留言",
      value: todayMessagesResult.error ? "—" : String(todayMessagesResult.count ?? 0),
      hint: "messages · HK 今日",
      href: "/admin-manage/messages",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">儀表板</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        平台即時概況。數據來自 Supabase 即時查詢。
      </p>

      {queryErrors.length > 0 ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">部分統計載入失敗</p>
          <ul className="mt-1 list-disc pl-5">
            {queryErrors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-red-600">
            若留言統計失敗，請先執行 migration{" "}
            <code className="rounded bg-red-100 px-1">20260821000001_admin_select.sql</code>
            （管理員讀取 messages 權限）。
          </p>
        </div>
      ) : null}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const inner = (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                {stat.value}
              </p>
              {stat.hint ? (
                <p className="mt-2 text-xs text-slate-400">{stat.hint}</p>
              ) : null}
            </>
          );

          return (
            <li key={stat.label}>
              {stat.href ? (
                <Link
                  href={stat.href}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  {inner}
                </Link>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
