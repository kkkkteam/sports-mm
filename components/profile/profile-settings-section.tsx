"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const PROFILE_THEMES = ["light", "morandi", "dark", "high-contrast"] as const;

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line-subtle py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative h-7 w-12 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-line-subtle",
        disabled ? "opacity-50" : "",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

export function ProfileSettingsSection({
  profile,
  onProfileUpdate,
}: {
  profile: Profile;
  onProfileUpdate: (next: Profile) => void;
}) {
  const t = useTranslations("profile");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const [phoneVisible, setPhoneVisible] = useState(
    profile.phone_visible_after_join,
  );
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  async function updatePhoneVisibility(next: boolean) {
    setPrivacyError(null);
    setPhoneVisible(next);
    setSavingPrivacy(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .update({ phone_visible_after_join: next })
        .eq("id", profile.id)
        .select("*")
        .single();

      if (error) {
        setPhoneVisible(profile.phone_visible_after_join);
        setPrivacyError(error.message);
        return;
      }

      onProfileUpdate(data as Profile);
    } finally {
      setSavingPrivacy(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-line-subtle bg-card p-5 shadow-sm">
      <h2 className="text-base font-bold text-foreground">{t("settingsTitle")}</h2>
      <p className="mt-1 text-sm text-muted">{t("settingsHint")}</p>

      <div className="mt-2">
        <SettingsRow label={t("theme")} description={t("themeHint")}>
          <ThemeSwitcher compact themes={[...PROFILE_THEMES]} />
        </SettingsRow>

        <SettingsRow label={tNav("language")} description={t("languageHint")}>
          <LanguageSwitcher variant="light" />
        </SettingsRow>

        <SettingsRow
          label={t("phonePrivacy")}
          description={t("phonePrivacyHint")}
        >
          <ToggleSwitch
            checked={phoneVisible}
            disabled={savingPrivacy}
            onChange={updatePhoneVisibility}
            label={t("phonePrivacy")}
          />
        </SettingsRow>

        {privacyError ? (
          <p className="pt-2 text-sm text-red-600">{privacyError}</p>
        ) : null}

        <div className="pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
          >
            {signingOut ? t("signingOut") : tNav("logout")}
          </button>
        </div>
      </div>
    </section>
  );
}
