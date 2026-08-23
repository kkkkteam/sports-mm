"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  parseProfilePaymentMethods,
  PROFILE_PAYMENT_METHOD_OPTIONS,
  serializeProfilePaymentMethods,
  type ProfilePaymentMethodSlug,
} from "@/lib/profile-payment-methods";
import type { Profile } from "@/types/database";

export function ProfilePaymentMethodsSection({
  profile,
  onProfileUpdate,
}: {
  profile: Profile;
  onProfileUpdate: (next: Profile) => void;
}) {
  const t = useTranslations("profile");
  const parsed = parseProfilePaymentMethods(profile.accepted_payment_methods);
  const [methods, setMethods] = useState(parsed.methods);
  const [other, setOther] = useState(parsed.other);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otherDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ methods: parsed.methods, other: parsed.other });

  useEffect(() => {
    latestRef.current = { methods, other };
  }, [methods, other]);

  useEffect(() => {
    const nextParsed = parseProfilePaymentMethods(profile.accepted_payment_methods);
    setMethods(nextParsed.methods);
    setOther(nextParsed.other);
  }, [profile.accepted_payment_methods]);

  useEffect(() => {
    return () => {
      if (otherDebounceRef.current) clearTimeout(otherDebounceRef.current);
    };
  }, []);

  async function persist(
    nextMethods: Record<ProfilePaymentMethodSlug, boolean>,
    nextOther: string,
  ) {
    setError(null);
    setSaving(true);

    const previousMethods = latestRef.current.methods;
    const previousOther = latestRef.current.other;
    const serialized = serializeProfilePaymentMethods(nextMethods, nextOther);

    try {
      const supabase = createClient();
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ accepted_payment_methods: serialized })
        .eq("id", profile.id)
        .select("*")
        .single();

      if (updateError) {
        setMethods(previousMethods);
        setOther(previousOther);
        setError(updateError.message);
        return;
      }

      onProfileUpdate(data as Profile);
    } finally {
      setSaving(false);
    }
  }

  function toggleMethod(slug: ProfilePaymentMethodSlug) {
    const nextMethods = { ...methods, [slug]: !methods[slug] };
    setMethods(nextMethods);
    void persist(nextMethods, other);
  }

  function handleOtherChange(value: string) {
    setOther(value);
    if (otherDebounceRef.current) clearTimeout(otherDebounceRef.current);
    otherDebounceRef.current = setTimeout(() => {
      void persist(methods, value);
    }, 450);
  }

  return (
    <section className="mt-8 rounded-2xl border border-line-subtle bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {t("paymentMethodsTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("paymentMethodsHint")}</p>
        </div>
        {saving ? (
          <span className="shrink-0 text-xs font-medium text-muted">
            {t("paymentMethodsSaving")}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {PROFILE_PAYMENT_METHOD_OPTIONS.map((slug) => {
          const checked = methods[slug];
          return (
            <label
              key={slug}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
                checked
                  ? "border-primary/35 bg-primary/8 ring-1 ring-primary/15"
                  : "border-line-subtle bg-canvas hover:bg-mist",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={saving}
                onChange={() => toggleMethod(slug)}
                className="h-4 w-4 shrink-0 accent-primary"
              />
              <span className="text-sm font-medium text-foreground">
                {t(`paymentMethod_${slug}`)}
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-4">
        <label
          htmlFor="profile-payment-other"
          className="text-sm font-semibold text-foreground"
        >
          {t("paymentMethodOtherLabel")}
        </label>
        <input
          id="profile-payment-other"
          type="text"
          value={other}
          maxLength={80}
          disabled={saving}
          onChange={(event) => handleOtherChange(event.target.value)}
          placeholder={t("paymentMethodOtherPlaceholder")}
          className="mt-2 min-h-11 w-full rounded-xl border border-line-subtle bg-canvas px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
        />
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
