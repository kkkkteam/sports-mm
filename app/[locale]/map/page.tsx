import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPageClient } from "@/components/map/map-page-client";
import { toGameMapPoints } from "@/lib/map-games";
import { getSessionUser } from "@/lib/profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mapPage");
  return { title: `${t("title")}｜Sports Map & Match` };
}

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { supabase } = await getSessionUser();
  let games = toGameMapPoints([]);

  if (supabase) {
    const { data } = await supabase
      .from("games")
      .select(
        "id, title, venue_label, starts_at, ends_at, lat, lng, district, sports(name_zh, name_en)",
      )
      .in("status", ["open", "full"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true });

    games = toGameMapPoints(data ?? []);
  }

  return <MapPageClient games={games} />;
}
