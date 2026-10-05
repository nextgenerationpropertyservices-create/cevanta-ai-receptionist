import { NextResponse, type NextRequest } from "next/server";
import { passwordRecoveryOrigin } from "@/lib/server/password-recovery-origin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  let origin: string;
  try { origin = passwordRecoveryOrigin(); }
  catch { return new NextResponse("Password recovery is temporarily unavailable.", { status: 503, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } }); }
  let destination = "/reset-password?error=recovery";
  const tokens = request.nextUrl.searchParams.getAll("token_hash");
  const token = tokens.length === 1 ? tokens[0] : null;
  const codes = request.nextUrl.searchParams.getAll("code");
  const code = codes.length === 1 ? codes[0] : null;
  const safeToken = token && /^[a-zA-Z0-9_-]{1,512}$/.test(token) ? token : null;
  const safeCode = code && /^[a-zA-Z0-9_-]{1,2048}$/.test(code) ? code : null;
  if (isSupabaseConfigured() && ((safeToken && !code) || (safeCode && !token))) {
    try {
      const client = await createClient();
      const { error, data } = safeToken
        ? await client.auth.verifyOtp({ token_hash: safeToken, type: "recovery" })
        : await client.auth.exchangeCodeForSession(safeCode || "");
      if (!error && data.user && data.session) destination = "/reset-password";
    } catch { /* Do not disclose token or provider failures. */ }
  }
  const response = NextResponse.redirect(new URL(destination, origin));
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
