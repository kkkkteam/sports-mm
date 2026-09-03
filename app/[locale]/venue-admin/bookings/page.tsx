import type { Metadata } from "next";
import {
  VenueBookingsManager,
  type VenueOwnerBookingRow,
} from "@/components/venue-admin/venue-bookings-manager";
import { requireVenueOwner } from "@/lib/venue-owner";
import { redirect } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "館主後台｜預訂管理",
};

export const dynamic = "force-dynamic";

export default async function VenueAdminBookingsPage() {
  const gate = await requireVenueOwner();
  if (!gate.ok) {
    return await redirect(
      gate.reason === "unauthenticated" ? "/login?next=/venue-admin/bookings" : "/",
    );
  }

  const { supabase, user } = gate;

  const { data: venues, error: venuesError } = await supabase
    .from("private_venues")
    .select("id")
    .eq("owner_id", user.id);

  const venueIds = (venues ?? []).map((venue) => venue.id);
  const hasVenues = venueIds.length > 0;

  let bookings: VenueOwnerBookingRow[] = [];
  let bookingsError = venuesError;

  if (hasVenues && !venuesError) {
    const result = await supabase
      .from("venue_bookings")
      .select(
        `
        id,
        venue_id,
        booking_date,
        start_time,
        end_time,
        status,
        payment_status,
        contact_phone,
        total_price,
        profiles!user_id(nickname),
        private_venues!venue_id(name)
      `,
      )
      .in("venue_id", venueIds)
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false });

    bookings = (result.data ?? []) as unknown as VenueOwnerBookingRow[];
    bookingsError = result.error;
  }

  const error = bookingsError;

  return (
    <div>
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          載入預訂失敗：{error.message}
          {error.message.includes("venue_bookings") ||
          error.message.includes("policy") ? (
            <p className="mt-1 text-xs">
              請先在 Supabase 執行 migration{" "}
              <code className="rounded bg-red-100 px-1">
                20260903000005_venue_owner_portal_rls.sql
              </code>
              。
            </p>
          ) : null}
        </div>
      ) : null}
      <VenueBookingsManager bookings={bookings} hasVenues={hasVenues} />
    </div>
  );
}
