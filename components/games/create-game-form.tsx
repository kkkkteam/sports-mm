"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  datetimeLocalToIso,
  defaultEndLocal,
  defaultStartLocal,
  formatHkd,
} from "@/lib/format";
import {
  HK_DISTRICT_OPTIONS,
  type HkDistrict,
  type Sport,
} from "@/types/database";

const fieldClass =
  "mt-2 min-h-12 w-full border-2 border-ink/20 bg-transparent px-4 text-base outline-none focus:border-court";

export function CreateGameForm({
  sports,
  userId,
  defaultDistrict,
}: {
  sports: Sport[];
  userId: string;
  defaultDistrict?: HkDistrict | null;
}) {
  const router = useRouter();
  const [sportId, setSportId] = useState(sports[0]?.id ?? "");
  const [venueLabel, setVenueLabel] = useState("");
  const [district, setDistrict] = useState<HkDistrict>(
    defaultDistrict ?? "yau_tsim_mong",
  );
  const [startsLocal, setStartsLocal] = useState(defaultStartLocal);
  const [endsLocal, setEndsLocal] = useState(() => defaultEndLocal(defaultStartLocal()));
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [feePerPerson, setFeePerPerson] = useState(50);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSport = useMemo(
    () => sports.find((sport) => sport.id === sportId) ?? null,
    [sports, sportId],
  );

  const totalCost = Math.max(0, feePerPerson) * Math.max(2, maxPlayers);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!sportId || !selectedSport) {
      setError("請選擇運動類型。");
      return;
    }
    if (!venueLabel.trim()) {
      setError("請填寫場地名稱／地點。");
      return;
    }
    if (maxPlayers < 2) {
      setError("總人數最少 2 人。");
      return;
    }

    const startsAt = datetimeLocalToIso(startsLocal);
    const endsAt = datetimeLocalToIso(endsLocal);
    if (new Date(endsAt) <= new Date(startsAt)) {
      setError("結束時間必須晚於開始時間。");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const title = `${selectedSport.name_zh}｜${venueLabel.trim()}`;
      const { data, error: insertError } = await supabase
        .from("games")
        .insert({
          host_id: userId,
          sport_id: sportId,
          venue_label: venueLabel.trim(),
          district,
          starts_at: startsAt,
          ends_at: endsAt,
          max_players: maxPlayers,
          total_cost_hkd: totalCost,
          cost_split_mode: "all_players",
          title,
          description: notes.trim() || null,
          status: "open",
        })
        .select("id")
        .single();

      if (insertError || !data) {
        setError(insertError?.message ?? "發佈失敗，請稍後再試。");
        return;
      }

      router.push(`/games/${data.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "發佈失敗");
    } finally {
      setLoading(false);
    }
  }

  if (sports.length === 0) {
    return (
      <p className="text-ink/70">
        尚未載入運動項目。請先在 Supabase 執行 migration。
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <label className="text-sm font-medium text-ink/70" htmlFor="sport">
          運動類型
        </label>
        <select
          id="sport"
          required
          value={sportId}
          onChange={(event) => {
            const next = event.target.value;
            setSportId(next);
            const sport = sports.find((item) => item.id === next);
            if (sport) setMaxPlayers(Math.max(2, sport.min_players));
          }}
          className={fieldClass}
        >
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name_zh}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-ink/70" htmlFor="venue">
          場地名稱／地點
        </label>
        <input
          id="venue"
          required
          maxLength={80}
          placeholder="例如：維園籃球場 3 號"
          value={venueLabel}
          onChange={(event) => setVenueLabel(event.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink/70" htmlFor="district">
          地區
        </label>
        <select
          id="district"
          required
          value={district}
          onChange={(event) => setDistrict(event.target.value as HkDistrict)}
          className={fieldClass}
        >
          {HK_DISTRICT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink/70" htmlFor="starts">
            開始時間
          </label>
          <input
            id="starts"
            type="datetime-local"
            required
            value={startsLocal}
            onChange={(event) => {
              setStartsLocal(event.target.value);
              setEndsLocal(defaultEndLocal(event.target.value));
            }}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70" htmlFor="ends">
            結束時間
          </label>
          <input
            id="ends"
            type="datetime-local"
            required
            value={endsLocal}
            onChange={(event) => setEndsLocal(event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink/70" htmlFor="players">
            總人數（含自己）
          </label>
          <input
            id="players"
            type="number"
            min={2}
            max={40}
            required
            value={maxPlayers}
            onChange={(event) => setMaxPlayers(Number(event.target.value))}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70" htmlFor="fee">
            每人需夾費用（HKD）
          </label>
          <input
            id="fee"
            type="number"
            min={0}
            step={1}
            required
            value={feePerPerson}
            onChange={(event) => setFeePerPerson(Number(event.target.value))}
            className={fieldClass}
          />
        </div>
      </div>

      <p className="text-sm text-ink/60">
        場租合計約 {formatHkd(totalCost)}（{formatHkd(feePerPerson)} × {maxPlayers} 人）
      </p>

      <div>
        <label className="text-sm font-medium text-ink/70" htmlFor="notes">
          備註
        </label>
        <textarea
          id="notes"
          rows={4}
          maxLength={500}
          placeholder="例如：自備波鞋、水準要求、集合位置…"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className={`${fieldClass} min-h-28 py-3`}
        />
      </div>

      {error ? <p className="text-sm text-court">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-12 items-center justify-center bg-ink px-8 text-base font-bold text-paper transition-colors hover:bg-court disabled:opacity-55"
      >
        {loading ? "發佈中…" : "發佈拼場"}
      </button>
    </form>
  );
}
