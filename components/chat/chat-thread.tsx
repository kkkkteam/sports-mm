"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatHkTime } from "@/lib/format";
import type { Message, Profile } from "@/types/database";

type ChatMessage = Message & {
  profiles?: Pick<Profile, "nickname"> | null;
};

export function ChatThread({
  roomId,
  roomTitle,
  roomSubtitle,
  userId,
  initialMessages,
}: {
  roomId: string;
  roomTitle: string;
  roomSubtitle: string;
  userId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, roomId]);

  useEffect(() => {
    const supabase = createClient();

    void supabase
      .from("chat_room_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("room_id", roomId)
      .eq("user_id", userId);

    const channel = supabase
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const row = payload.new as Message;
          if (messages.some((message) => message.id === row.id)) return;

          let nickname: string | null = null;
          if (row.sender_id) {
            const { data } = await supabase
              .from("profiles")
              .select("nickname")
              .eq("id", row.sender_id)
              .maybeSingle();
            nickname = data?.nickname ?? null;
          }

          setMessages((current) => {
            if (current.some((message) => message.id === row.id)) return current;
            return [
              ...current,
              {
                ...row,
                profiles: nickname ? { nickname } : null,
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- subscribe once per room
  }, [roomId, userId]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setSending(true);
    setError(null);
    setDraft("");

    const optimisticId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      room_id: roomId,
      sender_id: userId,
      type: "text",
      content,
      created_at: new Date().toISOString(),
      deleted_at: null,
      profiles: { nickname: "我" },
    };
    setMessages((current) => [...current, optimistic]);

    try {
      const supabase = createClient();
      const { data, error: insertError } = await supabase
        .from("messages")
        .insert({
          room_id: roomId,
          sender_id: userId,
          type: "text",
          content,
        })
        .select("*, profiles!sender_id(nickname)")
        .single();

      if (insertError || !data) {
        setMessages((current) => current.filter((message) => message.id !== optimisticId));
        setDraft(content);
        setError(insertError?.message ?? "傳送失敗");
        return;
      }

      setMessages((current) => {
        const withoutTemp = current.filter((message) => message.id !== optimisticId);
        if (withoutTemp.some((message) => message.id === data.id)) return withoutTemp;
        return [...withoutTemp, data as ChatMessage];
      });
    } catch (caught) {
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      setDraft(content);
      setError(caught instanceof Error ? caught.message : "傳送失敗");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-[#eef3ef]">
      <header className="flex items-center gap-3 border-b border-ink/10 bg-paper px-4 py-3 md:px-6">
        <Link href="/chat" className="text-sm font-medium text-court md:hidden">
          ← 返回
        </Link>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black">{roomTitle}</h2>
          <p className="text-xs text-ink/55">{roomSubtitle}</p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 md:px-6">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-ink/50">開始對話吧。</p>
        ) : (
          messages.map((message) => {
            const mine = message.sender_id === userId;
            return (
              <div
                key={message.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 md:max-w-[70%] ${
                    mine
                      ? "rounded-2xl rounded-br-md bg-court text-paper"
                      : "rounded-2xl rounded-bl-md border border-ink/10 bg-paper text-ink"
                  }`}
                >
                  {!mine ? (
                    <p className="mb-1 text-xs font-bold text-court">
                      {message.profiles?.nickname ?? "會員"}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                    {message.content}
                  </p>
                  <p
                    className={`mt-1 text-[10px] ${mine ? "text-paper/70" : "text-ink/40"}`}
                  >
                    {formatHkTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className="border-t border-ink/10 bg-paper px-3 py-3 md:px-6"
      >
        {error ? <p className="mb-2 text-sm text-court">{error}</p> : null}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={1}
            placeholder="輸入訊息…"
            className="max-h-32 min-h-11 flex-1 resize-none border-2 border-ink/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-court"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="min-h-11 bg-line px-5 text-sm font-bold text-ink transition-colors hover:bg-paper disabled:opacity-45"
          >
            傳送
          </button>
        </div>
      </form>
    </section>
  );
}
