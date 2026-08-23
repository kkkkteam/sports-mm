import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfilePageView } from "@/components/profile/profile-page-view";
import { redirect } from "@/lib/redirect";
import { getOrCreateProfile, getSessionUser } from "@/lib/profile";
import { filterActiveSports } from "@/lib/sports";
import type { SkillLevel, Sport, UserSportSkill } from "@/types/database";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");
  return { title: `${t("pageTitle")}｜Sports Map & Match` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { supabase, user } = await getSessionUser();

  if (!supabase || !user) {
    return await redirect("/login?next=/profile");
  }

  const [profile, sportsResult, skillsResult] = await Promise.all([
    getOrCreateProfile(user),
    supabase.from("sports").select("*").eq("is_active", true).order("name_zh"),
    supabase.from("user_sport_skills").select("*").eq("user_id", user.id),
  ]);

  const sports = filterActiveSports((sportsResult.data ?? []) as Sport[]);
  const skillRows = (skillsResult.data ?? []) as UserSportSkill[];
  const skills = Object.fromEntries(
    skillRows.map((row) => [row.sport_id, row.level]),
  ) as Record<string, SkillLevel>;

  return (
    <ProfilePageView profile={profile} sports={sports} skills={skills} />
  );
}
