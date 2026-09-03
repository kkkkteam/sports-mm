import type { Metadata } from "next";
import { Suspense } from "react";
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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") qs.set(key, value);
  }
  const nextPath = qs.toString() ? `/games/new?${qs.toString()}` : "/games/new";

  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) {
    return await redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const [profile, sportsResult] = await Promise.all([
    getOrCreateProfile(user),
    supabase.from("sports").select("*").eq("is_active", true).order("name_zh"),
  ]);

  const sports = filterActiveSports((sportsResult.data ?? []) as Sport[]);

  return (
    <Suspense
      fallback={
        <p className="px-4 py-8 text-sm text-muted">Loading…</p>
      }
    >
      <HostGameWizard
        sports={sports}
        userId={user.id}
        defaultDistrict={profile.district}
      />
    </Suspense>
  );
}
