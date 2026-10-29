import type { NextConfig } from "next";

const invitationPrivacyHeaders = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "CDN-Cache-Control", value: "no-store" },
  { key: "Vercel-CDN-Cache-Control", value: "no-store" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
] as const;

const invitationApiCsp = "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; sandbox";

const config: NextConfig = {
  // Explicit raw Server Action cap, including multipart framing. Backend field
  // validation remains separate; this preserves Next's documented 1 MiB default.
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
      ] },
      { source: "/invite/:path*", headers: [...invitationPrivacyHeaders] },
      { source: "/api/invitations/continuations", headers: [
        ...invitationPrivacyHeaders,
        { key: "Content-Security-Policy", value: invitationApiCsp },
      ] },
    ];
  }
};
export default config;
