"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import type { ChatRoomListItem } from "@/lib/chat";
import { formatHkDateTime } from "@/lib/format";

function initials(name: string) {
  return name.slice(0, 1);
}

export function ChatSidebar({ rooms }: { rooms: ChatRoomListItem[] }) {
  const pathname = usePathname();
  const [filter, setFilter] = useState("");
  const activeId = pathname.startsWith("/chat/") ? pathname.split("/")[2] : null;

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (room) =>
        room.title.toLowerCase().includes(q) ||
        room.subtitle.toLowerCase().includes(q) ||
        (room.lastMessage ?? "").toLowerCase().includes(q),
    );
  }, [filter, rooms]);

  return (
    <aside className="flex h-full w-full flex-col border-r border-ink/10 bg-[#d7e0da] md:w-[22rem] lg:w-[26rem]">
      <div className="border-b border-ink/10 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-black">聊天</h1>
          <Link href="/friends" className="text-sm font-medium text-court hover:underline">
            好友
          </Link>
        </div>
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="搜尋對話…"
          className="mt-3 min-h-10 w-full border-2 border-ink/15 bg-paper/70 px-3 text-sm outline-none focus:border-court"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-sm text-ink/55">
            尚未有對話。先到好友頁加好友，或加入拼場後自動出現群組。
          </p>
        ) : (
          <ul>
            {filtered.map((room) => {
              const active = room.id === activeId;
              return (
                <li key={room.id}>
                  <Link
                    href={`/chat/${room.id}`}
                    className={`flex gap-3 border-b border-ink/10 px-4 py-3 transition-colors ${
                      active ? "bg-paper" : "hover:bg-paper/70"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center text-sm font-black ${
                        room.type === "game"
                          ? "bg-court text-paper"
                          : "bg-ink text-line"
                      }`}
                    >
                      {initials(room.title)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-bold">{room.title}</span>
                        {room.lastAt ? (
                          <span className="shrink-0 text-[11px] text-ink/45">
                            {formatHkDateTime(room.lastAt)}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-court">{room.subtitle}</span>
                      <span className="mt-1 block truncate text-sm text-ink/55">
                        {room.lastMessage ?? "尚無訊息"}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
