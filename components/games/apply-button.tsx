"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export type ApplyActionState =
  | "login"
  | "host"
  | "pending"
  | "waitlisted"
  | "joined"
  | "waitlist"
  | "apply"
  | "unavailable";

export type JoinedPaymentStatus = "on_site" | "needs_proof" | "proof_done";

const footerPrimaryClass =
  "flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-100";

const footerDisabledClass =
  "flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-mist text-base font-semibold text-muted";

const footerHostClass =
  "flex min-h-12 w-full items-center justify-center rounded-xl border border-line-subtle bg-mist text-base font-semibold text-foreground transition-colors hover:bg-mist/80";

export function ApplyButton({
  gameId,
  userId,
  actionState,
  unavailableMessage,
  joinedPaymentStatus,
  existingApplicationId,
  onWithdraw = false,
  layout = "inline",
}: {
  gameId: string;
  userId: string | null;
  actionState?: ApplyActionState;
  unavailableMessage?: string | null;
  joinedPaymentStatus?: JoinedPaymentStatus;
  existingApplicationId?: string | null;
  onWithdraw?: boolean;
  layout?: "inline" | "footer";
}) {
  const t = useTranslations("gameDetail");
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [doneWaitlist, setDoneWaitlist] = useState(false);

  const state = actionState ?? (userId ? "apply" : "login");
  const isWaitlist = state === "waitlist";

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (state === "login") {
    return (
      <Link href={`/login?next=/games/${gameId}`} className={footerPrimaryClass}>
        {t("loginToApply")}
      </Link>
    );
  }

  if (state === "host") {
    return (
      <Link href="/host" className={footerHostClass}>
        {t("manageGame")}
      </Link>
    );
  }

  if (state === "pending" || state === "waitlisted") {
    const label =
      state === "pending" ? t("appliedPending") : t("appliedWaitlisted");

    return (
      <div className="flex flex-col gap-2">
        <button type="button" disabled className={footerDisabledClass}>
          {label}
        </button>
        {onWithdraw && existingApplicationId ? (
          <WithdrawButton
            existingApplicationId={existingApplicationId}
            userId={userId!}
            layout={layout}
            withdrawing={withdrawing}
            setWithdrawing={setWithdrawing}
            setError={setError}
            router={router}
          />
        ) : null}
        {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (state === "joined") {
    const label =
      joinedPaymentStatus === "on_site"
        ? t("joinedPayOnSite")
        : joinedPaymentStatus === "needs_proof"
          ? t("joinedNeedsProofShort")
          : t("joinedProofUploaded");

    return (
      <div className="flex flex-col gap-2">
        <button type="button" disabled className={footerDisabledClass}>
          {label}
        </button>
        {onWithdraw && existingApplicationId ? (
          <WithdrawButton
            existingApplicationId={existingApplicationId}
            userId={userId!}
            layout={layout}
            withdrawing={withdrawing}
            setWithdrawing={setWithdrawing}
            setError={setError}
            router={router}
          />
        ) : null}
        {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (state === "unavailable") {
    return (
      <button type="button" disabled className={footerDisabledClass}>
        {unavailableMessage ?? t("unavailable")}
      </button>
    );
  }

  if (done) {
    const doneText = doneWaitlist ? t("doneWaitlisted") : t("donePending");
    return (
      <button type="button" disabled className={footerDisabledClass}>
        {doneText}
      </button>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!userId) return;
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
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
          setError(t("alreadyApplied"));
        } else {
          setError(insertError.message);
        }
        return;
      }

      setDoneWaitlist(created?.status === "waitlisted" || isWaitlist);
      setDone(true);
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("applyFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={layout === "footer" ? "flex flex-col gap-2" : "flex flex-col gap-3"}>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className={footerPrimaryClass}
      >
        {isWaitlist ? t("waitlist") : t("applyNow")}
      </button>

      {error && layout !== "footer" ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      {open ? (
        <ApplyDialog
          titleId={titleId}
          loading={loading}
          isWaitlist={isWaitlist}
          message={message}
          setMessage={setMessage}
          error={error}
          onClose={() => !loading && setOpen(false)}
          onSubmit={submit}
          t={t}
        />
      ) : null}
    </div>
  );
}

function WithdrawButton({
  existingApplicationId,
  userId,
  layout,
  withdrawing,
  setWithdrawing,
  setError,
  router,
}: {
  existingApplicationId: string;
  userId: string;
  layout: "inline" | "footer";
  withdrawing: boolean;
  setWithdrawing: (value: boolean) => void;
  setError: (value: string | null) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const t = useTranslations("gameDetail");

  async function withdraw() {
    if (!window.confirm(t("withdrawConfirm"))) return;
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
      setError(caught instanceof Error ? caught.message : t("actionFailed"));
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <button
      type="button"
      disabled={withdrawing}
      onClick={withdraw}
      className={
        layout === "footer"
          ? "min-h-10 w-full rounded-xl text-sm font-semibold text-muted transition-colors hover:text-foreground disabled:opacity-55"
          : "inline-flex min-h-11 w-fit items-center border-2 border-ink/20 px-6 text-sm font-bold transition-colors hover:border-ink disabled:opacity-55"
      }
    >
      {withdrawing ? t("processing") : t("withdraw")}
    </button>
  );
}

function ApplyDialog({
  titleId,
  loading,
  isWaitlist,
  message,
  setMessage,
  error,
  onClose,
  onSubmit,
  t,
}: {
  titleId: string;
  loading: boolean;
  isWaitlist: boolean;
  message: string;
  setMessage: (value: string) => void;
  error: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  t: ReturnType<typeof useTranslations<"gameDetail">>;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <h3
            id={titleId}
            className="text-2xl font-black tracking-tight text-foreground"
          >
            {isWaitlist ? t("dialogWaitlistTitle") : t("dialogApplyTitle")}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {isWaitlist ? t("dialogWaitlistHint") : t("dialogApplyHint")}
          </p>

          <form id="apply-dialog-form" onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted" htmlFor="apply-message">
                {t("messageLabel")}
              </label>
              <textarea
                id="apply-message"
                rows={4}
                maxLength={200}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-1 min-h-28 w-full rounded-xl border border-line-subtle bg-canvas px-4 py-3 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder={t("messagePlaceholder")}
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3 border-t border-line-subtle bg-white p-6 dark:bg-zinc-900">
          <button
            type="submit"
            form="apply-dialog-form"
            disabled={loading}
            className="min-h-11 flex-1 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-55 sm:flex-none"
          >
            {loading
              ? t("processing")
              : isWaitlist
                ? t("confirmWaitlist")
                : t("submitApply")}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="min-h-11 flex-1 rounded-xl border border-line-subtle px-6 text-sm font-bold text-foreground transition-colors hover:bg-mist disabled:opacity-55 sm:flex-none"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
