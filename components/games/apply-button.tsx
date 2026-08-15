"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadPaymentProof } from "@/lib/payment-proof";

export function ApplyButton({
  gameId,
  userId,
  disabledReason,
  existingApplicationId,
  existingProofUrl,
  mode = "apply",
  allowProofUpdate = false,
  onWithdraw = false,
}: {
  gameId: string;
  userId: string | null;
  disabledReason?: string | null;
  existingApplicationId?: string | null;
  existingProofUrl?: string | null;
  mode?: "apply" | "waitlist";
  allowProofUpdate?: boolean;
  /** Shown when user can cancel pending/waitlisted/accepted */
  onWithdraw?: boolean;
}) {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [doneWaitlist, setDoneWaitlist] = useState(false);

  const canUpdateProof = Boolean(userId && existingApplicationId && allowProofUpdate);
  const isWaitlist = mode === "waitlist";

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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

  if (disabledReason && !canUpdateProof && !onWithdraw) {
    return <p className="text-base font-medium text-ink/60">{disabledReason}</p>;
  }

  if (done && !canUpdateProof) {
    return (
      <p className="text-base font-bold text-court">
        {doneWaitlist
          ? "已加入候補名單，有空缺時會通知你並轉為待審批。"
          : "已送出申請，等待房主審批。"}
      </p>
    );
  }

  async function withdraw() {
    if (!userId || !existingApplicationId) return;
    if (!window.confirm("確定要退出／取消申請？若你已在名單中，空缺會讓給候補。")) return;
    setError(null);
    setWithdrawing(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status: "withdrawn" })
        .eq("id", existingApplicationId)
        .eq("applicant_id", userId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "操作失敗");
    } finally {
      setWithdrawing(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!userId) return;
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (canUpdateProof && existingApplicationId) {
        let proofPath = existingProofUrl ?? null;
        if (file) {
          proofPath = await uploadPaymentProof(supabase, {
            applicantId: userId,
            applicationId: existingApplicationId,
            file,
          });
        }
        const { error: updateError } = await supabase
          .from("applications")
          .update({
            message: message.trim() || null,
            payment_proof_url: proofPath,
          })
          .eq("id", existingApplicationId)
          .eq("applicant_id", userId);

        if (updateError) {
          setError(updateError.message);
          return;
        }
        setOpen(false);
        setFile(null);
        router.refresh();
        return;
      }

      const { data: created, error: insertError } = await supabase
        .from("applications")
        .insert({
          game_id: gameId,
          applicant_id: userId,
          message: message.trim() || null,
          status: isWaitlist ? "waitlisted" : "pending",
        })
        .select("id, status")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          setError("你已申請過這個場次。");
        } else {
          setError(insertError.message);
        }
        return;
      }

      if (file && created?.id) {
        const proofPath = await uploadPaymentProof(supabase, {
          applicantId: userId,
          applicationId: created.id,
          file,
        });
        const { error: proofError } = await supabase
          .from("applications")
          .update({ payment_proof_url: proofPath })
          .eq("id", created.id);
        if (proofError) {
          setError(`申請已送出，但截圖上傳失敗：${proofError.message}`);
          setDone(true);
          setDoneWaitlist(created.status === "waitlisted" || isWaitlist);
          router.refresh();
          return;
        }
      }

      setDoneWaitlist(created?.status === "waitlisted" || isWaitlist);
      setDone(true);
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "申請失敗");
    } finally {
      setLoading(false);
    }
  }

  const primaryLabel = canUpdateProof
    ? "補傳／更換付款截圖"
    : isWaitlist
      ? "排隊候補"
      : "申請加入";

  return (
    <div className="flex flex-col gap-3">
      {disabledReason ? (
        <p className="text-base font-medium text-ink/60">{disabledReason}</p>
      ) : null}

      {!disabledReason || canUpdateProof ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className="inline-flex min-h-12 w-fit items-center justify-center bg-line px-8 text-base font-bold text-ink transition-colors hover:bg-paper"
        >
          {primaryLabel}
        </button>
      ) : null}

      {onWithdraw && existingApplicationId ? (
        <button
          type="button"
          disabled={withdrawing}
          onClick={withdraw}
          className="inline-flex min-h-11 w-fit items-center border-2 border-ink/20 px-6 text-sm font-bold transition-colors hover:border-ink disabled:opacity-55"
        >
          {withdrawing ? "處理中…" : "取消申請／退出名單"}
        </button>
      ) : null}

      {error ? <p className="text-sm text-court">{error}</p> : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-4 sm:items-center"
          role="presentation"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-lg border-2 border-ink/10 bg-paper p-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id={titleId} className="text-2xl font-black tracking-tight">
              {canUpdateProof
                ? "更新申請資料"
                : isWaitlist
                  ? "排隊候補"
                  : "申請加入"}
            </h3>
            <p className="mt-2 text-sm text-ink/65">
              {isWaitlist && !canUpdateProof
                ? "場次已滿。加入候補後，有人退出會自動轉成待審批並通知你。"
                : "可附上 PayMe / FPS 付款截圖（選填）。待審批／候補期間可更換。"}
            </p>

            <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-ink/70" htmlFor="apply-message">
                  給房主的訊息（可選）
                </label>
                <textarea
                  id="apply-message"
                  rows={3}
                  maxLength={200}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="mt-1 min-h-24 w-full border-2 border-ink/20 bg-transparent px-4 py-3 text-base outline-none focus:border-court"
                  placeholder="簡單介紹自己的水平或經驗"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-ink/70" htmlFor="apply-proof">
                  付款截圖（可選）
                </label>
                <input
                  id="apply-proof"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="mt-1 block w-full text-sm text-ink/70 file:mr-3 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-bold file:text-paper"
                />
                {existingProofUrl && !file ? (
                  <p className="mt-2 text-xs text-ink/50">已有上傳截圖，選新檔即可更換。</p>
                ) : null}
              </div>

              {error ? <p className="text-sm text-court">{error}</p> : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-11 bg-ink px-6 text-sm font-bold text-paper transition-colors hover:bg-court disabled:opacity-55"
                >
                  {loading
                    ? "處理中…"
                    : canUpdateProof
                      ? "儲存"
                      : isWaitlist
                        ? "確認候補"
                        : "送出申請"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setOpen(false)}
                  className="min-h-11 border-2 border-ink/20 px-6 text-sm font-bold transition-colors hover:border-ink"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
