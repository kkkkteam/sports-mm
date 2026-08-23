"use client";

import { useTranslations } from "next-intl";

export function AcceptedStatusBanner({
  variant,
}: {
  variant: "on_site" | "proof_done";
}) {
  const t = useTranslations("gameDetail");

  const isOnSite = variant === "on_site";

  return (
    <section
      className={[
        "rounded-2xl p-5 ring-1",
        isOnSite
          ? "bg-mist ring-line-subtle"
          : "border border-primary/20 bg-primary/5 ring-primary/15",
      ].join(" ")}
    >
      <p className="text-base font-bold text-foreground">
        {isOnSite ? t("joinedPayOnSite") : t("joinedProofUploaded")}
      </p>
      {!isOnSite ? (
        <p className="mt-1 text-sm text-muted">{t("joinedProofUploadedHint")}</p>
      ) : null}
    </section>
  );
}
