"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function CompleteGameButton({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function complete() {
    if (!window.confirm("確認將此場次標記為已完成？之後可標記出席並互評。")) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("games")
        .update({ status: "completed" })
        .eq("id", gameId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "更新失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={complete}
        disabled={loading}
        className="inline-flex min-h-12 items-center border-2 border-ink/20 px-8 text-base font-bold transition-colors hover:border-ink disabled:opacity-55"
      >
        {loading ? "處理中…" : "標記活動完成"}
      </button>
      {error ? <p className="mt-2 text-sm text-court">{error}</p> : null}
    </div>
  );
}
