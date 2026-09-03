"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { HK_DISTRICT_LABELS, type HkDistrict } from "@/types/database";

type AdminProfileRow = {
  id: string;
  nickname: string;
  is_venue_owner: boolean;
  district: HkDistrict | null;
  created_at: string;
};

type AdminVenueRow = {
  id: string;
  name: string;
  district: HkDistrict;
  status: "active" | "inactive";
  owner_id: string | null;
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("zh-HK", {
      dateStyle: "medium",
      timeZone: "Asia/Hong_Kong",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function VenueOwnerToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-emerald-600" : "bg-slate-200",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

export function AdminVenueOwnersManager({
  profiles: initialProfiles,
  venues,
}: {
  profiles: AdminProfileRow[];
  venues: AdminVenueRow[];
}) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setProfiles(initialProfiles);
  }, [initialProfiles]);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUser, setAssignUser] = useState<AdminProfileRow | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const nicknameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const profile of profiles) {
      map.set(profile.id, profile.nickname);
    }
    return map;
  }, [profiles]);

  const venuesByOwner = useMemo(() => {
    const map = new Map<string, AdminVenueRow[]>();
    for (const venue of venues) {
      if (!venue.owner_id) continue;
      const list = map.get(venue.owner_id) ?? [];
      list.push(venue);
      map.set(venue.owner_id, list);
    }
    return map;
  }, [venues]);

  const filteredProfiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((profile) =>
      profile.nickname.toLowerCase().includes(q),
    );
  }, [profiles, query]);

  async function onToggleVenueOwner(profile: AdminProfileRow, next: boolean) {
    setToggleError(null);
    setTogglingId(profile.id);

    const previous = profile.is_venue_owner;
    setProfiles((current) =>
      current.map((row) =>
        row.id === profile.id ? { ...row, is_venue_owner: next } : row,
      ),
    );

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_venue_owner: next })
        .eq("id", profile.id);

      if (error) {
        setProfiles((current) =>
          current.map((row) =>
            row.id === profile.id ? { ...row, is_venue_owner: previous } : row,
          ),
        );
        setToggleError(error.message);
        return;
      }

      router.refresh();
    } catch (caught) {
      setProfiles((current) =>
        current.map((row) =>
          row.id === profile.id ? { ...row, is_venue_owner: previous } : row,
        ),
      );
      setToggleError(
        caught instanceof Error ? caught.message : "更新館主權限失敗",
      );
    } finally {
      setTogglingId(null);
    }
  }

  function openAssignModal(profile: AdminProfileRow) {
    setAssignUser(profile);
    setSelectedVenueId("");
    setAssignError(null);
    setAssignOpen(true);
  }

  function closeAssignModal() {
    if (assigning) return;
    setAssignOpen(false);
    setAssignUser(null);
    setSelectedVenueId("");
    setAssignError(null);
  }

  async function onAssignVenue(event: React.FormEvent) {
    event.preventDefault();
    if (!assignUser || !selectedVenueId) {
      setAssignError("請選擇要指派的場地。");
      return;
    }

    setAssignError(null);
    setAssigning(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("private_venues")
        .update({ owner_id: assignUser.id })
        .eq("id", selectedVenueId);

      if (error) {
        setAssignError(error.message);
        return;
      }

      closeAssignModal();
      router.refresh();
    } catch (caught) {
      setAssignError(
        caught instanceof Error ? caught.message : "指派場地失敗",
      );
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            館主權限與場地指派
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            開啟用戶的館主權限後，可將私人場地指派給該用戶管理。
          </p>
        </div>
        <label className="block w-full sm:w-72">
          <span className="sr-only">搜尋暱稱</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋暱稱…"
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
          />
        </label>
      </div>

      {toggleError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {toggleError}
        </div>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">暱稱</th>
                <th className="px-4 py-3">地區</th>
                <th className="px-4 py-3">加入日期</th>
                <th className="px-4 py-3">已指派場地</th>
                <th className="px-4 py-3">館主權限</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    {query.trim() ? "找不到符合的用戶。" : "目前沒有用戶資料。"}
                  </td>
                </tr>
              ) : null}
              {filteredProfiles.map((profile) => {
                const ownedVenues = venuesByOwner.get(profile.id) ?? [];
                return (
                  <tr key={profile.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {profile.nickname}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {profile.district
                        ? HK_DISTRICT_LABELS[profile.district]
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatWhen(profile.created_at)}
                    </td>
                    <td className="max-w-[16rem] px-4 py-3 text-slate-600">
                      {ownedVenues.length > 0 ? (
                        <ul className="space-y-0.5">
                          {ownedVenues.map((venue) => (
                            <li key={venue.id} className="truncate text-xs">
                              {venue.name}
                              {venue.status === "inactive" ? (
                                <span className="ml-1 text-slate-400">（下架）</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <VenueOwnerToggle
                          checked={profile.is_venue_owner}
                          disabled={togglingId === profile.id}
                          onChange={(next) => onToggleVenueOwner(profile, next)}
                        />
                        <span className="text-xs text-slate-500">
                          {profile.is_venue_owner ? "館主" : "一般"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {profile.is_venue_owner ? (
                        <button
                          type="button"
                          onClick={() => openAssignModal(profile)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        >
                          指派場地
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {assignOpen && assignUser ? (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={closeAssignModal}
        >
          <div
            role="dialog"
            aria-labelledby="assign-venue-title"
            className="my-6 w-full max-w-lg rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <form onSubmit={onAssignVenue}>
              <div className="border-b border-slate-100 px-6 py-4">
                <h2
                  id="assign-venue-title"
                  className="text-lg font-bold text-slate-900"
                >
                  指派場地
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  將私人場地指派給{" "}
                  <span className="font-semibold text-slate-800">
                    {assignUser.nickname}
                  </span>
                  管理。若場地已有館主，指派後將覆蓋原有設定。
                </p>
              </div>

              <div className="space-y-4 px-6 py-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    選擇場地
                  </span>
                  <select
                    required
                    value={selectedVenueId}
                    onChange={(event) => setSelectedVenueId(event.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="">請選擇…</option>
                    {venues.map((venue) => {
                      const ownerLabel =
                        venue.owner_id && venue.owner_id !== assignUser.id
                          ? nicknameById.get(venue.owner_id) ?? "其他館主"
                          : null;
                      return (
                        <option key={venue.id} value={venue.id}>
                          {venue.name} · {HK_DISTRICT_LABELS[venue.district]}
                          {venue.status === "inactive" ? " · 已下架" : ""}
                          {ownerLabel ? ` · 現任：${ownerLabel}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </label>

                {assignError ? (
                  <p className="text-sm text-red-600">{assignError}</p>
                ) : null}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  disabled={assigning}
                  onClick={closeAssignModal}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={assigning || !selectedVenueId}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                >
                  {assigning ? "指派中…" : "確認指派"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
