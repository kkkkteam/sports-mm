import type { Metadata } from "next";
import { redirect } from "@/lib/redirect";
import { AppNav } from "@/components/app-nav";
import { CreateGameForm } from "@/components/games/create-game-form";
import { getOrCreateProfile, getSessionUser } from "@/lib/profile";
import { filterActiveSports } from "@/lib/sports";
import type { Sport } from "@/types/database";

export const metadata: Metadata = {
  title: "放場｜Sports Map & Match 拼場",
};

export const dynamic = "force-dynamic";

export default async function CreateGamePage() {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) {
    return await redirect("/login?next=/games/new");
  }

  const [profile, sportsResult] = await Promise.all([
    getOrCreateProfile(user),
    supabase.from("sports").select("*").eq("is_active", true).order("name_zh"),
  ]);

  const sports = filterActiveSports((sportsResult.data ?? []) as Sport[]);

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <AppNav nickname={profile.nickname} active="new" />
      <div className="px-5 pb-20 pt-6 md:px-12">
        <p className="font-display text-sm tracking-[0.22em] text-court">HOST</p>
        <h1 className="mt-2 text-[clamp(2.8rem,9vw,5.5rem)] font-black leading-none tracking-tight">
          放場
        </h1>
        <p className="mt-3 max-w-xl text-base text-ink/70">
          發佈你已預訂的場地，等人申請加入並分擔費用。
        </p>
        <div className="mt-10 md:mt-14">
          <CreateGameForm
            sports={sports}
            userId={user.id}
            defaultDistrict={profile.district}
          />
        </div>
      </div>
    </main>
  );
}
