import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ApplyButton } from "@/components/games/apply-button";
import { AttendancePanel } from "@/components/games/attendance-panel";
import { CompleteGameButton } from "@/components/games/complete-game-button";
import {
  GameDetailView,
  type GameDetailData,
  type GameDetailParticipant,
} from "@/components/games/game-detail-view";
import { ReviewPanel } from "@/components/games/review-panel";
import { getSessionUser } from "@/lib/profile";
import type {
  Application,
  AttendanceStatus,
  Game,
  GameStatus,
  HkDistrict,
  Profile,
  Review,
  Sport,
} from "@/types/database";

export const dynamic = "force-dynamic";

type GameDetail = Game & {
  sports: Pick<Sport, "name_zh" | "name_en"> | null;
  profiles: Pick<
    Profile,
    "nickname" | "id" | "rating" | "rating_count" | "attendance_rate"
  > | null;
};

type ParticipantRow = {
  user_id: string;
  attendance_status: AttendanceStatus;
  profiles: Pick<Profile, "nickname" | "rating" | "rating_count"> | null;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: `拼場詳情｜Sports Map & Match` };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const tCalendar = await getTranslations("gameDetail");
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
  const status = game.status as GameStatus;

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
    const [{ data: application }, { data: participant }] = await Promise.all([
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
    disabledReason = "申請審批中，請等待發起人回覆。";
  } else if (waitlistedApplication) {
    disabledReason = "你已在候補名單，有空缺時會自動轉為待審批。";
  } else if (myApplication?.status === "rejected") {
    disabledReason = "發起人已拒絕此申請。";
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

  const nonHostParticipants = participants.filter(
    (row) => row.user_id !== game.host_id,
  );
  const canReview =
    status === "completed" && Boolean(user) && (isHost || isParticipant);
  const reviewTargets = nonHostParticipants
    .filter((row) => row.user_id !== user?.id)
    .map((row) => ({
      user_id: row.user_id,
      nickname: row.profiles?.nickname ?? "會員",
    }));
  const myReviews = reviews.filter((item) => item.reviewer_id === user?.id);

  const participantViews: GameDetailParticipant[] = participants
    .map((row) => ({
      userId: row.user_id,
      nickname: row.profiles?.nickname ?? "會員",
      isHost: row.user_id === game.host_id,
      rating: row.profiles?.rating ?? null,
      ratingCount: row.profiles?.rating_count ?? 0,
    }))
    .sort((a, b) => {
      if (a.isHost) return -1;
      if (b.isHost) return 1;
      return a.nickname.localeCompare(b.nickname, "zh-HK");
    });

  const sportName =
    locale === "en"
      ? (game.sports?.name_en ?? game.sports?.name_zh ?? "—")
      : (game.sports?.name_zh ?? "—");

  const detailData: GameDetailData = {
    id: game.id,
    title: game.title,
    description: game.description,
    venueLabel: game.venue_label,
    district: game.district as HkDistrict,
    lat: game.lat,
    lng: game.lng,
    startsAt: game.starts_at,
    endsAt: game.ends_at,
    maxPlayers: game.max_players,
    currentPlayers: game.current_players,
    spotsNeeded: game.spots_needed,
    totalCostHkd: Number(game.total_cost_hkd),
    costSplitMode: game.cost_split_mode,
    minSkill: game.min_skill,
    sportName,
    host: {
      id: game.host_id,
      nickname: game.profiles?.nickname ?? "—",
      rating: game.profiles?.rating ?? null,
      ratingCount: game.profiles?.rating_count ?? 0,
    },
    participants: participantViews,
  };

  const footer = isHost ? (
    <div className="flex flex-col gap-2">
      <Link
        href="/host"
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-accent text-base font-bold text-on-accent"
      >
        前往審批申請
      </Link>
      {game.chat_room_id ? (
        <Link
          href={`/chat/${game.chat_room_id}`}
          className="flex min-h-10 w-full items-center justify-center text-sm font-semibold text-accent"
        >
          場次群組聊天
        </Link>
      ) : null}
    </div>
  ) : (
    <ApplyButton
      gameId={game.id}
      userId={user?.id ?? null}
      disabledReason={disabledReason}
      mode={waitlistMode ? "waitlist" : "apply"}
      onWithdraw={canWithdraw}
      allowProofUpdate={editableApplication}
      existingApplicationId={myApplication?.id ?? null}
      existingProofUrl={
        editableApplication ? (myApplication?.payment_proof_url ?? null) : null
      }
      layout="footer"
    />
  );

  const extra = (
    <>
      {isHost && status !== "completed" && status !== "cancelled" ? (
        <CompleteGameButton gameId={game.id} />
      ) : null}

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
        <section className="mt-6">
          <h2 className="text-lg font-black">公開評論</h2>
          <ul className="mt-4 divide-y divide-line-subtle rounded-2xl bg-surface ring-1 ring-line-subtle">
            {reviews.map((review) => (
              <li key={review.id} className="px-4 py-3">
                <p className="text-sm font-bold">
                  {review.reviewer?.nickname ?? "會員"} →{" "}
                  {review.reviewee?.nickname ?? "會員"}
                  <span className="ml-2 text-accent">★ {review.rating}</span>
                </p>
                {review.comment ? (
                  <p className="mt-1 text-sm text-muted">「{review.comment}」</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isParticipant && !isHost && game.chat_room_id ? (
        <Link
          href={`/chat/${game.chat_room_id}`}
          className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-mist text-sm font-semibold text-ink"
        >
          進入場次群組聊天
        </Link>
      ) : null}
    </>
  );

  const calendarDescription = tCalendar("calendarDescription");

  return (
    <GameDetailView
      game={detailData}
      footer={footer}
      extra={extra}
      calendarDescription={calendarDescription}
    />
  );
}
