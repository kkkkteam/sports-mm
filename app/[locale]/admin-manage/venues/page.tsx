import type { Metadata } from "next";
import { AdminVenuesManager } from "@/components/admin/admin-venues-manager";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "@/lib/redirect";
import type { PrivateVenue } from "@/types/database";

export const metadata: Metadata = {
  title: "Admin｜私人場地管理",
};

export const dynamic = "force-dynamic";

export default async function AdminPrivateVenuesPage() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return await redirect(
      admin.reason === "unauthenticated"
        ? "/login?next=/admin-manage/venues"
        : "/",
    );
  }

  const { data, error } = await admin.supabase
    .from("private_venues")
    .select("*")
    .order("created_at", { ascending: false });

  const venues = (data ?? []) as PrivateVenue[];

  return (
    <div>
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          載入場地失敗：{error.message}
          {error.message.includes("private_venues") ? (
            <p className="mt-1 text-xs">
              請先在 Supabase 執行 migration{" "}
              <code className="rounded bg-red-100 px-1">
                20260903000001_private_venues.sql
              </code>
              。
            </p>
          ) : null}
        </div>
      ) : null}
      <AdminVenuesManager venues={venues} />
    </div>
  );
}
