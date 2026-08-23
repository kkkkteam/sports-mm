"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadPaymentProof } from "@/lib/payment-proof";

export function PaymentProofPanel({
  applicationId,
  userId,
}: {
  applicationId: string;
  userId: string;
}) {
  const t = useTranslations("gameDetail");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const proofPath = await uploadPaymentProof(supabase, {
        applicantId: userId,
        applicationId,
        file,
      });

      const { error: updateError } = await supabase
        .from("applications")
        .update({ payment_proof_url: proofPath })
        .eq("id", applicationId)
        .eq("applicant_id", userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("proofUploadFailedGeneric"));
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 ring-1 ring-primary/15">
      <h2 className="text-lg font-bold text-foreground">{t("proofPanelTitle")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t("proofPanelHint")}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-55"
      >
        {loading ? t("processing") : t("proofPanelUpload")}
      </button>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
