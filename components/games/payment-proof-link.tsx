"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createSignedPaymentProofUrl } from "@/lib/payment-proof";

export function PaymentProofLink({ path }: { path: string | null | undefined }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const signed = await createSignedPaymentProofUrl(supabase, path);
        if (!cancelled) setUrl(signed);
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "無法開啟截圖");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!path) return null;
  if (error) return <span className="text-xs text-court">{error}</span>;
  if (!url) return <span className="text-xs text-ink/45">載入截圖…</span>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-sm font-bold text-court hover:underline"
    >
      查看付款截圖
    </a>
  );
}
