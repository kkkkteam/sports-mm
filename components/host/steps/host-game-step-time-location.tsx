"use client";

import { useTranslations } from "next-intl";
import { VenuePlacesAutocomplete } from "@/components/host/venue-places-autocomplete";
import type { HostGameFormData } from "@/lib/host-game-form";
import { todayHkDateString } from "@/lib/host-game-form";
import { HK_DISTRICT_OPTIONS, type HkDistrict } from "@/types/database";

const fieldClass =
  "mt-2 w-full rounded-xl border border-line-subtle bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";

type HostGameStepTimeLocationProps = {
  form: HostGameFormData;
  onChange: (patch: Partial<HostGameFormData>) => void;
};

export function HostGameStepTimeLocation({
  form,
  onChange,
}: HostGameStepTimeLocationProps) {
  const t = useTranslations("hostGame");
  const minDate = todayHkDateString();
  const hasCoords = form.lat != null && form.lng != null;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("step2Title")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("step2Hint")}</p>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground" htmlFor="game-date">
          {t("dateLabel")}
        </label>
        <input
          id="game-date"
          type="date"
          required
          min={minDate}
          value={form.date}
          onChange={(event) => onChange({ date: event.target.value })}
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-foreground" htmlFor="start-time">
            {t("startTimeLabel")}
          </label>
          <input
            id="start-time"
            type="time"
            required
            value={form.startTime}
            onChange={(event) => onChange({ startTime: event.target.value })}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground" htmlFor="end-time">
            {t("endTimeLabel")}
          </label>
          <input
            id="end-time"
            type="time"
            required
            value={form.endTime}
            onChange={(event) => onChange({ endTime: event.target.value })}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground" htmlFor="district">
          {t("districtLabel")}
        </label>
        <select
          id="district"
          required
          value={form.district}
          onChange={(event) =>
            onChange({ district: event.target.value as HkDistrict })
          }
          className={fieldClass}
        >
          {HK_DISTRICT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground" htmlFor="venue">
          {t("venueLabel")}
        </label>
        <VenuePlacesAutocomplete
          value={form.venueLabel}
          hasCoords={hasCoords}
          onVenueChange={(patch) => onChange(patch)}
        />
      </div>
    </section>
  );
}
