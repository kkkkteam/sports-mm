import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function Hero({
  isAuthed = false,
  nickname = null,
}: {
  isAuthed?: boolean;
  nickname?: string | null;
}) {
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  return (
    <section className="relative min-h-[min(100%,100dvh)] overflow-hidden bg-ink md:min-h-full">
      <Image
        src="/images/hero.jpg"
        alt="香港戶外籃球場"
        fill
        priority
        sizes="(min-width: 768px) 90vw, 100vw"
        className="animate-kenburns object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 to-transparent" />

      <div className="absolute top-6 right-5 z-50 flex items-center gap-4 md:top-8 md:right-10">
        <LanguageSwitcher variant="dark" />
        <Link
          href={isAuthed ? "/profile" : "/login"}
          className="max-w-[46vw] truncate text-sm font-medium tracking-wide text-paper/90 transition-colors hover:text-line md:max-w-none"
        >
          {isAuthed ? (nickname ?? tNav("profile")) : tNav("login")}
        </Link>
      </div>

      <div className="relative z-10 flex min-h-[70dvh] flex-col justify-end px-5 pb-10 md:min-h-[calc(100dvh-8rem)] md:px-12 md:pb-16">
        <p className="animate-rise font-display text-[clamp(3.5rem,12vw,7rem)] leading-[0.85] text-paper md:text-[clamp(4rem,8vw,7.5rem)]">
          SPORTS
          <br />
          MAP & MATCH
        </p>
        <p
          className="animate-rise mt-4 font-sans text-[clamp(2.75rem,9vw,5.5rem)] font-black leading-none text-line"
          style={{ animationDelay: "90ms" }}
        >
          {t("tagline")}
        </p>
        <h1
          className="animate-rise mt-8 max-w-xl text-xl font-bold tracking-tight text-paper md:text-2xl"
          style={{ animationDelay: "180ms" }}
        >
          {t("headline")}
        </h1>
        <p
          className="animate-rise mt-3 max-w-lg text-base leading-relaxed text-paper/80 md:text-lg"
          style={{ animationDelay: "250ms" }}
        >
          {t("lede")}
        </p>
        <div
          className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "340ms" }}
        >
          <Link
            href={isAuthed ? "/games/new" : "/login?next=/games/new"}
            className="inline-flex min-h-12 items-center justify-center bg-line px-8 text-base font-bold text-ink transition-colors duration-300 hover:bg-paper"
          >
            {t("ctaHost")}
          </Link>
          <Link
            href="/games"
            className="inline-flex min-h-12 items-center justify-center border-2 border-paper px-8 text-base font-bold text-paper transition-colors duration-300 hover:bg-paper hover:text-ink"
          >
            {t("ctaJoin")}
          </Link>
        </div>
      </div>
    </section>
  );
}
