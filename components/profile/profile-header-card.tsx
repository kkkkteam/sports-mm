"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { ProfileEditDrawer } from "@/components/profile/profile-edit-drawer";
import {
  GENDER_LABELS,
  HK_DISTRICT_LABELS,
  type HkDistrict,
  type Profile,
} from "@/types/database";

export function ProfileHeaderCard({
  profile,
  onProfileUpdate,
}: {
  profile: Profile;
  onProfileUpdate: (next: Profile) => void;
}) {
  const t = useTranslations("profile");
  const [editOpen, setEditOpen] = useState(false);

  const districtLabel =
    profile.district != null
      ? HK_DISTRICT_LABELS[profile.district as HkDistrict]
      : null;

  return (
    <>
      <section className="rounded-2xl border border-line-subtle bg-card p-5 shadow-sm ring-1 ring-line-subtle/50">
        <div className="flex items-start gap-4">
          <ProfileAvatar
            nickname={profile.nickname}
            avatarUrl={profile.avatar_url}
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-black tracking-tight text-foreground">
              {profile.nickname}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {profile.gender ? (
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {GENDER_LABELS[profile.gender]}
                </span>
              ) : null}
              {districtLabel ? (
                <span className="inline-flex rounded-full border border-primary/20 bg-background px-2.5 py-0.5 text-xs font-medium text-muted">
                  📍 {districtLabel}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {profile.bio?.trim() ? profile.bio : t("bioEmpty")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="mt-4 rounded-full border border-line-subtle bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
        >
          {t("editProfile")}
        </button>
      </section>

      <ProfileEditDrawer
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSaved={onProfileUpdate}
      />
    </>
  );
}
