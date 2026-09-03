import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Admin｜用戶管理",
};

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">用戶管理</h1>
      <p className="mt-2 text-sm text-slate-500">
        用戶列表與管理員標記將在下一步接上。館主權限與場地指派請至專頁操作。
      </p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-slate-600">需要設定館主或指派私人場地？</p>
        <Link
          href="/admin-manage/venue-owners"
          className="mt-4 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          前往館主指派
        </Link>
      </div>
    </div>
  );
}
