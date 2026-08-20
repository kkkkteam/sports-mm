"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export const APP_THEMES = [
  "light",
  "dark",
  "high-contrast",
  "morandi",
  "earthy",
] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      themes={[...APP_THEMES]}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
