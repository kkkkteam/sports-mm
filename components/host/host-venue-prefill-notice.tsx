"use client";

import { useTranslations } from "next-intl";

export function HostVenuePrefillNotice({ venueName }: { venueName: string }) {
  const t = useTranslations("hostGame");

  return (
    <div
      role="status"
      className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground ring-1 ring-primary/10"
    >
      {t("venuePrefillNotice", { venueName })}
    </div>
  );
}
