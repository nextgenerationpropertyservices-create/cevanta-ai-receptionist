import type { NextConfig } from "next";
const config: NextConfig = {
  // Explicit raw Server Action cap, including multipart framing. Backend field
  // validation remains separate; this preserves Next's documented 1 MiB default.
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
    ] }];
  }
};
export default config;
