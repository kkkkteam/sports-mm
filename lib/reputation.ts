export function formatRating(rating: number | null | undefined) {
  if (rating == null || Number.isNaN(Number(rating))) return null;
  return Number(rating).toFixed(1);
}

export function formatAttendanceRate(rate: number | null | undefined) {
  if (rate == null || Number.isNaN(Number(rate))) return null;
  const value = Number(rate);
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}
