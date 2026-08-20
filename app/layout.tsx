import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

const noto = Noto_Sans_TC({
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sports Map & Match",
  description: "香港運動場地共享與拼場平台。放場、搵場、即時組隊。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${noto.variable} h-full antialiased`}
      lang="zh-HK"
      suppressHydrationWarning
    >
      <body className="h-full bg-shell font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
