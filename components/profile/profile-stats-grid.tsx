"use client";

import { useTranslations } from "next-intl";
import { formatAttendanceRate, formatRating } from "@/lib/reputation";
import type { Profile } from "@/types/database";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line-subtle bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tabular-nums text-primary">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function ProfileStatsGrid({ profile }: { profile: Profile }) {
  const t = useTranslations("profile");

  const attendance =
    profile.attendance_rate != null
      ? formatAttendanceRate(profile.attendance_rate)
      : null;

  const rating = formatRating(profile.rating);
  const ratingDisplay =
    rating != null
      ? profile.rating_count > 0
        ? `★ ${rating}`
        : `★ ${rating}`
      : "—";

  const ratingHint =
    profile.rating_count > 0
      ? t("ratingCount", { count: profile.rating_count })
      : t("ratingEmpty");

  return (
    <section className="mt-6" aria-label={t("statsTitle")}>
      <h2 className="mb-3 text-base font-bold text-foreground">
        {t("statsTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={t("attendanceRate")}
          value={attendance ?? t("newPlayer")}
          hint={
            attendance && profile.attendance_marked_count > 0
              ? t("attendanceMarked", {
                  count: profile.attendance_marked_count,
                })
              : undefined
          }
        />
        <StatCard
          label={t("rating")}
          value={ratingDisplay}
          hint={ratingHint}
        />
        <StatCard
          label={t("gamesHosted")}
          value={String(profile.games_hosted_count)}
          hint={t("gamesHostedHint")}
        />
        <StatCard
          label={t("gamesJoined")}
          value={String(profile.games_joined_count)}
          hint={t("gamesJoinedHint")}
        />
      </div>
    </section>
  );
}
