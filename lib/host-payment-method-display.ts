import {
  OTHER_PAYMENT_PREFIX,
  PROFILE_PAYMENT_METHOD_OPTIONS,
  type ProfilePaymentMethodSlug,
} from "@/lib/profile-payment-methods";

export const PAYMENT_METHOD_EMOJI: Record<ProfilePaymentMethodSlug, string> = {
  cash_on_site: "💵",
  payme: "📱",
  fps: "⚡",
  alipay_hk: "🔵",
  wechat_pay_hk: "💬",
};

export type HostPaymentMethodChip =
  | { kind: "slug"; slug: ProfilePaymentMethodSlug }
  | { kind: "other"; text: string };

export function parseHostPaymentMethodChips(
  values: string[] | null | undefined,
): HostPaymentMethodChip[] {
  const list = values ?? [];
  const chips: HostPaymentMethodChip[] = [];

  for (const value of list) {
    if (value.startsWith(OTHER_PAYMENT_PREFIX)) {
      const text = value.slice(OTHER_PAYMENT_PREFIX.length).trim();
      if (text) {
        chips.push({ kind: "other", text });
      }
      continue;
    }

    if (
      PROFILE_PAYMENT_METHOD_OPTIONS.includes(value as ProfilePaymentMethodSlug)
    ) {
      chips.push({ kind: "slug", slug: value as ProfilePaymentMethodSlug });
    }
  }

  return chips;
}
