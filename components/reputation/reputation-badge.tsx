"use client";

import { formatAttendanceRate, formatRating } from "@/lib/reputation";

export function ReputationBadge({
  rating,
  ratingCount,
  attendanceRate,
  size = "md",
}: {
  rating: number | null;
  ratingCount?: number;
  attendanceRate: number | null;
  size?: "sm" | "md";
}) {
  const stars = formatRating(rating);
  const rate = formatAttendanceRate(attendanceRate);
  const text = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${text} font-bold`}>
      <span className="text-court">
        ★ {stars ?? "—"}
        {ratingCount != null && ratingCount > 0 ? (
          <span className="ml-1 font-medium text-ink/45">({ratingCount})</span>
        ) : null}
      </span>
      <span className="text-ink/70">
        出席率 {rate ?? "—"}
      </span>
    </div>
  );
}
