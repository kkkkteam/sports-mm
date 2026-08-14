import { Link } from "@/i18n/navigation";

export default function ChatIndexPage() {
  return (
    <section className="flex h-full flex-1 flex-col items-center justify-center bg-[#eef3ef] px-6 text-center">
      <p className="font-display text-4xl tracking-wide text-court">CHAT</p>
      <h2 className="mt-3 text-2xl font-black">選擇左側對話開始聊天</h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
        單對單來自好友；拼場群組會在房主接受申請後自動出現。
      </p>
      <Link
        href="/friends"
        className="mt-8 inline-flex min-h-11 items-center bg-ink px-6 text-sm font-bold text-paper transition-colors hover:bg-court"
      >
        前往好友
      </Link>
    </section>
  );
}
