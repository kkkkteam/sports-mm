import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  lede,
  children,
  footer,
}: {
  title: string;
  lede: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(215,226,74,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(215,226,74,0.12)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-12 pt-8 md:max-w-xl md:justify-center md:pb-16">
        <Link
          href="/"
          className="font-display text-xl tracking-wide text-line sm:text-2xl"
        >
          SPORTS MAP & MATCH
        </Link>
        <h1 className="mt-12 text-[clamp(2.8rem,12vw,5rem)] font-black leading-none md:mt-16">
          {title}
        </h1>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-paper/70">
          {lede}
        </p>
        <div className="mt-8 md:mt-10">{children}</div>
        {footer ? <div className="mt-8">{footer}</div> : null}
      </div>
    </main>
  );
}

export const authPrimaryClass =
  "inline-flex min-h-12 w-full items-center justify-center bg-line px-6 text-base font-bold text-ink transition-colors duration-200 hover:bg-paper disabled:cursor-not-allowed disabled:opacity-55";

export const authGhostClass =
  "inline-flex min-h-12 w-full items-center justify-center border-2 border-paper px-6 text-base font-bold text-paper transition-colors duration-200 hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-55";

export const authInputClass =
  "min-h-12 w-full border-2 border-paper/35 bg-transparent px-4 text-base text-paper outline-none placeholder:text-paper/35 focus:border-line";
