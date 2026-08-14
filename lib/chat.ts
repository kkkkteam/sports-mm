import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatRoom, ChatRoomType, Message, Profile } from "@/types/database";

export type ChatRoomListItem = {
  id: string;
  type: ChatRoomType;
  title: string;
  subtitle: string;
  lastMessage: string | null;
  lastAt: string | null;
  otherUserId?: string;
};

type MemberRow = {
  room_id: string;
  user_id: string;
  profiles: Pick<Profile, "id" | "nickname"> | null;
};

type MessagePreview = Pick<Message, "room_id" | "content" | "created_at" | "type">;

export async function listUserChatRooms(
  supabase: SupabaseClient,
  userId: string,
): Promise<ChatRoomListItem[]> {
  const { data: memberships } = await supabase
    .from("chat_room_members")
    .select("room_id")
    .eq("user_id", userId);

  const roomIds = (memberships ?? []).map((row) => row.room_id);
  if (roomIds.length === 0) return [];

  const [{ data: rooms }, { data: members }, { data: previews }] = await Promise.all([
    supabase.from("chat_rooms").select("*").in("id", roomIds),
    supabase
      .from("chat_room_members")
      .select("room_id, user_id, profiles!user_id(id, nickname)")
      .in("room_id", roomIds),
    supabase
      .from("messages")
      .select("room_id, content, created_at, type")
      .in("room_id", roomIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const memberRows = (members ?? []) as unknown as MemberRow[];
  const previewRows = (previews ?? []) as MessagePreview[];
  const roomRows = (rooms ?? []) as ChatRoom[];

  const lastByRoom = new Map<string, MessagePreview>();
  for (const message of previewRows) {
    if (!lastByRoom.has(message.room_id)) {
      lastByRoom.set(message.room_id, message);
    }
  }

  const items: ChatRoomListItem[] = roomRows.map((room) => {
    const roomMembers = memberRows.filter((member) => member.room_id === room.id);
    const last = lastByRoom.get(room.id) ?? null;
    const other = roomMembers.find((member) => member.user_id !== userId);

    if (room.type === "direct") {
      const title = other?.profiles?.nickname ?? "私人對話";
      return {
        id: room.id,
        type: room.type,
        title,
        subtitle: "單對單",
        lastMessage: last?.content ?? null,
        lastAt: last?.created_at ?? room.created_at,
        otherUserId: other?.user_id,
      };
    }

    return {
      id: room.id,
      type: room.type,
      title: room.title || (room.type === "game" ? "拼場群組" : "群組"),
      subtitle: room.type === "game" ? "拼場群組" : "群組",
      lastMessage: last?.content ?? null,
      lastAt: last?.created_at ?? room.created_at,
    };
  });

  return items.sort((a, b) => {
    const aTime = a.lastAt ? new Date(a.lastAt).getTime() : 0;
    const bTime = b.lastAt ? new Date(b.lastAt).getTime() : 0;
    return bTime - aTime;
  });
}

export async function openDirectChat(supabase: SupabaseClient, otherUserId: string) {
  const { data, error } = await supabase.rpc("get_or_create_direct_chat", {
    other_user_id: otherUserId,
  });
  if (error) throw error;
  return data as string;
}
