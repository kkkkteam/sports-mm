import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AppNav } from "@/components/app-nav";
import { GameGrid } from "@/components/games/game-card";
import type { GameListRow } from "@/components/games/game-list-item";
import { GamesFilters } from "@/components/games/games-filters";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getSessionUser } from "@/lib/profile";
import type { HkDistrict, Sport } from "@/types/database";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "games" });
  return { title: `${t("findTitle")}｜Sports Map & Match` };
}

export default async function GamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    sport?: string;
    district?: string;
    date?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("games");
  const tNav = await getTranslations("nav");
  const queryParams = await searchParams;
  const { supabase, user } = await getSessionUser();

  let nickname: string | null = null;
  let sports: Sport[] = [];
  let games: GameListRow[] = [];

  if (supabase) {
    const sportsResult = await supabase
      .from("sports")
      .select("*")
      .eq("is_active", true)
      .order("name_zh");
    sports = (sportsResult.data ?? []) as Sport[];

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .maybeSingle();
      nickname = profile?.nickname ?? null;
    }

    let query = supabase
      .from("games")
      .select("*, sports(name_zh, name_en, slug), profiles!host_id(nickname)")
      .in("status", ["open", "full"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true });

    if (queryParams.sport) query = query.eq("sport_id", queryParams.sport);
    if (queryParams.district) {
      query = query.eq("district", queryParams.district as HkDistrict);
    }
    if (queryParams.q?.trim()) {
      const q = queryParams.q.trim();
      query = query.or(`title.ilike.%${q}%,venue_label.ilike.%${q}%`);
    }
    if (queryParams.date) {
      query = query
        .gte("starts_at", `${queryParams.date}T00:00:00+08:00`)
        .lte("starts_at", `${queryParams.date}T23:59:59.999+08:00`);
    }

    const gamesResult = await query;
    games = (gamesResult.data ?? []) as GameListRow[];
  }

  return (
    <main className="min-h-dvh bg-paper text-ink">
      {user ? (
        <AppNav nickname={nickname} active="games" />
      ) : (
        <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-12">
          <Link href="/" className="font-display text-xl tracking-wide text-court md:text-2xl">
            SPORTS MAP & MATCH
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-medium hover:text-court">
              {tNav("login")}
            </Link>
          </div>
        </header>
      )}

      <div className="px-5 pb-20 md:px-12">
        <div className="flex flex-col gap-4 pt-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-sm tracking-[0.22em] text-court">FIND</p>
            <h1 className="mt-2 text-[clamp(2.8rem,9vw,5.5rem)] font-black leading-none tracking-tight">
              {t("findTitle")}
            </h1>
            <p className="mt-3 max-w-xl text-base text-ink/70">{t("findLede")}</p>
          </div>
          <Link
            href={user ? "/games/new" : "/login"}
            className="inline-flex min-h-11 items-center justify-center bg-ink px-6 text-sm font-bold text-paper transition-colors hover:bg-court"
          >
            {t("hostCta")}
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="border-y border-ink/15 py-8 text-sm text-ink/50">
              {t("filter")}…
            </div>
          }
        >
          <GamesFilters sports={sports} />
        </Suspense>

        <section className="mt-8">
          <GameGrid games={games} />
        </section>
      </div>
    </main>
  );
}
