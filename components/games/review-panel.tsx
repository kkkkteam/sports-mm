"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types/database";

type Target = {
  user_id: string;
  nickname: string;
};

export function ReviewPanel({
  gameId,
  reviewerId,
  targets,
  existingReviews,
}: {
  gameId: string;
  reviewerId: string;
  targets: Target[];
  existingReviews: Pick<Review, "id" | "reviewee_id" | "rating" | "comment">[];
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(targets[0]?.user_id ?? null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const existingByUser = new Map(existingReviews.map((item) => [item.reviewee_id, item]));

  function selectTarget(userId: string) {
    setActiveId(userId);
    setError(null);
    setInfo(null);
    const existing = existingByUser.get(userId);
    setRating(existing?.rating ?? 5);
    setComment(existing?.comment ?? "");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!activeId) return;
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const existing = existingByUser.get(activeId);
      const payload = {
        game_id: gameId,
        reviewer_id: reviewerId,
        reviewee_id: activeId,
        rating,
        comment: comment.trim() || null,
      };

      const { error: upsertError } = existing
        ? await supabase.from("reviews").update(payload).eq("id", existing.id)
        : await supabase.from("reviews").insert(payload);

      if (upsertError) {
        setError(upsertError.message);
        return;
      }

      setInfo("評分已儲存。");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "評分失敗");
    } finally {
      setLoading(false);
    }
  }

  if (targets.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 border-y border-ink/15 py-8">
      <h2 className="text-xl font-black">活動評分</h2>
      <p className="mt-2 text-sm text-ink/65">
        為其他參加者打 1–5 星（場主不接受評分）。評論公開可見。
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {targets.map((target) => {
          const done = existingByUser.has(target.user_id);
          return (
            <button
              key={target.user_id}
              type="button"
              onClick={() => selectTarget(target.user_id)}
              className={`min-h-10 px-4 text-sm font-bold ${
                activeId === target.user_id
                  ? "bg-ink text-paper"
                  : "border-2 border-ink/15 text-ink/70 hover:border-ink"
              }`}
            >
              {target.nickname}
              {done ? " ✓" : ""}
            </button>
          );
        })}
      </div>

      {activeId ? (
        <form onSubmit={submit} className="mt-6 max-w-lg space-y-4">
          <div>
            <p className="text-sm font-medium text-ink/70">星級</p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`flex h-11 w-11 items-center justify-center text-lg font-black ${
                    rating >= value ? "bg-line text-ink" : "border-2 border-ink/15 text-ink/35"
                  }`}
                  aria-label={`${value} 星`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink/70" htmlFor="review-comment">
              評論（可選）
            </label>
            <textarea
              id="review-comment"
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="mt-1 min-h-24 w-full border-2 border-ink/20 bg-transparent px-4 py-3 text-base outline-none focus:border-court"
              placeholder="準時、技術、態度…"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-11 bg-ink px-6 text-sm font-bold text-paper transition-colors hover:bg-court disabled:opacity-55"
          >
            {loading ? "儲存中…" : existingByUser.has(activeId) ? "更新評分" : "送出評分"}
          </button>
          {error ? <p className="text-sm text-court">{error}</p> : null}
          {info ? <p className="text-sm text-court">{info}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
