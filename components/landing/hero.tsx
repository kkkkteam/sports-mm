import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-dvh overflow-hidden bg-ink">
      <Image
        src="/images/hero.jpg"
        alt="香港戶外籃球場"
        fill
        priority
        sizes="100vw"
        className="animate-kenburns object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 to-transparent" />

      <Link
        href="/login"
        className="absolute top-6 right-5 z-10 text-sm font-medium tracking-wide text-paper/90 transition-colors hover:text-line md:top-8 md:right-10"
      >
        登入
      </Link>

      <div className="relative z-10 flex min-h-dvh flex-col justify-end px-5 pb-10 md:px-12 md:pb-16">
        <p className="animate-rise font-display text-[clamp(4.2rem,16vw,10rem)] leading-[0.8] text-paper">
          SPORTS
          <br />
          MAP & MATCH
        </p>
        <p
          className="animate-rise mt-4 font-sans text-[clamp(2.75rem,9vw,5.5rem)] font-black leading-none text-line"
          style={{ animationDelay: "90ms" }}
        >
          拼場
        </p>
        <h1
          className="animate-rise mt-8 max-w-xl text-xl font-bold tracking-tight text-paper md:text-2xl"
          style={{ animationDelay: "180ms" }}
        >
          香港組隊，先有波打。
        </h1>
        <p
          className="animate-rise mt-3 max-w-lg text-base leading-relaxed text-paper/80 md:text-lg"
          style={{ animationDelay: "250ms" }}
        >
          放出已預訂的場地，或加入別人的局。籃球、健球、匹克球，即時拼場。
        </p>
        <div
          className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "340ms" }}
        >
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center bg-line px-8 text-base font-bold text-ink transition-colors duration-300 hover:bg-paper"
          >
            我要放場
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center border-2 border-paper px-8 text-base font-bold text-paper transition-colors duration-300 hover:bg-paper hover:text-ink"
          >
            搵場加入
          </Link>
        </div>
      </div>
    </section>
  );
}
