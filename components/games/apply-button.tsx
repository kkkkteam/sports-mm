"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function ApplyButton({
  gameId,
  userId,
  disabledReason,
}: {
  gameId: string;
  userId: string | null;
  disabledReason?: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!userId) {
    return (
      <Link
        href={`/login?next=/games/${gameId}`}
        className="inline-flex min-h-12 items-center justify-center bg-ink px-8 text-base font-bold text-paper transition-colors hover:bg-court"
      >
        登入後申請加入
      </Link>
    );
  }

  if (disabledReason) {
    return <p className="text-base font-medium text-ink/60">{disabledReason}</p>;
  }

  if (done) {
    return <p className="text-base font-bold text-court">已送出申請，等待房主審批。</p>;
  }

  async function apply() {
    if (!userId) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("applications").insert({
        game_id: gameId,
        applicant_id: userId,
        message: message.trim() || null,
        status: "pending",
      });
      if (insertError) {
        if (insertError.code === "23505") {
          setError("你已申請過這個場次。");
        } else {
          setError(insertError.message);
        }
        return;
      }
      setDone(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "申請失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-3">
      <label className="text-sm font-medium text-ink/70" htmlFor="apply-message">
        給房主的訊息（可選）
      </label>
      <textarea
        id="apply-message"
        rows={3}
        maxLength={200}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="min-h-24 w-full border-2 border-ink/20 bg-transparent px-4 py-3 text-base outline-none focus:border-court"
        placeholder="簡單介紹自己的水平或經驗"
      />
      <button
        type="button"
        onClick={apply}
        disabled={loading}
        className="inline-flex min-h-12 items-center justify-center bg-line px-8 text-base font-bold text-ink transition-colors hover:bg-paper disabled:opacity-55"
      >
        {loading ? "送出中…" : "申請加入"}
      </button>
      {error ? <p className="text-sm text-court">{error}</p> : null}
    </div>
  );
}
