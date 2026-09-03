"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { openMap } from "@/lib/open-map";
import { resolveVenueBookingAction } from "@/lib/venue-booking";
import { buildVenueHostPrefillPath } from "@/lib/venue-host-prefill";
import {
  HK_DISTRICT_LABELS,
  type HkDistrict,
  type PrivateVenue,
} from "@/types/database";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M14.5 6 9 11.5l5.5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function VenueImageCarousel({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  if (total === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-primary/8">
        <svg viewBox="0 0 24 24" className="h-12 w-12 text-primary/40" fill="none" aria-hidden>
          <path
            d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  const current = images[index] ?? images[0];

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-mist">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={current} alt={name} className="h-full w-full object-cover" />

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev - 1 + total) % total)}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % total)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            aria-label="Next image"
          >
            ›
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`Image ${dotIndex + 1}`}
                className={[
                  "h-1.5 rounded-full transition-all",
                  dotIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/50",
                ].join(" ")}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function VenueDetailView({ venue }: { venue: PrivateVenue }) {
  const t = useTranslations("venuesPage");
  const router = useRouter();
  const districtLabel = HK_DISTRICT_LABELS[venue.district as HkDistrict];
  const booking = resolveVenueBookingAction(venue.booking_link);

  function handleOpenMap() {
    openMap({
      lat: venue.lat ? Number(venue.lat) : null,
      lng: venue.lng ? Number(venue.lng) : null,
      venueLabel: venue.name,
      districtLabel,
    });
  }

  function handleBooking() {
    if (booking.disabled || !booking.href) return;

    if (booking.external) {
      window.open(booking.href, "_blank", "noopener,noreferrer");
      return;
    }

    if (booking.href.startsWith("tel:") || booking.href.startsWith("mailto:")) {
      window.location.href = booking.href;
      return;
    }

    window.prompt(t("contactPrompt"), booking.href);
  }

  return (
    <div className="flex min-h-full flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-line-subtle bg-canvas/95 backdrop-blur-md pt-safe">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
            aria-label={t("back")}
          >
            <BackIcon />
          </button>
          <h1 className="truncate text-base font-bold">{t("detailTitle")}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-44 [-webkit-overflow-scrolling:touch]">
        <VenueImageCarousel images={venue.images} name={venue.name} />

        <div className="space-y-5 px-4 py-5">
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {districtLabel}
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">
              {venue.name}
            </h2>
            <button
              type="button"
              onClick={handleOpenMap}
              className="mt-3 flex w-full items-start gap-2 rounded-xl bg-mist/60 px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-mist"
            >
              <MapPinIcon />
              <span className="min-w-0 flex-1 leading-relaxed">{venue.address}</span>
              <span className="shrink-0 text-xs font-semibold text-primary">
                {t("openInMap")}
              </span>
            </button>
          </section>

          {venue.sport_types.length > 0 ? (
            <section className="rounded-2xl border border-line-subtle bg-card p-4">
              <h3 className="text-sm font-bold text-foreground">{t("supportedSports")}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {venue.sport_types.map((sport) => (
                  <li key={sport}>
                    <span className="inline-flex rounded-full bg-primary/8 px-3 py-1.5 text-sm font-medium text-foreground">
                      {sport}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-2xl border border-line-subtle bg-card p-4">
            <h3 className="text-sm font-bold text-foreground">{t("aboutVenue")}</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {venue.description?.trim() || t("noDescription")}
            </p>
          </section>

          {venue.facilities.length > 0 ? (
            <section className="rounded-2xl border border-line-subtle bg-card p-4">
              <h3 className="text-sm font-bold text-foreground">{t("facilities")}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {venue.facilities.map((item) => (
                  <li key={item}>
                    <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[4.25rem] z-40 px-4">
        <div className="pointer-events-auto mx-auto w-full md:max-w-7xl">
          <div className="space-y-2.5 rounded-t-2xl bg-white/90 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-sm dark:bg-card/90">
            <button
              type="button"
              disabled={booking.disabled}
              onClick={handleBooking}
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-mist disabled:text-muted"
            >
              {booking.disabled
                ? t("bookingUnavailable")
                : t(booking.labelKey)}
            </button>

            <Link
              href={buildVenueHostPrefillPath(venue)}
              className="flex min-h-12 w-full items-center justify-center rounded-xl border border-primary/25 bg-primary/5 text-base font-bold text-primary transition-colors hover:bg-primary/10"
            >
              {t("hostAfterBooking")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
