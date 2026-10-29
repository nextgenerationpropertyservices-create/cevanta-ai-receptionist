import { NextResponse } from "next/server";
import {
  exchangeInvitationContinuation,
  INVITATION_CONTINUATION_COOKIE,
  INVITATION_CONTINUATION_COOKIE_OPTIONS,
  INVITATION_EXCHANGE_BODY_LIMIT,
  readBoundedInvitationBody,
} from "@/lib/server/invitation-continuations";
import { passwordRecoveryOrigin } from "@/lib/server/password-recovery-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const responseHeaders = {
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
  "Content-Security-Policy": "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; sandbox",
};

function unavailable(status = 400) {
  return NextResponse.json({ status: "unavailable" }, { status, headers: responseHeaders });
}

function singleHost(value: string | null): string | null {
  if (!value || value.includes(",") || /[\s/@\\]/.test(value)) return null;
  return value.toLowerCase();
}

function requestIsSameOrigin(request: Request, expected: URL): boolean {
  const origin = request.headers.get("origin");
  const host = singleHost(request.headers.get("host"));
  const forwardedHostHeader = request.headers.get("x-forwarded-host");
  const forwardedHost = forwardedHostHeader === null ? null : singleHost(forwardedHostHeader);
  const fetchSite = request.headers.get("sec-fetch-site");
  if (origin !== expected.origin || host !== expected.host.toLowerCase() || fetchSite !== "same-origin") return false;
  if (forwardedHostHeader !== null && forwardedHost !== expected.host.toLowerCase()) return false;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto !== null && forwardedProto !== expected.protocol.slice(0, -1)) return false;
  return true;
}

export async function POST(request: Request) {
  let expected: URL;
  try { expected = new URL(passwordRecoveryOrigin()); }
  catch { return unavailable(503); }
  if (!requestIsSameOrigin(request, expected)) return unavailable(403);
  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") return unavailable(415);
  const contentLength = request.headers.get("content-length");
  if (!contentLength || !/^\d{1,4}$/.test(contentLength)) return unavailable(413);
  const length = Number(contentLength);
  if (!Number.isSafeInteger(length) || length < 2 || length > INVITATION_EXCHANGE_BODY_LIMIT) return unavailable(413);
  const input = await readBoundedInvitationBody(request);
  if (input === null) return unavailable(400);
  const result = await exchangeInvitationContinuation(input);
  if (result.status !== "ready") return unavailable(400);
  const response = NextResponse.json({ status: "ready" }, { status: 200, headers: responseHeaders });
  response.cookies.set(INVITATION_CONTINUATION_COOKIE, result.continuation, INVITATION_CONTINUATION_COOKIE_OPTIONS);
  return response;
}

