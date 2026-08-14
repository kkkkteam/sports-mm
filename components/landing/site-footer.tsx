import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="flex flex-col gap-4 bg-ink px-5 py-10 text-paper md:flex-row md:items-end md:justify-between md:px-12">
      <div>
        <p className="font-display text-3xl tracking-wide">SPORTS MAP & MATCH</p>
        <p className="mt-1 text-sm text-paper/60">香港運動場地共享與拼場</p>
      </div>
      <Link href="/login" className="text-sm font-medium text-line hover:text-paper">
        登入 / 註冊
      </Link>
    </footer>
  );
}
