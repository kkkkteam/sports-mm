import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { requireVenueOwner } from "@/lib/venue-owner";
import { redirect } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "館主後台｜儀表板",
};

export const dynamic = "force-dynamic";

type StatCard = {
  label: string;
  value: string;
  hint?: string;
  href?: string;
};

export default async function VenueAdminDashboardPage() {
  const gate = await requireVenueOwner();
  if (!gate.ok) {
    return await redirect(
      gate.reason === "unauthenticated" ? "/login?next=/venue-admin" : "/",
    );
  }

  const { supabase, user } = gate;

  const { data: venues } = await supabase
    .from("private_venues")
    .select("id")
    .eq("owner_id", user.id);

  const venueIds = (venues ?? []).map((venue) => venue.id);

  const todayHk = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const [
    pendingResult,
    todayResult,
    confirmedResult,
    unpaidResult,
  ] = await Promise.all([
    venueIds.length > 0
      ? supabase
          .from("venue_bookings")
          .select("id", { count: "exact", head: true })
          .in("venue_id", venueIds)
          .eq("status", "pending")
      : Promise.resolve({ count: 0, error: null }),
    venueIds.length > 0
      ? supabase
          .from("venue_bookings")
          .select("id", { count: "exact", head: true })
          .in("venue_id", venueIds)
          .eq("booking_date", todayHk)
      : Promise.resolve({ count: 0, error: null }),
    venueIds.length > 0
      ? supabase
          .from("venue_bookings")
          .select("id", { count: "exact", head: true })
          .in("venue_id", venueIds)
          .eq("status", "confirmed")
      : Promise.resolve({ count: 0, error: null }),
    venueIds.length > 0
      ? supabase
          .from("venue_bookings")
          .select("id", { count: "exact", head: true })
          .in("venue_id", venueIds)
          .eq("payment_status", "unpaid")
          .eq("status", "confirmed")
      : Promise.resolve({ count: 0, error: null }),
  ]);

  const stats: StatCard[] = [
    {
      label: "待審核預訂",
      value: String(pendingResult.count ?? 0),
      hint: "pending",
      href: "/venue-admin/bookings",
    },
    {
      label: "今日預訂",
      value: String(todayResult.count ?? 0),
      hint: "booking_date · HK 今日",
      href: "/venue-admin/bookings",
    },
    {
      label: "已確認預訂",
      value: String(confirmedResult.count ?? 0),
      hint: "confirmed",
    },
    {
      label: "待收款（已確認）",
      value: String(unpaidResult.count ?? 0),
      hint: "unpaid · confirmed",
    },
    {
      label: "名下場地",
      value: String(venueIds.length),
      hint: "private_venues",
      href: "/venue-admin/venue",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">儀表板</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        歡迎回來，{gate.profile.nickname}。以下是您名下場地的預訂概況。
      </p>

      {venueIds.length === 0 ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          您的帳號尚未指派任何場地。請聯絡平台管理員完成場地指派後，即可在此管理預訂。
        </div>
      ) : null}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
