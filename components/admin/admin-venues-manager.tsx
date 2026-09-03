"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  PRIVATE_VENUE_FACILITY_OPTIONS,
  PRIVATE_VENUE_SPORT_OPTIONS,
  uploadPrivateVenueImage,
} from "@/lib/private-venues";
import { HK_DISTRICT_LABELS, HK_DISTRICT_OPTIONS } from "@/types/database";
import type { HkDistrict, PrivateVenue, PrivateVenueStatus } from "@/types/database";

type FormState = {
  name: string;
  description: string;
  district: HkDistrict;
  address: string;
  lat: string;
  lng: string;
  bookingLink: string;
  status: PrivateVenueStatus;
  sportTypes: string[];
  facilities: string[];
};

const emptyForm: FormState = {
  name: "",
  description: "",
  district: "yau_tsim_mong",
  address: "",
  lat: "",
  lng: "",
  bookingLink: "",
  status: "active",
  sportTypes: [],
  facilities: [],
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("zh-HK", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Hong_Kong",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ChipToggle({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        checked
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function AdminVenuesManager({ venues }: { venues: PrivateVenue[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setForm(emptyForm);
    setFiles([]);
    setPreviews((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function toggleList(key: "sportTypes" | "facilities", value: string) {
    setForm((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const name = form.name.trim();
    const address = form.address.trim();
    if (!name) {
      setError("請填寫場地名稱。");
      return;
    }
    if (!address) {
      setError("請填寫詳細地址。");
      return;
    }

    const lat = form.lat.trim() ? Number(form.lat) : null;
    const lng = form.lng.trim() ? Number(form.lng) : null;
    if (form.lat.trim() && Number.isNaN(lat)) {
      setError("緯度格式不正確。");
      return;
    }
    if (form.lng.trim() && Number.isNaN(lng)) {
      setError("經度格式不正確。");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const venueId = crypto.randomUUID();
      const images: string[] = [];

      for (const file of files) {
        const url = await uploadPrivateVenueImage(supabase, { venueId, file });
        images.push(url);
      }

      const { error: insertError } = await supabase.from("private_venues").insert({
        id: venueId,
        name,
        description: form.description.trim() || null,
        sport_types: form.sportTypes,
        district: form.district,
        address,
        lat,
        lng,
        facilities: form.facilities,
        images,
        booking_link: form.bookingLink.trim() || null,
        status: form.status,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      resetForm();
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "新增場地失敗。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            私人場地管理
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            場地擁有者線下付費後，由管理員代為上架場地資訊。圖片會上傳至
            Storage，並寫入 <code className="rounded bg-slate-100 px-1">private_venues</code>。
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          + 新增場地
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">場地</th>
                <th className="px-4 py-3">地區</th>
                <th className="px-4 py-3">運動</th>
                <th className="px-4 py-3">設施</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3">建立時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {venues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    尚未上架任何私人場地。
                  </td>
                </tr>
              ) : null}
              {venues.map((venue) => (
                <tr key={venue.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {venue.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={venue.images[0]}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                          無圖
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{venue.name}</p>
                        <p className="truncate text-xs text-slate-400">{venue.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {HK_DISTRICT_LABELS[venue.district]}
                  </td>
                  <td className="max-w-[14rem] px-4 py-3 text-slate-600">
                    {venue.sport_types.length > 0 ? venue.sport_types.join("、") : "—"}
                  </td>
                  <td className="max-w-[14rem] px-4 py-3 text-slate-600">
                    {venue.facilities.length > 0 ? venue.facilities.join("、") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        venue.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {venue.status === "active" ? "上架中" : "已下架"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatWhen(venue.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => !saving && setOpen(false)}
        >
          <div
            role="dialog"
            aria-labelledby="new-venue-title"
            className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <form onSubmit={onSubmit}>
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 id="new-venue-title" className="text-lg font-bold text-slate-900">
                  新增私人場地
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  填寫場地資訊並上傳圖片後即可上架。
                </p>
              </div>

              <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">場地名稱</span>
                  <input
                    required
                    maxLength={80}
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                    placeholder="例如：旺角室內羽毛球場"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">場地介紹</span>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    placeholder="場地特色、開放時間、注意事項…"
                  />
                </label>

                <div>
                  <p className="text-sm font-semibold text-slate-700">支援運動</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRIVATE_VENUE_SPORT_OPTIONS.map((sport) => (
                      <ChipToggle
                        key={sport}
                        label={sport}
                        checked={form.sportTypes.includes(sport)}
                        onToggle={() => toggleList("sportTypes", sport)}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">地區</span>
                    <select
                      value={form.district}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          district: event.target.value as HkDistrict,
                        })
                      }
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    >
                      {HK_DISTRICT_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">狀態</span>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          status: event.target.value as PrivateVenueStatus,
                        })
                      }
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    >
                      <option value="active">上架中 (active)</option>
                      <option value="inactive">已下架 (inactive)</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">詳細地址</span>
                  <input
                    required
                    value={form.address}
                    onChange={(event) => setForm({ ...form, address: event.target.value })}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                    placeholder="街道、大廈、樓層"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">緯度 lat</span>
                    <input
                      inputMode="decimal"
                      value={form.lat}
                      onChange={(event) => setForm({ ...form, lat: event.target.value })}
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      placeholder="22.3193"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">經度 lng</span>
                    <input
                      inputMode="decimal"
                      value={form.lng}
                      onChange={(event) => setForm({ ...form, lng: event.target.value })}
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      placeholder="114.1694"
                    />
                  </label>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">設施</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRIVATE_VENUE_FACILITY_OPTIONS.map((item) => (
                      <ChipToggle
                        key={item}
                        label={item}
                        checked={form.facilities.includes(item)}
                        onToggle={() => toggleList("facilities", item)}
                      />
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">預訂連結</span>
                  <input
                    type="url"
                    value={form.bookingLink}
                    onChange={(event) =>
                      setForm({ ...form, bookingLink: event.target.value })
                    }
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                    placeholder="https://… 或內部預訂說明頁"
                  />
                </label>

                <div>
                  <p className="text-sm font-semibold text-slate-700">場地圖片</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    可多選，單張上限 8MB（JPG / PNG / WebP）。
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    multiple
                    className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                    onChange={(event) => {
                      const next = Array.from(event.target.files ?? []);
                      setFiles(next);
                      setPreviews((current) => {
                        current.forEach((item) => URL.revokeObjectURL(item.url));
                        return next.map((file) => ({
                          name: file.name,
                          url: URL.createObjectURL(file),
                        }));
                      });
                    }}
                  />
                  {previews.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {previews.map((item) => (
                        <li key={item.url}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.name}
                            className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setOpen(false)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? "儲存中…" : "儲存場地"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
