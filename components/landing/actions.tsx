import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function Actions({
  hostHref = "/login?next=/games/new",
  joinHref = "/games",
}: {
  hostHref?: string;
  joinHref?: string;
}) {
  return (
    <section className="grid min-h-[88vh] md:grid-cols-2">
      <article className="relative min-h-[70vh] overflow-hidden bg-ink">
        <Image
          src="/images/host.jpg"
          alt="籃球入網"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <p className="font-display text-5xl tracking-wide text-line md:text-6xl">
            HOST
          </p>
          <h2 className="mt-2 text-3xl font-black text-paper md:text-4xl">
            放場
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-paper/80">
            你已訂場。寫上地點、時間、缺額與分攤，等人申請加入。
          </p>
          <Link
            href={hostHref}
            className="mt-6 inline-flex min-h-11 items-center bg-line px-6 text-sm font-bold text-ink transition-colors hover:bg-paper"
          >
            發佈場次
          </Link>
        </div>
      </article>

      <article className="relative min-h-[70vh] overflow-hidden bg-ink">
        <Image
          src="/images/join.jpg"
          alt="戶外球場上的一場籃球"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <p className="font-display text-5xl tracking-wide text-line md:text-6xl">
            JOIN
          </p>
          <h2 className="mt-2 text-3xl font-black text-paper md:text-4xl">
            搵場
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-paper/80">
            按運動、地區與時間找拼場。發起人接受後即可加入，費用一齊攤。
          </p>
          <Link
            href={joinHref}
            className="mt-6 inline-flex min-h-11 items-center bg-line px-6 text-sm font-bold text-ink transition-colors hover:bg-paper"
          >
            瀏覽場次
          </Link>
        </div>
      </article>
    </section>
  );
}
