"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AttendanceStatus } from "@/types/database";

type ParticipantRow = {
  user_id: string;
  attendance_status: AttendanceStatus;
  profiles: { nickname: string } | null;
};

export function AttendancePanel({
  gameId,
  participants,
}: {
  gameId: string;
  participants: ParticipantRow[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function mark(userId: string, status: AttendanceStatus) {
    setError(null);
    setLoadingId(userId);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("game_participants")
        .update({ attendance_status: status })
        .eq("game_id", gameId)
        .eq("user_id", userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "更新失敗");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="mt-10 border-y border-ink/15 py-8">
      <h2 className="text-xl font-black">出席標記</h2>
      <p className="mt-2 text-sm text-ink/65">
        活動結束後標記申請人是否出席。缺席會拉低對方出席率。
      </p>
      <ul className="mt-5 divide-y divide-ink/10">
        {participants.map((row) => (
          <li
            key={row.user_id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-bold">{row.profiles?.nickname ?? "會員"}</p>
              <p className="text-xs text-ink/50">
                目前：
                {row.attendance_status === "present"
                  ? "出席"
                  : row.attendance_status === "no_show"
                    ? "缺席"
                    : "未標記"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loadingId === row.user_id}
                onClick={() => mark(row.user_id, "present")}
                className="min-h-10 bg-line px-4 text-sm font-bold text-ink disabled:opacity-55"
              >
                出席
              </button>
              <button
                type="button"
                disabled={loadingId === row.user_id}
                onClick={() => mark(row.user_id, "no_show")}
                className="min-h-10 border-2 border-ink/20 px-4 text-sm font-bold disabled:opacity-55"
              >
                缺席
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-3 text-sm text-court">{error}</p> : null}
    </section>
  );
}
