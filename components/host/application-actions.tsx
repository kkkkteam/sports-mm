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
  const [loading, setLoading] = useState<
    "accepted" | "rejected" | "withdrawn" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(status: "accepted" | "rejected" | "withdrawn") {
    const confirmRemove =
      status === "withdrawn"
        ? window.confirm("確定將此人移出名單？空缺會優先給候補首位。")
        : true;
    if (!confirmRemove) return;

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

  if (currentStatus === "pending") {
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

  if (currentStatus === "waitlisted") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => decide("rejected")}
          className="min-h-10 border-2 border-ink/20 px-4 text-sm font-bold text-ink transition-colors hover:border-ink disabled:opacity-55"
        >
          {loading === "rejected" ? "處理中…" : "拒絕候補"}
        </button>
        {error ? <p className="w-full text-sm text-court">{error}</p> : null}
      </div>
    );
  }

  if (currentStatus === "accepted") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => decide("withdrawn")}
          className="min-h-10 border-2 border-ink/20 px-4 text-sm font-bold text-ink transition-colors hover:border-ink disabled:opacity-55"
        >
          {loading === "withdrawn" ? "處理中…" : "移出名單"}
        </button>
        {error ? <p className="w-full text-sm text-court">{error}</p> : null}
      </div>
    );
  }

  return null;
}
