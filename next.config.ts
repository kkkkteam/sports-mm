import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Allow phone / LAN devices to load Next.js dev assets
  allowedDevOrigins: ["192.168.3.6", "127.0.0.1", "localhost"],
};

export default withNextIntl(nextConfig);
