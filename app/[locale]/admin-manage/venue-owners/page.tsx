import type { Metadata } from "next";
import { AdminVenueOwnersManager } from "@/components/admin/admin-venue-owners-manager";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "@/lib/redirect";
import type { PrivateVenue, Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "Admin｜館主權限與場地指派",
};

export const dynamic = "force-dynamic";

type AdminProfileRow = Pick<
  Profile,
  "id" | "nickname" | "is_venue_owner" | "district" | "created_at"
>;

type AdminVenueRow = Pick<
  PrivateVenue,
  "id" | "name" | "district" | "status" | "owner_id"
>;

export default async function AdminVenueOwnersPage() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return await redirect(
      admin.reason === "unauthenticated"
        ? "/login?next=/admin-manage/venue-owners"
        : "/",
    );
  }

  const [profilesResult, venuesResult] = await Promise.all([
    admin.supabase
      .from("profiles")
      .select("id, nickname, is_venue_owner, district, created_at")
      .order("nickname", { ascending: true }),
    admin.supabase
      .from("private_venues")
      .select("id, name, district, status, owner_id")
      .order("name", { ascending: true }),
  ]);

  const profiles = (profilesResult.data ?? []) as AdminProfileRow[];
  const venues = (venuesResult.data ?? []) as AdminVenueRow[];
  const error = profilesResult.error ?? venuesResult.error;

  return (
    <div>
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          載入資料失敗：{error.message}
          {error.message.includes("is_venue_owner") ? (
            <p className="mt-1 text-xs">
              請先在 Supabase 執行 migration{" "}
              <code className="rounded bg-red-100 px-1">
                20260903000003_venue_owner_bookings.sql
              </code>
              。
            </p>
          ) : null}
          {error.message.includes("permission") ||
          error.message.includes("policy") ? (
            <p className="mt-1 text-xs">
              若 profiles 更新失敗，請執行{" "}
              <code className="rounded bg-red-100 px-1">
                20260903000004_profiles_admin_update.sql
              </code>
              。
            </p>
          ) : null}
        </div>
      ) : null}
      <AdminVenueOwnersManager profiles={profiles} venues={venues} />
    </div>
  );
}
