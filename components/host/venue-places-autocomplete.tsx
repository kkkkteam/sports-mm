"use client";

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
  value: string;
  hasCoords: boolean;
  onVenueChange: (patch: {
    venueLabel: string;
    lat: number | null;
    lng: number | null;
  }) => void;
};

export function VenuePlacesAutocomplete({
  value,
  hasCoords,
  onVenueChange,
}: VenuePlacesAutocompleteProps) {
  const t = useTranslations("hostGame");

  const { ref } = usePlacesWidget({
    apiKey: GOOGLE_MAPS_API_KEY || undefined,
    language: "zh-HK",
    onPlaceSelected: (place) => {
      const venueLabel = extractVenueFromPlace(place);
      const coords = extractCoordsFromPlace(place);

      onVenueChange({
        venueLabel,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      });
    },
    options: {
      componentRestrictions: { country: "hk" },
      fields: ["name", "formatted_address", "geometry.location"],
      types: ["establishment", "geocode"],
    },
  });

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div>
        <input
          id="venue"
          type="text"
          required
          maxLength={80}
          placeholder={t("venuePlaceholder")}
          value={value}
          onChange={(event) =>
            onVenueChange({
              venueLabel: event.target.value,
              lat: null,
              lng: null,
            })
          }
          className={fieldClass}
        />
        <p className="mt-2 text-xs text-amber-700">{t("venueApiKeyMissing")}</p>
      </div>
    );
  }

  return (
    <div>
      <input
        id="venue"
        ref={ref}
        type="text"
        required
        maxLength={80}
        placeholder={t("venueSearchPlaceholder")}
        value={value}
        autoComplete="off"
        onChange={(event) =>
          onVenueChange({
            venueLabel: event.target.value,
            lat: null,
            lng: null,
          })
        }
        className={fieldClass}
      />
      <p className="mt-2 text-xs text-muted">
        {hasCoords ? t("venueLocated") : t("venueSearchHint")}
      </p>
    </div>
  );
}
