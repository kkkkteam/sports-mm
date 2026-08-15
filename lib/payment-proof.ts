import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "payment-proofs";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function paymentProofPath(applicantId: string, applicationId: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext) ? ext : "jpg";
  return `${applicantId}/${applicationId}.${safeExt}`;
}

export async function uploadPaymentProof(
  supabase: SupabaseClient,
  {
    applicantId,
    applicationId,
    file,
  }: {
    applicantId: string;
    applicationId: string;
    file: File;
  },
) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("只接受 JPG / PNG / WebP 圖片。");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("圖片需小於 5MB。");
  }

  const path = paymentProofPath(applicantId, applicationId, file);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  // Private bucket: store storage path (not a public URL)
  return path;
}

export async function createSignedPaymentProofUrl(
  supabase: SupabaseClient,
  path: string,
  expiresIn = 3600,
) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
