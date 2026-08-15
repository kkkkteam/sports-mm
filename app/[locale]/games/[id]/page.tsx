import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { ApplyButton } from "@/components/games/apply-button";
import { AttendancePanel } from "@/components/games/attendance-panel";
import { CompleteGameButton } from "@/components/games/complete-game-button";
import { ReviewPanel } from "@/components/games/review-panel";
import { ReputationBadge } from "@/components/reputation/reputation-badge";
import {
  formatHkDateTime,
  formatHkd,
  gameCostPerPerson,
} from "@/lib/format";
import { getSessionUser } from "@/lib/profile";
import {
  GAME_STATUS_LABELS,
  HK_DISTRICT_LABELS,
  type Application,
  type AttendanceStatus,
  type Game,
  type GameStatus,
  type HkDistrict,
  type Profile,
  type Review,
  type Sport,
} from "@/types/database";

export const dynamic = "force-dynamic";

type GameDetail = Game & {
  sports: Pick<Sport, "name_zh" | "name_en"> | null;
  profiles: Pick<Profile, "nickname" | "id" | "rating" | "rating_count" | "attendance_rate"> | null;
};

type ParticipantRow = {
  user_id: string;
  attendance_status: AttendanceStatus;
  profiles: Pick<Profile, "nickname" | "rating" | "rating_count" | "attendance_rate"> | null;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: `場次詳情｜Sports Map & Match 拼場` };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await getSessionUser();

  if (!supabase) {
    notFound();
  }

  const { data: gameData } = await supabase
    .from("games")
    .select(
      "*, sports(name_zh, name_en), profiles!host_id(id, nickname, rating, rating_count, attendance_rate)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!gameData) {
    notFound();
  }

  const game = gameData as GameDetail;
  const fee = gameCostPerPerson(game);
  const district = game.district as HkDistrict;
  const status = game.status as GameStatus;

  let nickname: string | null = null;
  let myApplication: Application | null = null;
  let isParticipant = false;
  let participants: ParticipantRow[] = [];
  let reviews: (Review & {
    reviewer: Pick<Profile, "nickname"> | null;
    reviewee: Pick<Profile, "nickname"> | null;
  })[] = [];

  const [{ data: participantRows }, { data: reviewRows }] = await Promise.all([
    supabase
      .from("game_participants")
      .select(
        "user_id, attendance_status, profiles(nickname, rating, rating_count, attendance_rate)",
      )
      .eq("game_id", id),
    supabase
      .from("reviews")
      .select(
        "*, reviewer:profiles!reviewer_id(nickname), reviewee:profiles!reviewee_id(nickname)",
      )
      .eq("game_id", id)
      .order("created_at", { ascending: false }),
  ]);

  participants = (participantRows ?? []) as unknown as ParticipantRow[];
  reviews = (reviewRows ?? []) as unknown as typeof reviews;

  if (user) {
    const [{ data: profile }, { data: application }, { data: participant }] =
      await Promise.all([
        supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle(),
        supabase
          .from("applications")
          .select("*")
          .eq("game_id", id)
          .eq("applicant_id", user.id)
          .maybeSingle(),
        supabase
          .from("game_participants")
          .select("user_id")
          .eq("game_id", id)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
    nickname = profile?.nickname ?? null;
    myApplication = (application as Application | null) ?? null;
    isParticipant = Boolean(participant);
  }

  const isHost = user?.id === game.host_id;
  let disabledReason: string | null = null;
  const pendingApplication = myApplication?.status === "pending";
  const waitlistedApplication = myApplication?.status === "waitlisted";
  const editableApplication = pendingApplication || waitlistedApplication;
  const canWithdraw =
    myApplication?.status === "pending" ||
    myApplication?.status === "waitlisted" ||
    myApplication?.status === "accepted";
  const gameIsFull = status === "full" || game.spots_needed <= 0;
  const waitlistMode =
    gameIsFull &&
    !isHost &&
    !isParticipant &&
    !myApplication &&
    status !== "cancelled" &&
    status !== "completed" &&
    new Date(game.starts_at) >= new Date();

  if (isHost) {
    disabledReason = "這是你發佈的場次。";
  } else if (isParticipant || myApplication?.status === "accepted") {
    disabledReason = "你已在名單中。";
  } else if (pendingApplication) {
    disabledReason = "申請審批中，請等待房主回覆。";
  } else if (waitlistedApplication) {
    disabledReason = "你已在候補名單，有空缺時會自動轉為待審批。";
  } else if (myApplication?.status === "rejected") {
    disabledReason = "房主已拒絕此申請。";
  } else if (myApplication?.status === "withdrawn") {
    disabledReason = "你已取消此申請。";
  } else if (status === "cancelled") {
    disabledReason = "此場次已取消。";
  } else if (status === "completed") {
    disabledReason = "此場次已完成。";
  } else if (new Date(game.starts_at) < new Date()) {
    disabledReason = "此場次已開始或已過期。";
  } else if (waitlistMode) {
    disabledReason = null;
  } else if (gameIsFull) {
    disabledReason = "此場次已滿。";
  }

  const nonHostParticipants = participants.filter((row) => row.user_id !== game.host_id);
  const canReview =
    status === "completed" &&
    Boolean(user) &&
    (isHost || isParticipant);
  const reviewTargets = nonHostParticipants
    .filter((row) => row.user_id !== user?.id)
    .map((row) => ({
      user_id: row.user_id,
      nickname: row.profiles?.nickname ?? "會員",
    }));
  const myReviews = reviews.filter((item) => item.reviewer_id === user?.id);

  return (
    <main className="min-h-dvh bg-paper text-ink">
      {user ? (
        <AppNav nickname={nickname} active="games" />
      ) : (
        <header className="flex items-center justify-between px-5 py-5 md:px-12">
          <Link href="/" className="font-display text-xl tracking-wide text-court md:text-2xl">
            SPORTS MAP & MATCH
          </Link>
          <Link href={`/login?next=/games/${id}`} className="text-sm font-medium hover:text-court">
            登入
          </Link>
        </header>
      )}

      <div className="px-5 pb-20 pt-6 md:px-12">
        <Link href="/games" className="text-sm text-ink/55 hover:text-court">
          ← 返回搵場
        </Link>

        <p className="mt-8 text-xs font-bold tracking-wide text-court">
          {game.sports?.name_zh ?? "運動"} · {HK_DISTRICT_LABELS[district]} ·{" "}
          {GAME_STATUS_LABELS[status]}
        </p>
        <h1 className="mt-3 max-w-3xl text-[clamp(2.4rem,7vw,4.5rem)] font-black leading-[1.05] tracking-tight">
          {game.title}
        </h1>

        <dl className="mt-10 grid gap-6 border-y border-ink/15 py-8 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-ink/55">地點</dt>
            <dd className="mt-1 text-lg font-bold">{game.venue_label}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/55">時間</dt>
            <dd className="mt-1 text-lg font-bold">
              {formatHkDateTime(game.starts_at)}
              <span className="mx-2 text-ink/30">→</span>
              {formatHkDateTime(game.ends_at)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink/55">人數</dt>
            <dd className="mt-1 text-lg font-bold">
              {game.current_players}/{game.max_players}（尚欠 {game.spots_needed}）
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink/55">每人費用</dt>
            <dd className="mt-1 text-lg font-bold">{formatHkd(fee)}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/55">場租合計</dt>
            <dd className="mt-1 text-lg font-bold">{formatHkd(Number(game.total_cost_hkd))}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/55">房主</dt>
            <dd className="mt-1 text-lg font-bold">{game.profiles?.nickname ?? "—"}</dd>
            {game.profiles ? (
              <div className="mt-1">
                <ReputationBadge
                  size="sm"
                  rating={game.profiles.rating}
                  ratingCount={game.profiles.rating_count}
                  attendanceRate={game.profiles.attendance_rate}
                />
              </div>
            ) : null}
          </div>
        </dl>

        {game.description ? (
          <section className="mt-10 max-w-2xl">
            <h2 className="text-xl font-black">備註</h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-ink/75">
              {game.description}
            </p>
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="text-xl font-black">申請加入</h2>
          <div className="mt-5 flex flex-col gap-4">
            {isHost ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/host"
                  className="inline-flex min-h-12 items-center bg-ink px-8 text-base font-bold text-paper transition-colors hover:bg-court"
                >
                  前往審批申請
                </Link>
                {game.chat_room_id ? (
                  <Link
                    href={`/chat/${game.chat_room_id}`}
                    className="inline-flex min-h-12 items-center border-2 border-ink/20 px-8 text-base font-bold transition-colors hover:border-ink"
                  >
                    場次群組聊天
                  </Link>
                ) : null}
                {status !== "completed" && status !== "cancelled" ? (
                  <CompleteGameButton gameId={game.id} />
                ) : null}
              </div>
            ) : (
              <>
                <ApplyButton
                  gameId={game.id}
                  userId={user?.id ?? null}
                  disabledReason={disabledReason}
                  mode={waitlistMode ? "waitlist" : "apply"}
                  onWithdraw={canWithdraw}
                  allowProofUpdate={editableApplication}
                  existingApplicationId={myApplication?.id ?? null}
                  existingProofUrl={
                    editableApplication ? myApplication?.payment_proof_url ?? null : null
                  }
                />
                {isParticipant && game.chat_room_id ? (
                  <Link
                    href={`/chat/${game.chat_room_id}`}
                    className="inline-flex min-h-12 w-fit items-center bg-court px-8 text-base font-bold text-paper transition-colors hover:bg-ink"
                  >
                    進入場次群組聊天
                  </Link>
                ) : null}
              </>
            )}
          </div>
        </section>

        {isHost && status === "completed" ? (
          <AttendancePanel gameId={game.id} participants={nonHostParticipants} />
        ) : null}

        {canReview && user ? (
          <ReviewPanel
            gameId={game.id}
            reviewerId={user.id}
            targets={reviewTargets}
            existingReviews={myReviews}
          />
        ) : null}

        {status === "completed" && reviews.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-black">公開評論</h2>
            <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
              {reviews.map((review) => (
                <li key={review.id} className="py-4">
                  <p className="text-sm font-bold">
                    {review.reviewer?.nickname ?? "會員"} →{" "}
                    {review.reviewee?.nickname ?? "會員"}
                    <span className="ml-2 text-court">★ {review.rating}</span>
                  </p>
                  {review.comment ? (
                    <p className="mt-2 text-sm text-ink/70">「{review.comment}」</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
