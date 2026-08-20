import type { Metadata } from "next";
import { AdminCancelGameButton } from "@/components/admin/admin-cancel-game-button";
import { requireAdmin } from "@/lib/admin";
import { formatHkDateTime } from "@/lib/format";
import { redirect } from "@/lib/redirect";
import {
  GAME_STATUS_LABELS,
  type GameStatus,
} from "@/types/database";

export const metadata: Metadata = {
  title: "Admin｜場地管理",
};

export const dynamic = "force-dynamic";

type AdminGameRow = {
  id: string;
  title: string;
  venue_label: string;
  starts_at: string;
  status: GameStatus;
  profiles: { nickname: string } | null;
  sports: { name_zh: string } | null;
};

export default async function AdminGamesPage() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return await redirect(
      admin.reason === "unauthenticated" ? "/login?next=/admin-manage/games" : "/",
    );
  }

  const { data, error } = await admin.supabase
    .from("games")
    .select(
      "id, title, venue_label, starts_at, status, profiles!host_id(nickname), sports(name_zh)",
    )
    .in("status", ["open", "full"])
    .order("starts_at", { ascending: true });

  const games = (data ?? []) as unknown as AdminGameRow[];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">場地管理</h1>
      <p className="mt-2 text-sm text-slate-500">
        列出狀態為開放中／已滿的場次，可強制下架（改為 cancelled）。
      </p>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          載入場次失敗：{error.message}
        </div>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">發佈者</th>
                <th className="px-4 py-3">運動</th>
                <th className="px-4 py-3">場地</th>
                <th className="px-4 py-3">活動時間</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {games.length === 0 && !error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    目前沒有進行中的場次。
                  </td>
                </tr>
              ) : null}
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {game.profiles?.nickname ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {game.sports?.name_zh ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p className="font-medium text-slate-800">{game.venue_label}</p>
                    <p className="text-xs text-slate-400">{game.title}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {formatHkDateTime(game.starts_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        game.status === "full"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {GAME_STATUS_LABELS[game.status] ?? game.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminCancelGameButton gameId={game.id} title={game.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
