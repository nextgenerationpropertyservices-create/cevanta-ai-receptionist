import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseConfig } from "@/lib/supabase/config";

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
  // Machine ingress verifies its own raw-body signature; user cookies are unrelated.
  // Keep this guard narrow even when the proxy is invoked outside Next's matcher.
  if (machineIngressPaths.has(request.nextUrl.pathname)) return response;
  // Public auth entry points should render even when hosted Auth is slow or temporarily unreachable.
  // Protected pages and server actions still perform authoritative verified-user checks before data access.
  if (publicAuthPaths.has(request.nextUrl.pathname)) return response;
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

