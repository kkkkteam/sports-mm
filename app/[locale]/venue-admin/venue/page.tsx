import type { Metadata } from "next";
import { requireVenueOwner } from "@/lib/venue-owner";
import { redirect } from "@/lib/redirect";
import { HK_DISTRICT_LABELS, type PrivateVenue } from "@/types/database";

export const metadata: Metadata = {
  title: "館主後台｜場地資訊",
};

export const dynamic = "force-dynamic";

export default async function VenueAdminMyVenuePage() {
  const gate = await requireVenueOwner();
  if (!gate.ok) {
    return await redirect(
      gate.reason === "unauthenticated" ? "/login?next=/venue-admin/venue" : "/",
    );
  }

  const { supabase, user } = gate;

  const { data, error } = await supabase
    .from("private_venues")
    .select("*")
    .eq("owner_id", user.id)
    .order("name", { ascending: true });

  const venues = (data ?? []) as PrivateVenue[];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">場地資訊</h1>
      <p className="mt-2 text-sm text-slate-500">
        您目前管理的私人場地列表。如需修改場地資料，請聯絡平台管理員。
      </p>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          載入場地失敗：{error.message}
        </div>
      ) : null}

      {venues.length === 0 && !error ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-700">尚未指派場地</p>
          <p className="mt-2 text-sm text-slate-500">
            平台管理員可在總後台「館主指派」為您綁定場地。
          </p>
        </div>
      ) : null}

      <ul className="mt-8 grid gap-4 lg:grid-cols-2">
        {venues.map((venue) => (
          <li
            key={venue.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{venue.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {HK_DISTRICT_LABELS[venue.district]} · {venue.address}
                </p>
              </div>
              <span
                className={[
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                  venue.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {venue.status === "active" ? "上架中" : "已下架"}
              </span>
            </div>

            {venue.description ? (
              <p className="mt-4 line-clamp-3 text-sm text-slate-600">
                {venue.description}
              </p>
            ) : null}

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  運動種類
                </dt>
                <dd className="mt-1 text-slate-700">
                  {venue.sport_types.length > 0
                    ? venue.sport_types.join("、")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  設施
                </dt>
                <dd className="mt-1 text-slate-700">
                  {venue.facilities.length > 0
                    ? venue.facilities.join("、")
                    : "—"}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
