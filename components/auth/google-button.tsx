"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth";
import { authPrimaryClass } from "@/components/auth/auth-shell";
import { withLocalePath } from "@/lib/locale-path";
import type { AppLocale } from "@/i18n/routing";

export function GoogleButton({
  nextPath = "/profile",
  label = "使用 Google 登入",
}: {
  nextPath?: string;
  label?: string;
}) {
  const locale = useLocale() as AppLocale;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const localizedNext = withLocalePath(nextPath, locale);
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(localizedNext)}`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (authError) {
        setError(translateAuthError(authError.message));
        setLoading(false);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google 登入失敗");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={signIn} disabled={loading} className={authPrimaryClass}>
        {loading ? "正在前往 Google…" : label}
      </button>
      {error ? <p className="mt-3 text-sm text-line">{error}</p> : null}
    </div>
  );
}
