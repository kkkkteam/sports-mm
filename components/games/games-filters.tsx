"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { HK_DISTRICT_OPTIONS, type Sport } from "@/types/database";

const fieldClass =
  "min-h-11 w-full border-2 border-ink/20 bg-transparent px-3 text-sm outline-none focus:border-court";

export function GamesFilters({ sports }: { sports: Sport[] }) {
  const t = useTranslations("games");
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [sportId, setSportId] = useState(params.get("sport") ?? "");
  const [district, setDistrict] = useState(params.get("district") ?? "");
  const [date, setDate] = useState(params.get("date") ?? "");

  function apply(event: FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (sportId) next.set("sport", sportId);
    if (district) next.set("district", district);
    if (date) next.set("date", date);
    const query = next.toString();
    router.push(query ? `/games?${query}` : "/games");
  }

  function clear() {
    setQ("");
    setSportId("");
    setDistrict("");
    setDate("");
    router.push("/games");
  }

  return (
    <form
      onSubmit={apply}
      className="grid gap-3 border-y border-ink/15 py-5 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto_auto] md:items-end"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/55" htmlFor="q">
          {t("search")}
        </label>
        <input
          id="q"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={`${t("venue")}…`}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/55" htmlFor="sport">
          {t("sport")}
        </label>
        <select
          id="sport"
          value={sportId}
          onChange={(event) => setSportId(event.target.value)}
          className={fieldClass}
        >
          <option value="">{t("all")}</option>
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name_zh}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/55" htmlFor="district">
          {t("district")}
        </label>
        <select
          id="district"
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          className={fieldClass}
        >
          <option value="">{t("all")}</option>
          {HK_DISTRICT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/55" htmlFor="date">
          {t("date")}
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        className="min-h-11 bg-ink px-5 text-sm font-bold text-paper transition-colors hover:bg-court"
      >
        {t("filter")}
      </button>
      <button
        type="button"
        onClick={clear}
        className="min-h-11 border-2 border-ink/20 px-5 text-sm font-bold text-ink/70 transition-colors hover:border-ink"
      >
        {t("clear")}
      </button>
    </form>
  );
}
