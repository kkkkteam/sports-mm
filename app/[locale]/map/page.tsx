import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "地圖｜Sports Map & Match",
};

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <main className="flex min-h-full flex-col bg-canvas px-5 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        {t("map")}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        地圖模式
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        地圖檢視即將推出。現可先用列表瀏覽場次。
      </p>
      <Link
        href="/games"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow-sm transition-opacity hover:opacity-90"
      >
        返回場次列表
      </Link>
    </main>
  );
}
