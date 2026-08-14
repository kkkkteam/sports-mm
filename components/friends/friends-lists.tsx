"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { openDirectChat } from "@/lib/chat";
import type { Friendship, Profile } from "@/types/database";

export type FriendRow = {
  friendship: Friendship;
  profile: Pick<Profile, "id" | "nickname">;
  direction: "incoming" | "outgoing" | "accepted";
};

export function FriendsLists({
  friends,
  incoming,
  outgoing,
}: {
  friends: FriendRow[];
  incoming: FriendRow[];
  outgoing: FriendRow[];
}) {
  const router = useRouter();
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function accept(friendshipId: string) {
    setActing(friendshipId);
    setError(null);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.refresh();
    } finally {
      setActing(null);
    }
  }

  async function reject(friendshipId: string) {
    setActing(friendshipId);
    setError(null);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      router.refresh();
    } finally {
      setActing(null);
    }
  }

  async function startChat(userId: string) {
    setActing(userId);
    setError(null);
    try {
      const supabase = createClient();
      const roomId = await openDirectChat(supabase, userId);
      router.push(`/chat/${roomId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "無法開啟聊天室");
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="flex flex-col gap-14">
      {error ? <p className="text-sm text-court">{error}</p> : null}

      <section>
        <h2 className="text-2xl font-black">待你確認</h2>
        {incoming.length === 0 ? (
          <p className="mt-4 text-ink/60">沒有待處理邀請。</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
            {incoming.map((row) => (
              <li
                key={row.friendship.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-lg font-black">{row.profile.nickname}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={acting === row.friendship.id}
                    onClick={() => void accept(row.friendship.id)}
                    className="min-h-10 bg-line px-4 text-sm font-bold text-ink"
                  >
                    接受
                  </button>
                  <button
                    type="button"
                    disabled={acting === row.friendship.id}
                    onClick={() => void reject(row.friendship.id)}
                    className="min-h-10 border-2 border-ink/20 px-4 text-sm font-bold"
                  >
                    拒絕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-black">我的好友</h2>
        {friends.length === 0 ? (
          <p className="mt-4 text-ink/60">尚未有好友。先搜尋暱稱發送邀請。</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
            {friends.map((row) => (
              <li
                key={row.friendship.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-lg font-black">{row.profile.nickname}</p>
                <button
                  type="button"
                  disabled={acting === row.profile.id}
                  onClick={() => void startChat(row.profile.id)}
                  className="min-h-10 bg-ink px-4 text-sm font-bold text-paper transition-colors hover:bg-court"
                >
                  傳訊息
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {outgoing.length > 0 ? (
        <section>
          <h2 className="text-2xl font-black">已送出邀請</h2>
          <ul className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
            {outgoing.map((row) => (
              <li key={row.friendship.id} className="py-4">
                <p className="text-lg font-black">{row.profile.nickname}</p>
                <p className="text-sm text-ink/55">等待對方接受</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
