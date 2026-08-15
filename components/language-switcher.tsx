"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS, routing, type AppLocale } from "@/i18n/routing";

export function LanguageSwitcher({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right),
        minWidth: Math.max(rect.width, 140),
        zIndex: 1000,
      });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function switchLocale(next: AppLocale) {
    setOpen(false);
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  const isDark = variant === "dark";
  const triggerClass = isDark
    ? "border-paper/35 text-paper/90 hover:border-line focus:border-line"
    : "border-ink/15 text-ink/80 hover:border-ink focus:border-court";

  const menu = open && mounted
    ? createPortal(
        <ul
          ref={menuRef}
          id={listId}
          role="listbox"
          aria-label={t("language")}
          style={menuStyle}
          className="border-2 border-ink/15 bg-paper py-1 shadow-lg"
        >
          {routing.locales.map((item) => {
            const selected = item === locale;
            return (
              <li key={item} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => switchLocale(item)}
                  className={`block w-full whitespace-nowrap px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selected
                      ? "bg-line text-ink"
                      : "text-ink/80 hover:bg-mist/50 hover:text-ink"
                  }`}
                >
                  {LOCALE_LABELS[item]}
                </button>
              </li>
            );
          })}
        </ul>,
        document.body,
      )
    : null;

  return (
    <div className="relative inline-block text-sm">
      <button
        ref={buttonRef}
        type="button"
        aria-label={t("language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex min-h-9 items-center gap-2 border-2 bg-transparent px-2.5 font-medium outline-none ${triggerClass}`}
      >
        <span>{LOCALE_LABELS[locale]}</span>
        <span aria-hidden className="text-[10px] leading-none opacity-70">
          ▾
        </span>
      </button>
      {menu}
    </div>
  );
}
