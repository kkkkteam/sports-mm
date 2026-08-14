import type { Metadata } from "next";
import { redirect } from "@/lib/redirect";
import { AppNav } from "@/components/app-nav";
import { ChatShell } from "@/components/chat/chat-shell";
import { listUserChatRooms } from "@/lib/chat";
import { getOrCreateProfile, getSessionUser } from "@/lib/profile";

export const metadata: Metadata = {
  title: "聊天｜Sports Map & Match 拼場",
};

export const dynamic = "force-dynamic";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) {
    return await redirect("/login?next=/chat");
  }

  const profile = await getOrCreateProfile(user);
  const rooms = await listUserChatRooms(supabase, user.id);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <AppNav nickname={profile.nickname} active="chat" />
      <ChatShell rooms={rooms}>{children}</ChatShell>
    </main>
  );
}
