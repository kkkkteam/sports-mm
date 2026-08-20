"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

const THEMES = ["light", "dark", "high-contrast"] as const;

export function ThemeSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={
          compact
            ? "h-9 w-[7.5rem] rounded-lg border border-line-subtle bg-surface"
            : "h-11 w-full max-w-xs rounded-xl border border-line-subtle bg-surface"
        }
        aria-hidden
      />
    );
  }

  return (
    <label className={`flex flex-col gap-1.5 ${compact ? "" : "w-full max-w-xs"}`}>
      {!compact ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("label")}
        </span>
      ) : (
        <span className="sr-only">{t("label")}</span>
      )}
      <select
        value={theme ?? "light"}
        aria-label={t("label")}
        onChange={(event) => setTheme(event.target.value)}
        className={
          compact
            ? "min-h-9 rounded-lg border border-line-subtle bg-surface px-2 text-xs font-semibold text-ink outline-none focus:border-accent"
            : "min-h-11 rounded-xl border border-line-subtle bg-surface px-3 text-sm font-semibold text-ink outline-none focus:border-accent"
        }
      >
        {THEMES.map((value) => (
          <option key={value} value={value}>
            {t(value)}
          </option>
        ))}
      </select>
    </label>
  );
}
