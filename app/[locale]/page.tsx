import { setRequestLocale } from "next-intl/server";
import { Actions } from "@/components/landing/actions";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { SiteFooter } from "@/components/landing/site-footer";
import { SportTicker } from "@/components/landing/sport-ticker";
import { Sports } from "@/components/landing/sports";
import { getOrCreateProfile, getSessionUser } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let isAuthed = false;
  let nickname: string | null = null;

  try {
    const { user } = await getSessionUser();
    isAuthed = Boolean(user);
    if (user) {
      const profile = await getOrCreateProfile(user);
      nickname = profile.nickname;
    }
  } catch {
    isAuthed = false;
  }

  return (
    <main>
      <Hero isAuthed={isAuthed} nickname={nickname} />
      <Problem />
      <SportTicker />
      <Actions
        hostHref={isAuthed ? "/games/new" : "/login?next=/games/new"}
        joinHref="/games"
      />
      <Sports />
      <SiteFooter isAuthed={isAuthed} />
    </main>
  );
}
