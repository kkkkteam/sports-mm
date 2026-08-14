import { notFound } from "next/navigation";
import { redirect } from "@/lib/redirect";
import { ChatThread } from "@/components/chat/chat-thread";
import { listUserChatRooms } from "@/lib/chat";
import { getSessionUser } from "@/lib/profile";
import type { Message, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

type MessageRow = Message & {
  profiles: Pick<Profile, "nickname"> | null;
};

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) {
    return await redirect(`/login?next=/chat/${roomId}`);
  }

  const { data: membership } = await supabase
    .from("chat_room_members")
    .select("room_id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const rooms = await listUserChatRooms(supabase, user.id);
  const room = rooms.find((item) => item.id === roomId);
  if (!room) {
    notFound();
  }

  const { data: messageRows } = await supabase
    .from("messages")
    .select("*, profiles!sender_id(nickname)")
    .eq("room_id", roomId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(200);

  const messages = (messageRows ?? []) as MessageRow[];

  return (
    <ChatThread
      roomId={roomId}
      roomTitle={room.title}
      roomSubtitle={room.subtitle}
      userId={user.id}
      initialMessages={messages}
    />
  );
}
