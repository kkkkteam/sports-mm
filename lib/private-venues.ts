import type { SupabaseClient } from "@supabase/supabase-js";

export const PRIVATE_VENUE_SPORT_OPTIONS = [
  "籃球",
  "羽毛球",
  "乒乓球",
  "匹克球",
  "足球",
  "網球",
  "排球",
] as const;

export const PRIVATE_VENUE_FACILITY_OPTIONS = [
  "更衣室",
  "冷氣",
  "淋浴",
  "停車場",
  "飲水機",
  "觀眾席",
  "器材租借",
] as const;

const BUCKET = "private-venue-images";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function fileExt(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  return ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext) ? ext : "jpg";
}

export async function uploadPrivateVenueImage(
  supabase: SupabaseClient,
  { venueId, file }: { venueId: string; file: File },
) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("只接受 JPG / PNG / WebP 圖片。");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("圖片需小於 8MB。");
  }

  const path = `${venueId}/${crypto.randomUUID()}.${fileExt(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
