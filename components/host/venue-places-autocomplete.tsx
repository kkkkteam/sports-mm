"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePlacesWidget } from "react-google-autocomplete";
import {
  extractCoordsFromPlace,
  extractVenueFromPlace,
  GOOGLE_MAPS_API_KEY,
} from "@/lib/places";

const fieldClass =
  "mt-2 w-full rounded-xl border border-line-subtle bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";

type VenuePlacesAutocompleteProps = {
  venueLabel: string;
  venueDetail: string;
  hasCoords: boolean;
  onVenueChange: (patch: {
    venueLabel?: string;
    venueDetail?: string;
    lat?: number | null;
    lng?: number | null;
  }) => void;
};

export function VenuePlacesAutocomplete({
  venueLabel,
  venueDetail,
  hasCoords,
  onVenueChange,
}: VenuePlacesAutocompleteProps) {
  const t = useTranslations("hostGame");
  const lastSelectedRef = useRef<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const { ref } = usePlacesWidget({
    apiKey: GOOGLE_MAPS_API_KEY || undefined,
    language: "zh-HK",
    onPlaceSelected: (place) => {
      const name = extractVenueFromPlace(place);
      const coords = extractCoordsFromPlace(place);
      lastSelectedRef.current = name;

      onVenueChange({
        venueLabel: name,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      });
      setInputKey((current) => current + 1);
    },
    options: {
      componentRestrictions: { country: "hk" },
      fields: ["name", "formatted_address", "geometry.location"],
      types: ["establishment", "geocode"],
    },
  });

  function handleBaseChange(next: string) {
    const patch: {
      venueLabel: string;
      lat?: number | null;
      lng?: number | null;
    } = { venueLabel: next };

    if (lastSelectedRef.current && next !== lastSelectedRef.current) {
      lastSelectedRef.current = null;
      patch.lat = null;
      patch.lng = null;
    }

    onVenueChange(patch);
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="space-y-4">
        <div>
          <input
            id="venue"
            type="text"
            required
            maxLength={80}
            placeholder={t("venuePlaceholder")}
            value={venueLabel}
            onChange={(event) => handleBaseChange(event.target.value)}
            className={fieldClass}
          />
          <p className="mt-2 text-xs text-amber-700">{t("venueApiKeyMissing")}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground" htmlFor="venue-detail">
            {t("venueDetailLabel")}
          </label>
          <input
            id="venue-detail"
            type="text"
            maxLength={40}
            placeholder={t("venueDetailPlaceholder")}
            value={venueDetail}
            onChange={(event) =>
              onVenueChange({ venueDetail: event.target.value })
            }
            className={fieldClass}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          id="venue"
          ref={ref}
          key={`venue-base-${inputKey}-${venueLabel}`}
          type="text"
          required
          maxLength={80}
          placeholder={t("venueSearchPlaceholder")}
          defaultValue={venueLabel}
          autoComplete="off"
          onChange={(event) => handleBaseChange(event.target.value)}
          className={fieldClass}
        />
        <p className="mt-2 text-xs text-muted">
          {hasCoords ? t("venueLocated") : t("venueSearchHint")}
        </p>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground" htmlFor="venue-detail">
          {t("venueDetailLabel")}
        </label>
        <input
          id="venue-detail"
          type="text"
          maxLength={40}
          placeholder={t("venueDetailPlaceholder")}
          value={venueDetail}
          onChange={(event) =>
            onVenueChange({ venueDetail: event.target.value })
          }
          className={fieldClass}
        />
        <p className="mt-2 text-xs text-muted">{t("venueDetailHint")}</p>
      </div>
    </div>
  );
}
