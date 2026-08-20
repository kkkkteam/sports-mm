import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin｜留言審核",
};

export default function AdminMessagesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">留言審核</h1>
      <p className="mt-2 text-sm text-slate-500">
        訊息審核列表將在下一步接上。
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-400">
        Messages moderation placeholder
      </div>
    </div>
  );
}
