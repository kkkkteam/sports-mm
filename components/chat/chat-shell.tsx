"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import type { ChatRoomListItem } from "@/lib/chat";

export function ChatShell({
  rooms,
  children,
}: {
  rooms: ChatRoomListItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const hasRoom = /^\/chat\/[^/]+$/.test(pathname);

  return (
    <div className="flex min-h-0 flex-1">
      <div
        className={`h-full ${hasRoom ? "hidden md:flex" : "flex w-full md:w-auto"}`}
      >
        <ChatSidebar rooms={rooms} />
      </div>
      <div
        className={`min-h-0 min-w-0 ${hasRoom ? "flex flex-1" : "hidden flex-1 md:flex"}`}
      >
        {children}
      </div>
    </div>
  );
}
