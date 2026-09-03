"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatHkd } from "@/lib/format";
import {
  VENUE_BOOKING_PAYMENT_STATUS_LABELS,
  VENUE_BOOKING_STATUS_LABELS,
  type VenueBookingPaymentStatus,
  type VenueBookingStatus,
} from "@/types/database";

export type VenueOwnerBookingRow = {
  id: string;
  venue_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: VenueBookingStatus;
  payment_status: VenueBookingPaymentStatus;
  contact_phone: string | null;
  total_price: number;
  profiles: { nickname: string } | null;
  private_venues: { name: string } | null;
};

function formatBookingDate(date: string) {
  try {
    return new Intl.DateTimeFormat("zh-HK", {
      dateStyle: "medium",
      timeZone: "Asia/Hong_Kong",
    }).format(new Date(`${date}T00:00:00+08:00`));
  } catch {
    return date;
  }
}

function formatTimeSlot(start: string, end: string) {
  const trim = (value: string) => value.slice(0, 5);
  return `${trim(start)} – ${trim(end)}`;
}

function statusBadgeClass(status: VenueBookingStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-800 ring-amber-200/80";
    case "confirmed":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
    case "rejected":
      return "bg-red-50 text-red-700 ring-red-200/80";
    case "cancelled":
      return "bg-slate-100 text-slate-600 ring-slate-200/80";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200/80";
  }
}

function paymentBadgeClass(status: VenueBookingPaymentStatus) {
  return status === "paid"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-100 text-slate-600";
}

function BookingActionButtons({
  bookingId,
  onUpdated,
}: {
  bookingId: string;
  onUpdated: (id: string, status: VenueBookingStatus) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(next: "confirmed" | "rejected") {
    const label = next === "confirmed" ? "接受" : "拒絕";
    const ok = window.confirm(`確定要${label}此預訂？`);
    if (!ok) return;

    setError(null);
    setLoading(next === "confirmed" ? "confirm" : "reject");

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("venue_bookings")
        .update({ status: next })
        .eq("id", bookingId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      onUpdated(bookingId, next);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "更新失敗");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateStatus("confirmed")}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-55"
        >
          {loading === "confirm" ? "處理中…" : "接受"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateStatus("rejected")}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-55"
        >
          {loading === "reject" ? "處理中…" : "拒絕"}
        </button>
      </div>
      {error ? (
        <p className="max-w-[14rem] text-right text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export function VenueBookingsManager({
  bookings: initialBookings,
  hasVenues,
}: {
  bookings: VenueOwnerBookingRow[];
  hasVenues: boolean;
}) {
  const [bookings, setBookings] = useState(initialBookings);

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  function onStatusUpdated(id: string, status: VenueBookingStatus) {
    setBookings((current) =>
      current.map((row) => (row.id === id ? { ...row, status } : row)),
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          預訂管理
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          審核並管理您名下場地的預訂申請。
        </p>
      </div>

      {!hasVenues ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-700">尚未指派場地</p>
          <p className="mt-2 text-sm text-slate-500">
            請聯絡平台管理員，在後台為您的帳號指派私人場地後，即可在此查看預訂。
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">場地</th>
                  <th className="px-4 py-3">預訂者</th>
                  <th className="px-4 py-3">聯絡電話</th>
                  <th className="px-4 py-3">日期</th>
                  <th className="px-4 py-3">時段</th>
                  <th className="px-4 py-3">狀態</th>
                  <th className="px-4 py-3">付款</th>
                  <th className="px-4 py-3">金額</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-14 text-center text-slate-400"
                    >
                      目前沒有預訂紀錄。
                    </td>
                  </tr>
                ) : null}
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {booking.private_venues?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {booking.profiles?.nickname ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {booking.contact_phone ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatBookingDate(booking.booking_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatTimeSlot(booking.start_time, booking.end_time)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusBadgeClass(booking.status)}`}
                      >
                        {VENUE_BOOKING_STATUS_LABELS[booking.status] ??
                          booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentBadgeClass(booking.payment_status)}`}
                      >
                        {VENUE_BOOKING_PAYMENT_STATUS_LABELS[
                          booking.payment_status
                        ] ?? booking.payment_status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatHkd(Number(booking.total_price))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {booking.status === "pending" ? (
                        <BookingActionButtons
                          bookingId={booking.id}
                          onUpdated={onStatusUpdated}
                        />
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
