import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  GamesListView,
  type GamesTab,
} from "@/components/games/games-list-view";
import type { GameListRow } from "@/components/games/game-list-item";
import { AppNav } from "@/components/app-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getSessionUser } from "@/lib/profile";
import { filterActiveSports } from "@/lib/sports";
import type { Sport } from "@/types/database";

export const dynamic = "force-dynamic";

const VALID_TABS = new Set<GamesTab>(["discover", "hosting", "joined"]);

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
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const queryParams = await searchParams;
  const tab: GamesTab = VALID_TABS.has(queryParams.tab as GamesTab)
    ? (queryParams.tab as GamesTab)
    : "discover";

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
    sports = filterActiveSports((sportsResult.data ?? []) as Sport[]);

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .maybeSingle();
      nickname = profile?.nickname ?? null;
    }

    const gameSelect =
      "*, sports(name_zh, name_en, slug), profiles!host_id(nickname)";

    if (tab === "hosting" && user) {
      const { data } = await supabase
        .from("games")
        .select(gameSelect)
        .eq("host_id", user.id)
        .in("status", ["open", "full"])
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true });
      games = (data ?? []) as GameListRow[];
    } else if (tab === "joined" && user) {
      const { data: joinedRows } = await supabase
        .from("game_participants")
        .select("game_id")
        .eq("user_id", user.id);

      const joinedIds = (joinedRows ?? []).map((row) => row.game_id);

      if (joinedIds.length > 0) {
        const { data } = await supabase
          .from("games")
          .select(gameSelect)
          .in("id", joinedIds)
          .neq("host_id", user.id)
          .in("status", ["open", "full"])
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true });
        games = (data ?? []) as GameListRow[];
      }
    } else {
      const { data } = await supabase
        .from("games")
        .select(gameSelect)
        .in("status", ["open", "full"])
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true });
      games = (data ?? []) as GameListRow[];
    }
  }

  return (
    <div className="min-h-full bg-canvas text-ink">
      {user ? (
        <AppNav nickname={nickname} active="games" />
      ) : (
        <header className="flex items-center justify-between gap-4 border-b border-line-subtle px-4 py-3">
          <Link
            href="/"
            className="truncate text-sm font-bold tracking-tight text-ink"
          >
            Sports Map & Match
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher variant="light" />
            <Link
              href="/login"
              className="rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink"
            >
              {tNav("login")}
            </Link>
          </div>
        </header>
      )}

      <GamesListView
        games={games}
        sports={sports}
        tab={tab}
        isAuthed={Boolean(user)}
      />
    </div>
  );
}
