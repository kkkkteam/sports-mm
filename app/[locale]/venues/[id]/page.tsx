import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VenueDetailView } from "@/components/venues/venue-detail-view";
import { createClient } from "@/lib/supabase/server";
import type { PrivateVenue } from "@/types/database";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("private_venues")
    .select("name")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  return {
    title: data?.name
      ? `${data.name}｜Sports Map & Match`
      : `Venue｜Sports Map & Match`,
  };
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("private_venues")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const venue = data as PrivateVenue;

  return <VenueDetailView venue={venue} />;
}
