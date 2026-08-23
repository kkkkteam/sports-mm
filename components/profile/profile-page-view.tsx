"use client";

import { useState } from "react";
import { ProfileHeaderCard } from "@/components/profile/profile-header-card";
import { ProfilePaymentMethodsSection } from "@/components/profile/profile-payment-methods-section";
import { ProfileSettingsSection } from "@/components/profile/profile-settings-section";
import { ProfileSportSkills } from "@/components/profile/profile-sport-skills";
import { ProfileStatsGrid } from "@/components/profile/profile-stats-grid";
import type { SkillLevel, Profile, Sport } from "@/types/database";

export function ProfilePageView({
  profile,
  sports,
  skills,
}: {
  profile: Profile;
  sports: Sport[];
  skills: Record<string, SkillLevel>;
}) {
  const [profileState, setProfileState] = useState(profile);
  const [skillsState, setSkillsState] = useState(skills);

  return (
    <div className="px-4 pb-28 pt-4 md:px-6">
      <ProfileHeaderCard
        profile={profileState}
        onProfileUpdate={setProfileState}
      />
      <ProfileStatsGrid profile={profileState} />
      <ProfileSportSkills
        userId={profileState.id}
        sports={sports}
        skills={skillsState}
        onSkillsChange={setSkillsState}
      />
      <ProfilePaymentMethodsSection
        profile={profileState}
        onProfileUpdate={setProfileState}
      />
      <ProfileSettingsSection
        profile={profileState}
        onProfileUpdate={setProfileState}
      />
    </div>
  );
}
