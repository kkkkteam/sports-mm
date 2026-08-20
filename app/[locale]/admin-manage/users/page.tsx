import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin｜用戶管理",
};

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">用戶管理</h1>
      <p className="mt-2 text-sm text-slate-500">
        用戶列表與管理員標記將在下一步接上。
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-400">
        Users management placeholder
      </div>
    </div>
  );
}
