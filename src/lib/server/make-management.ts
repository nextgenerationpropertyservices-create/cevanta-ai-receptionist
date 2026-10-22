import "server-only";

import { z } from "zod";

const makeRequestSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.email().max(256),
});

const responseSchema = z.object({
  request: z.object({ id: z.uuid(), status: z.string().optional() }).passthrough(),
  publicUri: z.url(),
});

const defaultCredentials: Array<{ appName: string; appModules: string[] }> = [
  { appName: "gmail", appModules: ["*"] },
  { appName: "google-calendar", appModules: ["*"] },
] as const;

function config() {
  const token = process.env.MAKE_MANAGEMENT_API_TOKEN?.trim();
  const teamId = Number.parseInt(process.env.MAKE_TEAM_ID ?? "", 10);
  if (!token || !Number.isSafeInteger(teamId) || teamId < 1) return null;
  const baseUrl = (process.env.MAKE_API_BASE_URL ?? "https://us2.make.com/api/v2").replace(/\/$/, "");
  let credentials = defaultCredentials;
  const rawCredentials = process.env.MAKE_CREDENTIAL_REQUEST_CREDENTIALS_JSON?.trim();
  if (rawCredentials) {
    try {
      const parsed = z.array(z.object({ appName: z.string().min(1).max(255), appModules: z.array(z.string().min(1).max(255)).min(1) })).max(64).parse(JSON.parse(rawCredentials));
      credentials = parsed;
    } catch {
      return null;
    }
  }
  return { token, teamId, baseUrl, credentials };
}

async function makeFetch(path: string, init?: RequestInit) {
  const settings = config();
  if (!settings) return { kind: "config_missing" as const };
  const response = await fetch(`${settings.baseUrl}${path}`, {
    ...init,
    headers: { Authorization: `Token ${settings.token}`, "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) return { kind: "provider_error" as const, status: response.status };
  return { kind: "ok" as const, response };
}

export type MakeAuthorizationResult =
  | { status: "created"; requestId: string; publicUri: string; providerStatus?: string }
  | { status: "config_missing" }
  | { status: "provider_error" }
  | { status: "invalid_response" };

export async function createMakeAuthorization(input: { name: string; email: string }): Promise<MakeAuthorizationResult> {
  const parsed = makeRequestSchema.safeParse(input);
  if (!parsed.success) return { status: "provider_error" };
  const settings = config();
  if (!settings) return { status: "config_missing" };
  const result = await makeFetch("/credential-requests/requests/v2", {
    method: "POST",
    body: JSON.stringify({
      name: `Cevanta integrations — ${parsed.data.name}`,
      description: "Connect the client-approved Gmail and Google Calendar accounts for this Cevanta workspace.",
      teamId: settings.teamId,
      credentials: settings.credentials,
      provider: { newUser: parsed.data },
    }),
  });
  if (result.kind !== "ok") return { status: result.kind };
  const body = await result.response.json().catch(() => null);
  const response = responseSchema.safeParse(body);
  if (!response.success) return { status: "invalid_response" };
  return { status: "created", requestId: response.data.request.id, publicUri: response.data.publicUri, providerStatus: response.data.request.status };
}

