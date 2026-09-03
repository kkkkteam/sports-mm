import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VenuesDirectoryView } from "@/components/venues/venues-directory-view";
import { createClient } from "@/lib/supabase/server";
import type { PrivateVenue } from "@/types/database";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "venuesPage" });
  return { title: `${t("title")}｜Sports Map & Match` };
}

export default async function VenuesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("private_venues")
    .select("id, name, description, sport_types, district, address, images")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const venues = (data ?? []) as Pick<
    PrivateVenue,
    | "id"
    | "name"
    | "description"
    | "sport_types"
    | "district"
    | "address"
    | "images"
  >[];

  if (error) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-semibold text-red-600">{error.message}</p>
      </div>
    );
  }

  return <VenuesDirectoryView venues={venues} />;
}
