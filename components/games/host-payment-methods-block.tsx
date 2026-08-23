"use client";

import { useTranslations } from "next-intl";
import {
  parseHostPaymentMethodChips,
  PAYMENT_METHOD_EMOJI,
} from "@/lib/host-payment-method-display";

export function HostPaymentMethodsBlock({
  acceptedPaymentMethods,
}: {
  acceptedPaymentMethods: string[];
}) {
  const t = useTranslations("gameDetail");
  const tProfile = useTranslations("profile");
  const chips = parseHostPaymentMethodChips(acceptedPaymentMethods);
  const isEmpty = chips.length === 0;

  return (
    <section className="rounded-2xl border border-primary/15 bg-primary/5 p-4 ring-1 ring-primary/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        {t("hostPaymentMethodsTitle")}
      </p>

      {isEmpty ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t("hostPaymentMethodsEmpty")}
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => {
            const key = chip.kind === "slug" ? chip.slug : `other:${chip.text}`;
            const emoji =
              chip.kind === "slug" ? PAYMENT_METHOD_EMOJI[chip.slug] : "📝";
            const label =
              chip.kind === "slug"
                ? tProfile(`paymentMethod_${chip.slug}`)
                : chip.text;

            return (
              <li key={key}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
                  <span aria-hidden>{emoji}</span>
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
