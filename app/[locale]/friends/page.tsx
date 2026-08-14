import type { Metadata } from "next";
import { redirect } from "@/lib/redirect";
import { AppNav } from "@/components/app-nav";
import { FriendSearch } from "@/components/friends/friend-search";
import { FriendsLists, type FriendRow } from "@/components/friends/friends-lists";
import { getOrCreateProfile, getSessionUser } from "@/lib/profile";
import type { Friendship, Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "好友｜Sports Map & Match 拼場",
};

export const dynamic = "force-dynamic";

export default async function FriendsPage() {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) {
    return await redirect("/login?next=/friends");
  }

  const profile = await getOrCreateProfile(user);
  const { data: friendshipRows } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const friendships = (friendshipRows ?? []) as Friendship[];
  const otherIds = Array.from(
    new Set(
      friendships.map((row) =>
        row.requester_id === user.id ? row.addressee_id : row.requester_id,
      ),
    ),
  );

  const { data: people } =
    otherIds.length > 0
      ? await supabase.from("profiles").select("id, nickname").in("id", otherIds)
      : { data: [] };

  const peopleMap = new Map(
    ((people ?? []) as Pick<Profile, "id" | "nickname">[]).map((person) => [
      person.id,
      person,
    ]),
  );

  const rows: FriendRow[] = friendships
    .map((friendship) => {
      const otherId =
        friendship.requester_id === user.id
          ? friendship.addressee_id
          : friendship.requester_id;
      const other = peopleMap.get(otherId);
      if (!other) return null;
      const direction =
        friendship.status === "accepted"
          ? "accepted"
          : friendship.requester_id === user.id
            ? "outgoing"
            : "incoming";
      return { friendship, profile: other, direction } satisfies FriendRow;
    })
    .filter((row): row is FriendRow => row !== null);

  const friends = rows.filter((row) => row.direction === "accepted");
  const incoming = rows.filter((row) => row.direction === "incoming");
  const outgoing = rows.filter((row) => row.direction === "outgoing");

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <AppNav nickname={profile.nickname} active="friends" />
      <div className="px-5 pb-20 pt-6 md:px-12">
        <p className="font-display text-sm tracking-[0.22em] text-court">SOCIAL</p>
        <h1 className="mt-2 text-[clamp(2.8rem,9vw,5.5rem)] font-black leading-none tracking-tight">
          好友
        </h1>
        <p className="mt-3 max-w-xl text-base text-ink/70">
          搜尋暱稱加好友，再打開單對單聊天。
        </p>

        <div className="mt-12 grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <FriendSearch userId={user.id} />
          <FriendsLists friends={friends} incoming={incoming} outgoing={outgoing} />
        </div>
      </div>
    </main>
  );
}
