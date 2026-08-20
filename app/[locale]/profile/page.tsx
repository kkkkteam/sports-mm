import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { redirect } from "@/lib/redirect";
import { AppNav } from "@/components/app-nav";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { ReputationBadge } from "@/components/reputation/reputation-badge";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getOrCreateProfile, getSessionUser } from "@/lib/profile";
import type { SkillLevel, Sport, UserSportSkill } from "@/types/database";

export const metadata: Metadata = {
  title: "會員檔案｜Sports Map & Match 拼場",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { supabase, user } = await getSessionUser();

  if (!supabase || !user) {
    return await redirect("/login?next=/profile");
  }

  const [profile, sportsResult, skillsResult] = await Promise.all([
    getOrCreateProfile(user),
    supabase.from("sports").select("*").eq("is_active", true).order("name_zh"),
    supabase.from("user_sport_skills").select("*").eq("user_id", user.id),
  ]);

  const sports = (sportsResult.data ?? []) as Sport[];
  const skillRows = (skillsResult.data ?? []) as UserSportSkill[];
  const skills = Object.fromEntries(
    skillRows.map((row) => [row.sport_id, row.level]),
  ) as Record<string, SkillLevel>;

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <AppNav nickname={profile.nickname} active="profile" />

      <div className="px-5 pb-20 pt-6 md:px-12">
        <p className="text-[clamp(3rem,10vw,6.5rem)] font-black leading-none tracking-tight">
          檔案
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            {profile.nickname}
          </h1>
          <ReputationBadge
            rating={profile.rating}
            ratingCount={profile.rating_count}
            attendanceRate={profile.attendance_rate}
          />
        </div>

        <section className="mt-12 grid gap-10 border-y border-ink/15 py-10 md:mt-16 md:grid-cols-2 md:gap-16">
          <div>
            <p className="font-display text-sm tracking-[0.22em] text-court">DASHBOARD</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">戰績</h2>
            <p className="mt-3 max-w-sm text-base text-ink/70">
              已發佈的場次，以及你成功加入的局。
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/games/new" className="text-sm font-bold text-court hover:underline">
                去放場 →
              </Link>
              <Link href="/host" className="text-sm font-bold text-court hover:underline">
                審批申請 →
              </Link>
              <Link href="/games" className="text-sm font-bold text-court hover:underline">
                搵場 →
              </Link>
              <Link href="/friends" className="text-sm font-bold text-court hover:underline">
                好友 →
              </Link>
              <Link href="/chat" className="text-sm font-bold text-court hover:underline">
                聊天 →
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-ink/60">成功放場</dt>
              <dd className="mt-2 font-display text-6xl leading-none text-court md:text-7xl">
                {profile.games_hosted_count}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-ink/60">成功拼場</dt>
              <dd className="mt-2 font-display text-6xl leading-none text-court md:text-7xl">
                {profile.games_joined_count}
              </dd>
            </div>
          </dl>
        </section>

        <div className="mt-10 rounded-2xl border border-line-subtle bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">外觀設定</h2>
          <p className="mt-1 text-sm text-muted">切換淺色、暗色或高對比模式。</p>
          <div className="mt-4">
            <ThemeSwitcher />
          </div>
        </div>

        <div className="mt-14 md:mt-20">
          <ProfileEditor profile={profile} sports={sports} skills={skills} />
        </div>
      </div>
    </main>
  );
}
