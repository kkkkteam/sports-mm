"use client";

import { useLocale } from "next-intl";
import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth";
import {
  authInputClass,
  authPrimaryClass,
} from "@/components/auth/auth-shell";
import { withLocalePath } from "@/lib/locale-path";
import type { AppLocale } from "@/i18n/routing";

export function EmailAuth({
  mode,
  nextPath = "/profile",
}: {
  mode: "login" | "register";
  nextPath?: string;
}) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "register") {
        const name = nickname.trim();
        if (name.length < 1 || name.length > 24) {
          setError("暱稱需為 1 至 24 個字。");
          return;
        }

        const origin = window.location.origin;
        const localizedNext = withLocalePath(nextPath, locale);
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { nickname: name },
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(localizedNext)}`,
          },
        });

        if (authError) {
          setError(translateAuthError(authError.message));
          return;
        }

        if (!data.session) {
          setInfo("請到電郵確認帳戶，然後再入場。");
          return;
        }

        router.push(nextPath);
        router.refresh();
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(translateAuthError(authError.message));
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "電郵登入失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {mode === "register" ? (
        <>
          <label className="text-sm font-medium text-paper/80" htmlFor="nickname">
            暱稱
          </label>
          <input
            id="nickname"
            name="nickname"
            required
            maxLength={24}
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className={authInputClass}
          />
        </>
      ) : null}
      <label className="text-sm font-medium text-paper/80" htmlFor="email">
        電郵
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={authInputClass}
      />
      <label className="text-sm font-medium text-paper/80" htmlFor="password">
        密碼
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete={mode === "register" ? "new-password" : "current-password"}
        required
        minLength={6}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className={authInputClass}
      />
      <button type="submit" disabled={loading} className={authPrimaryClass}>
        {loading
          ? "處理中…"
          : mode === "register"
            ? "以電郵註冊"
            : "以電郵入場"}
      </button>
      {info ? <p className="text-sm text-line">{info}</p> : null}
      {error ? <p className="text-sm text-line">{error}</p> : null}
    </form>
  );
}
