import { Link } from "@/i18n/navigation";

export function SiteFooter({
  isAuthed = false,
}: {
  isAuthed?: boolean;
}) {
  return (
    <footer className="flex flex-col gap-4 bg-ink px-5 py-10 text-paper md:flex-row md:items-end md:justify-between md:px-12">
      <div>
        <p className="font-display text-3xl tracking-wide">SPORTS MAP & MATCH</p>
        <p className="mt-1 text-sm text-paper/60">香港運動場地共享與拼場</p>
      </div>
      <div className="flex flex-wrap gap-5 text-sm font-medium">
        <Link href="/games" className="text-line hover:text-paper">
          搵場
        </Link>
        <Link
          href={isAuthed ? "/games/new" : "/login?next=/games/new"}
          className="text-line hover:text-paper"
        >
          放場
        </Link>
        <Link
          href={isAuthed ? "/profile" : "/login"}
          className="text-line hover:text-paper"
        >
          {isAuthed ? "會員檔案" : "登入 / 註冊"}
        </Link>
      </div>
    </footer>
  );
}
