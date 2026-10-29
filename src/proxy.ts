import { createServerClient } from "@supabase/ssr";
import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseConfig } from "@/lib/supabase/config";

const invitationPrivacyHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
  Expires: "0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
} as const;

function invitationDocumentPath(pathname: string): boolean {
  return pathname === "/invite" || pathname.startsWith("/invite/");
}

function invitationDocumentCsp(nonce: string): string {
  const developmentScript = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";
  const developmentStyle = process.env.NODE_ENV === "production" ? "" : " 'unsafe-inline'";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentScript}`,
    "script-src-attr 'none'",
    `style-src 'self' 'nonce-${nonce}'${developmentStyle}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "media-src 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function applyInvitationPrivacyHeaders(response: NextResponse, csp: string): NextResponse {
  for (const [name, value] of Object.entries(invitationPrivacyHeaders)) response.headers.set(name, value);
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

const publicAuthPaths = new Set([
  "/",
  "/sign-in",
  "/forgot-password",
  "/auth/callback",
  "/auth/recovery",
]);
const machineIngressPaths = new Set([
  "/api/integrations/retell",
  "/api/integrations/retell/",
  "/api/integrations/make/retell-lead",
  "/api/integrations/make/retell-lead/",
]);

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  if (invitationDocumentPath(pathname)) {
    const nonce = randomBytes(16).toString("base64");
    const csp = invitationDocumentCsp(nonce);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
    response = NextResponse.next({ request: { headers: requestHeaders } });
    return applyInvitationPrivacyHeaders(response, csp);
  }
  if (pathname === "/api/invitations/continuations") return response;
  // Machine ingress verifies its own raw-body signature; user cookies are unrelated.
  // Keep this guard narrow even when the proxy is invoked outside Next's matcher.
  if (machineIngressPaths.has(pathname)) return response;
  // Public auth entry points should render even when hosted Auth is slow or temporarily unreachable.
  // Protected pages and server actions still perform authoritative verified-user checks before data access.
  if (publicAuthPaths.has(pathname)) return response;
  if (!isSupabaseConfigured()) return response;
  const { url, key } = supabaseConfig();
  const client = createServerClient(url, key, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll: values => {
      values.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    },
  } });
  await client.auth.getUser();
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|api/integrations/retell/?$|api/integrations/make/retell-lead/?$).*)"] };

