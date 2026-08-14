"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { openDirectChat } from "@/lib/chat";
import type { Friendship, Profile } from "@/types/database";

type SearchHit = Pick<Profile, "id" | "nickname" | "district"> & {
  relation: "none" | "outgoing" | "incoming" | "friends";
  friendshipId?: string;
};

export function FriendSearch({ userId }: { userId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setError(null);
    const q = query.trim();
    if (q.length < 1) {
      setHits([]);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const [{ data: profiles }, { data: friendships }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, nickname, district")
          .neq("id", userId)
          .ilike("nickname", `%${q}%`)
          .limit(20),
        supabase
          .from("friendships")
          .select("*")
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
      ]);

      const rows = (friendships ?? []) as Friendship[];
      const nextHits: SearchHit[] = ((profiles ?? []) as Pick<Profile, "id" | "nickname" | "district">[]).map(
        (profile) => {
          const link = rows.find(
            (row) =>
              (row.requester_id === userId && row.addressee_id === profile.id) ||
              (row.requester_id === profile.id && row.addressee_id === userId),
          );
          if (!link) {
            return { ...profile, relation: "none" as const };
          }
          if (link.status === "accepted") {
            return { ...profile, relation: "friends" as const, friendshipId: link.id };
          }
          if (link.requester_id === userId) {
            return { ...profile, relation: "outgoing" as const, friendshipId: link.id };
          }
          return { ...profile, relation: "incoming" as const, friendshipId: link.id };
        },
      );
      setHits(nextHits);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "搜尋失敗");
    } finally {
      setLoading(false);
    }
  }

  async function sendRequest(targetId: string) {
    setActing(targetId);
    setError(null);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("friendships").insert({
        requester_id: userId,
        addressee_id: targetId,
        status: "pending",
      });
      if (insertError) {
        setError(insertError.message.includes("duplicate") ? "已有好友邀請紀錄。" : insertError.message);
        return;
      }
      await search();
      router.refresh();
    } finally {
      setActing(null);
    }
  }

  async function acceptRequest(friendshipId: string, targetId: string) {
    setActing(targetId);
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
      await search();
      router.refresh();
    } finally {
      setActing(null);
    }
  }

  async function startChat(targetId: string) {
    setActing(targetId);
    setError(null);
    try {
      const supabase = createClient();
      const roomId = await openDirectChat(supabase, targetId);
      router.push(`/chat/${roomId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "無法開啟聊天室");
    } finally {
      setActing(null);
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-black">搜尋會員</h2>
      <p className="mt-2 text-sm text-ink/65">輸入暱稱，發送好友邀請。</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void search();
          }}
          placeholder="搜尋暱稱…"
          className="min-h-12 flex-1 border-2 border-ink/20 bg-transparent px-4 outline-none focus:border-court"
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={loading}
          className="min-h-12 bg-ink px-6 font-bold text-paper transition-colors hover:bg-court disabled:opacity-55"
        >
          {loading ? "搜尋中…" : "搜尋"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-court">{error}</p> : null}
      <ul className="mt-6 divide-y divide-ink/15 border-y border-ink/15">
        {hits.map((hit) => (
          <li
            key={hit.id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-lg font-black">{hit.nickname}</p>
              <p className="text-sm text-ink/55">
                {hit.relation === "none" && "尚未成為好友"}
                {hit.relation === "outgoing" && "邀請已送出"}
                {hit.relation === "incoming" && "向你發出邀請"}
                {hit.relation === "friends" && "已是好友"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {hit.relation === "none" ? (
                <button
                  type="button"
                  disabled={acting === hit.id}
                  onClick={() => void sendRequest(hit.id)}
                  className="min-h-10 bg-line px-4 text-sm font-bold text-ink"
                >
                  加好友
                </button>
              ) : null}
              {hit.relation === "incoming" && hit.friendshipId ? (
                <button
                  type="button"
                  disabled={acting === hit.id}
                  onClick={() => void acceptRequest(hit.friendshipId!, hit.id)}
                  className="min-h-10 bg-line px-4 text-sm font-bold text-ink"
                >
                  接受邀請
                </button>
              ) : null}
              {hit.relation === "friends" ? (
                <button
                  type="button"
                  disabled={acting === hit.id}
                  onClick={() => void startChat(hit.id)}
                  className="min-h-10 border-2 border-ink/20 px-4 text-sm font-bold"
                >
                  傳訊息
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
