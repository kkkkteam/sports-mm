import { setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "@/lib/redirect";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const admin = await requireAdmin();
  if (!admin.ok) {
    if (admin.reason === "unauthenticated") {
      return await redirect("/login?next=/admin-manage");
    }
    // Logged in but not admin (or check failed)
    return await redirect("/?error=admin");
  }

  return <AdminShell nickname={admin.profile.nickname}>{children}</AdminShell>;
}
