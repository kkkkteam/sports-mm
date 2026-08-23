export const PROFILE_PAYMENT_METHOD_OPTIONS = [
  "cash_on_site",
  "payme",
  "fps",
  "alipay_hk",
  "wechat_pay_hk",
] as const;

export type ProfilePaymentMethodSlug =
  (typeof PROFILE_PAYMENT_METHOD_OPTIONS)[number];

export const OTHER_PAYMENT_PREFIX = "other:";

export type ParsedProfilePaymentMethods = {
  methods: Record<ProfilePaymentMethodSlug, boolean>;
  other: string;
};

export function parseProfilePaymentMethods(
  values: string[] | null | undefined,
): ParsedProfilePaymentMethods {
  const list = values ?? [];
  const set = new Set(list);
  const otherEntry = list.find((value) => value.startsWith(OTHER_PAYMENT_PREFIX));

  return {
    methods: Object.fromEntries(
      PROFILE_PAYMENT_METHOD_OPTIONS.map((slug) => [slug, set.has(slug)]),
    ) as Record<ProfilePaymentMethodSlug, boolean>,
    other: otherEntry ? otherEntry.slice(OTHER_PAYMENT_PREFIX.length) : "",
  };
}

export function serializeProfilePaymentMethods(
  methods: Record<ProfilePaymentMethodSlug, boolean>,
  other: string,
): string[] {
  const result: string[] = PROFILE_PAYMENT_METHOD_OPTIONS.filter(
    (slug) => methods[slug],
  );
  const trimmed = other.trim();
  if (trimmed) {
    result.push(`${OTHER_PAYMENT_PREFIX}${trimmed}`);
  }
  return result;
}
