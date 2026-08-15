import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { redirect } from "@/lib/redirect";
import { AppNav } from "@/components/app-nav";
import { ApplicationActions } from "@/components/host/application-actions";
import { PaymentProofLink } from "@/components/games/payment-proof-link";
import { ReputationBadge } from "@/components/reputation/reputation-badge";
import { formatHkDateTime } from "@/lib/format";
import { getOrCreateProfile, getSessionUser } from "@/lib/profile";
import {
  APPLICATION_STATUS_LABELS,
  type Application,
  type ApplicationStatus,
  type Game,
  type Profile,
  type Sport,
} from "@/types/database";

export const metadata: Metadata = {
  title: "審批｜Sports Map & Match 拼場",
};

export const dynamic = "force-dynamic";

type HostGame = Game & {
  sports: Pick<Sport, "name_zh"> | null;
};

type HostApplication = Application & {
  profiles: Pick<
    Profile,
    "nickname" | "rating" | "rating_count" | "attendance_rate"
  > | null;
  games: Pick<Game, "id" | "title" | "host_id"> | null;
};

export default async function HostDashboardPage() {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) {
    return await redirect("/login?next=/host");
  }

  const profile = await getOrCreateProfile(user);

  const [{ data: gamesData }, { data: applicationsData }] = await Promise.all([
    supabase
      .from("games")
      .select("*, sports(name_zh)")
      .eq("host_id", user.id)
      .order("starts_at", { ascending: false }),
    supabase
      .from("applications")
      .select(
        "*, profiles!applicant_id(nickname, rating, rating_count, attendance_rate), games!inner(id, title, host_id)",
      )
      .eq("games.host_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const games = (gamesData ?? []) as HostGame[];
  const applications = (applicationsData ?? []) as HostApplication[];
  const pending = applications.filter((item) => item.status === "pending");
  const waitlisted = applications
    .filter((item) => item.status === "waitlisted")
    .slice()
    .sort((a, b) => {
      const aTime = a.waitlisted_at ?? a.created_at;
      const bTime = b.waitlisted_at ?? b.created_at;
      return aTime.localeCompare(bTime);
    });

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <AppNav nickname={profile.nickname} active="host" />
      <div className="px-5 pb-20 pt-6 md:px-12">
        <p className="font-display text-sm tracking-[0.22em] text-court">HOST DESK</p>
        <h1 className="mt-2 text-[clamp(2.8rem,9vw,5.5rem)] font-black leading-none tracking-tight">
          審批
        </h1>
        <p className="mt-3 max-w-xl text-base text-ink/70">
          審批申請、管理名單與候補。有人退出時，首位候補會自動轉成待審批。
        </p>

        <section className="mt-12 md:mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-black md:text-3xl">待審批申請</h2>
            <span className="font-display text-4xl text-court">{pending.length}</span>
          </div>

          {pending.length === 0 ? (
            <p className="mt-6 text-ink/60">暫時沒有待處理申請。</p>
          ) : (
            <ul className="mt-6 divide-y divide-ink/15 border-y border-ink/15">
              {pending.map((application) => (
                <li
                  key={application.id}
                  className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-lg font-black">
                      {application.profiles?.nickname ?? "會員"}
                    </p>
                    {application.profiles ? (
                      <div className="mt-1">
                        <ReputationBadge
                          size="sm"
                          rating={application.profiles.rating}
                          ratingCount={application.profiles.rating_count}
                          attendanceRate={application.profiles.attendance_rate}
                        />
                      </div>
                    ) : null}
                    <p className="mt-1 text-sm text-ink/65">
                      申請加入{" "}
                      <Link
                        href={`/games/${application.game_id}`}
                        className="font-medium text-court hover:underline"
                      >
                        {application.games?.title ?? "場次"}
                      </Link>
                    </p>
                    {application.message ? (
                      <p className="mt-2 max-w-xl text-sm text-ink/70">
                        「{application.message}」
                      </p>
                    ) : null}
                    <div className="mt-2">
                      <PaymentProofLink path={application.payment_proof_url} />
                    </div>
                  </div>
                  <ApplicationActions
                    applicationId={application.id}
                    currentStatus={application.status as ApplicationStatus}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-black md:text-3xl">候補名單</h2>
            <span className="font-display text-4xl text-court">{waitlisted.length}</span>
          </div>
          {waitlisted.length === 0 ? (
            <p className="mt-6 text-ink/60">暫時沒有候補。</p>
          ) : (
            <ul className="mt-6 divide-y divide-ink/15 border-y border-ink/15">
              {waitlisted.map((application, index) => (
                <li
                  key={application.id}
                  className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-lg font-black">
                      #{index + 1} {application.profiles?.nickname ?? "會員"}
                    </p>
                    <p className="mt-1 text-sm text-ink/65">
                      候補{" "}
                      <Link
                        href={`/games/${application.game_id}`}
                        className="font-medium text-court hover:underline"
                      >
                        {application.games?.title ?? "場次"}
                      </Link>
                    </p>
                  </div>
                  <ApplicationActions
                    applicationId={application.id}
                    currentStatus={application.status as ApplicationStatus}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-black md:text-3xl">我的放場</h2>
            <Link
              href="/games/new"
              className="text-sm font-bold text-court hover:underline"
            >
              ＋ 發佈新場
            </Link>
          </div>

          {games.length === 0 ? (
            <p className="mt-6 text-ink/60">你尚未發佈任何場次。</p>
          ) : (
            <ul className="mt-6 divide-y divide-ink/15 border-y border-ink/15">
              {games.map((game) => {
                const gameApps = applications.filter((item) => item.game_id === game.id);
                const pendingCount = gameApps.filter((item) => item.status === "pending").length;
                return (
                  <li key={game.id} className="py-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <Link
                          href={`/games/${game.id}`}
                          className="text-xl font-black tracking-tight hover:text-court"
                        >
                          {game.title}
                        </Link>
                        <p className="mt-1 text-sm text-ink/60">
                          {game.sports?.name_zh} · {formatHkDateTime(game.starts_at)} ·{" "}
                          {game.current_players}/{game.max_players} 人
                          {pendingCount > 0 ? ` · ${pendingCount} 待審批` : ""}
                        </p>
                      </div>
                      <Link
                        href={`/games/${game.id}`}
                        className="text-sm font-medium text-ink/55 hover:text-court"
                      >
                        查看詳情
                      </Link>
                    </div>

                    {gameApps.length > 0 ? (
                      <ul className="mt-4 space-y-3 border-l-2 border-line pl-4">
                        {gameApps.map((application) => (
                          <li
                            key={application.id}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm">
                                <span className="font-bold">
                                  {application.profiles?.nickname ?? "會員"}
                                </span>
                                <span className="mx-2 text-ink/35">·</span>
                                <span className="text-ink/60">
                                  {
                                    APPLICATION_STATUS_LABELS[
                                      application.status as ApplicationStatus
                                    ]
                                  }
                                </span>
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-3">
                                {application.profiles ? (
                                  <ReputationBadge
                                    size="sm"
                                    rating={application.profiles.rating}
                                    ratingCount={application.profiles.rating_count}
                                    attendanceRate={application.profiles.attendance_rate}
                                  />
                                ) : null}
                                <PaymentProofLink path={application.payment_proof_url} />
                              </div>
                            </div>
                            <ApplicationActions
                              applicationId={application.id}
                              currentStatus={application.status as ApplicationStatus}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
