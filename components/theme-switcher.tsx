"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { APP_THEMES, type AppTheme } from "@/app/providers";

export function ThemeSwitcher({
  compact = false,
  themes,
}: {
  compact?: boolean;
  themes?: AppTheme[];
}) {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const availableThemes = themes ?? APP_THEMES;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={
          compact
            ? "h-9 w-[8.5rem] rounded-lg border border-line-subtle bg-surface"
            : "h-11 w-full max-w-xs rounded-xl border border-line-subtle bg-surface"
        }
        aria-hidden
      />
    );
  }

  const currentTheme =
    theme && availableThemes.includes(theme as AppTheme)
      ? theme
      : availableThemes[0];

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
        value={currentTheme}
        aria-label={t("label")}
        onChange={(event) => setTheme(event.target.value)}
        className={
          compact
            ? "min-h-9 max-w-[9.5rem] rounded-lg border border-line-subtle bg-background px-2.5 text-xs font-semibold text-foreground outline-none focus:border-primary"
            : "min-h-11 rounded-xl border border-line-subtle bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
        }
      >
        {availableThemes.map((value) => (
          <option key={value} value={value}>
            {t(value)}
          </option>
        ))}
      </select>
    </label>
  );
}
