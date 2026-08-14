"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeHkPhone, translateAuthError } from "@/lib/auth";
import {
  authGhostClass,
  authInputClass,
  authPrimaryClass,
} from "@/components/auth/auth-shell";

export function PhoneAuth({
  nextPath = "/profile",
  sendLabel = "使用手機號碼登入",
}: {
  nextPath?: string;
  sendLabel?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [e164, setE164] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function sendCode() {
    setError(null);
    setInfo(null);
    const normalized = normalizeHkPhone(phoneInput);
    if (!normalized) {
      setError("請輸入有效的香港手機號碼（8 位數字）。");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: normalized,
      });
      if (authError) {
        setError(translateAuthError(authError.message));
        return;
      }
      setE164(normalized);
      setStep("otp");
      setInfo(`已向 ${normalized} 送出驗證碼。`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "無法送出驗證碼");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setError(null);
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("請輸入 6 位數字驗證碼。");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.verifyOtp({
        phone: e164,
        token: otp.trim(),
        type: "sms",
      });
      if (authError) {
        setError(translateAuthError(authError.message));
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "驗證失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {step === "phone" ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendCode();
          }}
        >
          <label className="text-sm font-medium text-paper/80" htmlFor="phone">
            手機號碼
          </label>
          <div className="flex">
            <span className="inline-flex min-h-12 items-center border-2 border-r-0 border-paper/35 px-3 text-sm font-bold text-line">
              +852
            </span>
            <input
              id="phone"
              name="phone"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="9123 4567"
              value={phoneInput}
              onChange={(event) => setPhoneInput(event.target.value)}
              className={`${authInputClass} border-l-0`}
            />
          </div>
          <button type="submit" disabled={loading} className={authGhostClass}>
            {loading ? "送出中…" : sendLabel}
          </button>
        </form>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void verifyCode();
          }}
        >
          <label className="text-sm font-medium text-paper/80" htmlFor="otp">
            短訊驗證碼
          </label>
          <input
            id="otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6 位數字"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className={authInputClass}
          />
          <button type="submit" disabled={loading} className={authPrimaryClass}>
            {loading ? "核實中…" : "確認驗證碼"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setOtp("");
              setInfo(null);
              setError(null);
            }}
            className="text-left text-sm text-paper/60 hover:text-line"
          >
            改用其他號碼
          </button>
        </form>
      )}
      {info ? <p className="text-sm text-line">{info}</p> : null}
      {error ? <p className="text-sm text-line">{error}</p> : null}
    </div>
  );
}
