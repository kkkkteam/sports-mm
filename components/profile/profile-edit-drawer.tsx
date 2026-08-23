"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GENDER_LABELS,
  HK_DISTRICT_OPTIONS,
  type Gender,
  type HkDistrict,
  type Profile,
} from "@/types/database";

const genders = Object.keys(GENDER_LABELS) as Gender[];

export function ProfileEditDrawer({
  open,
  profile,
  onClose,
  onSaved,
}: {
  open: boolean;
  profile: Profile;
  onClose: () => void;
  onSaved: (next: Profile) => void;
}) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const titleId = useId();

  const [nickname, setNickname] = useState(profile.nickname);
  const [gender, setGender] = useState<Gender | null>(profile.gender);
  const [district, setDistrict] = useState<HkDistrict | "">(
    profile.district ?? "",
  );
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNickname(profile.nickname);
    setGender(profile.gender);
    setDistrict(profile.district ?? "");
    setBio(profile.bio ?? "");
    setError(null);
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const name = nickname.trim();
    if (name.length < 1 || name.length > 24) {
      setError(t("nicknameError"));
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        nickname: name,
        gender,
        district: district || null,
        bio: bio.trim() || null,
      };

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", profile.id)
        .select("*")
        .single();

      if (updateError) {
        setError(updateError.message);
        return;
      }

      onSaved(data as Profile);
      onClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={tCommon("cancel")}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-line-subtle bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-lg font-bold text-foreground">
            {t("editProfile")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-mist"
            aria-label={tCommon("cancel")}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="profile-edit-nickname"
              className="text-sm font-semibold text-muted"
            >
              {t("nickname")}
            </label>
            <input
              id="profile-edit-nickname"
              maxLength={24}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line-subtle bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-muted">{t("gender")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {genders.map((value) => {
                const selected = gender === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGender(value)}
                    className={[
                      "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "border border-line-subtle bg-background text-foreground hover:bg-mist",
                    ].join(" ")}
                  >
                    {GENDER_LABELS[value]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-edit-district"
              className="text-sm font-semibold text-muted"
            >
              {t("district")}
            </label>
            <select
              id="profile-edit-district"
              value={district}
              onChange={(event) =>
                setDistrict(event.target.value as HkDistrict | "")
              }
              className="mt-1.5 w-full rounded-xl border border-line-subtle bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">{t("districtUnset")}</option>
              {HK_DISTRICT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="profile-edit-bio"
              className="text-sm font-semibold text-muted"
            >
              {t("bio")}
            </label>
            <textarea
              id="profile-edit-bio"
              rows={4}
              maxLength={280}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder={t("bioPlaceholder")}
              className="mt-1.5 w-full resize-none rounded-xl border border-line-subtle bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-line-subtle px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-mist"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? tCommon("loading") : tCommon("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
