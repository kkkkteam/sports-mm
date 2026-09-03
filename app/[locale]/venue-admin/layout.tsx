import { setRequestLocale } from "next-intl/server";
import { VenueAdminShell } from "@/components/venue-admin/venue-admin-shell";
import { requireVenueOwner } from "@/lib/venue-owner";
import { redirect } from "@/lib/redirect";

export const dynamic = "force-dynamic";

export default async function VenueAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const gate = await requireVenueOwner();
  if (!gate.ok) {
    if (gate.reason === "unauthenticated") {
      return await redirect("/login?next=/venue-admin");
    }
    return await redirect("/");
  }

  return (
    <VenueAdminShell nickname={gate.profile.nickname}>{children}</VenueAdminShell>
  );
}
