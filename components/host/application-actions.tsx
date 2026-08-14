"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ApplicationStatus } from "@/types/database";

export function ApplicationActions({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accepted" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (currentStatus !== "pending") {
    return null;
  }

  async function decide(status: "accepted" | "rejected") {
    setError(null);
    setLoading(status);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId);

      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "更新失敗");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => decide("accepted")}
        className="min-h-10 bg-line px-4 text-sm font-bold text-ink transition-colors hover:bg-paper disabled:opacity-55"
      >
        {loading === "accepted" ? "處理中…" : "接受"}
      </button>
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => decide("rejected")}
        className="min-h-10 border-2 border-ink/20 px-4 text-sm font-bold text-ink transition-colors hover:border-ink disabled:opacity-55"
      >
        {loading === "rejected" ? "處理中…" : "拒絕"}
      </button>
      {error ? <p className="w-full text-sm text-court">{error}</p> : null}
    </div>
  );
}
