"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { venueSportIcon } from "@/lib/venue-sport-icons";
import { HK_DISTRICT_LABELS } from "@/types/database";
import type { VenueListItem } from "@/components/venues/venues-directory-view";

function VenueCover({ images, name }: { images: string[]; name: string }) {
  if (images[0]) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={images[0]}
        alt={name}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-primary/8">
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-primary/50" fill="none" aria-hidden>
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

export function VenueCard({ venue }: { venue: VenueListItem }) {
  const t = useTranslations("venuesPage");

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line-subtle bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-[16/10] overflow-hidden bg-mist">
        <VenueCover images={venue.images} name={venue.name} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-primary">
          {HK_DISTRICT_LABELS[venue.district]}
        </p>
        <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-foreground">
          {venue.name}
        </h2>

        {venue.sport_types.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t("supportedSports")}>
            {venue.sport_types.map((sport) => (
              <li key={sport}>
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/8 text-base"
                  title={sport}
                >
                  <span aria-hidden>{venueSportIcon(sport)}</span>
                  <span className="sr-only">{sport}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-muted">{t("noSportsListed")}</p>
        )}

        <Link
          href={`/venues/${venue.id}`}
          className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary transition-colors hover:bg-primary/15"
        >
          {t("viewDetails")}
        </Link>
      </div>
    </article>
  );
}
