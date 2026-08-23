import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/lib/redirect";
import { HostGameWizard } from "@/components/host/host-game-wizard";
import { getOrCreateProfile, getSessionUser } from "@/lib/profile";
import { filterActiveSports } from "@/lib/sports";
import type { Sport } from "@/types/database";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hostGame");
  return { title: `${t("pageTitle")}｜Sports Map & Match` };
}

export default async function CreateGamePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) {
    return await redirect("/login?next=/games/new");
  }

  const [profile, sportsResult] = await Promise.all([
    getOrCreateProfile(user),
    supabase.from("sports").select("*").eq("is_active", true).order("name_zh"),
  ]);

  const sports = filterActiveSports((sportsResult.data ?? []) as Sport[]);

  return (
    <HostGameWizard
      sports={sports}
      userId={user.id}
      defaultDistrict={profile.district}
    />
  );
}
