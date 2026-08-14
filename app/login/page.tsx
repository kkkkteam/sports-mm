import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "入場｜Sports Map & Match 拼場",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(215,226,74,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(215,226,74,0.12)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col justify-end px-5 pb-12 md:justify-center md:pb-0">
        <Link href="/" className="mb-auto pt-8 font-display text-2xl tracking-wide text-line">
          SPORTS MAP & MATCH
        </Link>
        <h1 className="mt-16 text-[clamp(3rem,12vw,5rem)] font-black leading-none">
          入場
        </h1>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-paper/70">
          支援 Google、電郵與手機號碼。下一階段會接上 Supabase Auth。
        </p>
        <div className="mt-10 flex flex-col gap-3">
          <button
            type="button"
            disabled
            className="min-h-12 bg-line px-6 text-left text-base font-bold text-ink disabled:opacity-100"
          >
            使用 Google 繼續
          </button>
          <button
            type="button"
            disabled
            className="min-h-12 border-2 border-paper px-6 text-left text-base font-bold text-paper"
          >
            使用電郵繼續
          </button>
          <button
            type="button"
            disabled
            className="min-h-12 border-2 border-paper px-6 text-left text-base font-bold text-paper"
          >
            使用手機號碼繼續
          </button>
        </div>
        <Link href="/" className="mt-8 text-sm text-paper/60 hover:text-line">
          返回首頁
        </Link>
      </div>
    </main>
  );
}
