import type { Metadata } from "next";
import { Anton, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const noto = Noto_Sans_TC({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sports Map & Match 拼場",
  description: "香港運動場地共享與拼場平台。放場、搵場、即時組隊。",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="zh-HK"
      className={`${anton.variable} ${noto.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
