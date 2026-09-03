export type VenueBookingAction = {
  labelKey: "bookNow" | "contactHost";
  href: string | null;
  external: boolean;
  disabled: boolean;
};

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isTelOrMail(value: string) {
  return /^tel:/i.test(value) || /^mailto:/i.test(value);
}

function normalizePhone(value: string) {
  const digits = value.replace(/\s+/g, "");
  if (/^(\+?\d[\d-]{6,})$/.test(digits)) {
    return `tel:${digits.replace(/-/g, "")}`;
  }
  return null;
}

export function resolveVenueBookingAction(
  bookingLink: string | null | undefined,
): VenueBookingAction {
  const trimmed = bookingLink?.trim() ?? "";
  if (!trimmed) {
    return {
      labelKey: "contactHost",
      href: null,
      external: false,
      disabled: true,
    };
  }

  if (isHttpUrl(trimmed)) {
    return {
      labelKey: "bookNow",
      href: trimmed,
      external: true,
      disabled: false,
    };
  }

  if (isTelOrMail(trimmed)) {
    return {
      labelKey: "contactHost",
      href: trimmed,
      external: false,
      disabled: false,
    };
  }

  const phoneHref = normalizePhone(trimmed);
  if (phoneHref) {
    return {
      labelKey: "contactHost",
      href: phoneHref,
      external: false,
      disabled: false,
    };
  }

  return {
    labelKey: "contactHost",
    href: trimmed,
    external: false,
    disabled: false,
  };
}
