"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminCancelGameButton({
  gameId,
  title,
}: {
  gameId: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCancel() {
    const ok = window.confirm(
      `確定強制下架「${title}」？\n場次狀態將改為 cancelled，無法再被申請。`,
    );
    if (!ok) return;

    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("games")
        .update({ status: "cancelled" })
        .eq("id", gameId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "下架失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={loading}
        onClick={onCancel}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-55"
      >
        {loading ? "處理中…" : "強制下架"}
      </button>
      {error ? <p className="max-w-[12rem] text-right text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
