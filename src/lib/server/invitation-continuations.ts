import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { isCanonicalInvitationToken } from "@/lib/onboarding-validation";
import { createClient } from "@/lib/supabase/server";

export const INVITATION_CONTINUATION_COOKIE = "__Host-cevanta-invite";
export const INVITATION_CONTINUATION_MAX_AGE_SECONDS = 15 * 60;
export const INVITATION_EXCHANGE_BODY_LIMIT = 1024;

export const INVITATION_CONTINUATION_COOKIE_OPTIONS = Object.freeze({
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: INVITATION_CONTINUATION_MAX_AGE_SECONDS,
  priority: "high" as const,
});

const exchangeInputSchema = z.object({
  version: z.literal(1),
  request_id: z.uuid(),
  token: z.string().length(43),
}).strict();

const exchangeResultSchema = z.object({
  status: z.enum(["created", "unavailable", "retryable_failure"]),
}).strict();

const acceptanceResultSchema = z.union([
  z.object({
    status: z.literal("accepted"),
    acceptance: z.object({
      invitation_id: z.uuid(),
      accepted_at: z.iso.datetime({ precision: 6 }),
    }).strict(),
    workspace: z.object({ id: z.uuid(), name: z.string().trim().min(1).max(160) }).strict(),
    role: z.literal("owner"),
    entry: z.literal("setup"),
  }).strict(),
  z.object({ status: z.enum(["unavailable", "retryable_failure"]) }).strict(),
]);

export type InvitationContinuationAcceptance = z.infer<typeof acceptanceResultSchema>;

function canonicalDigest(value: string): string | null {
  if (!isCanonicalInvitationToken(value)) return null;
  const bytes = Buffer.from(value, "base64url");
  if (bytes.byteLength !== 32 || bytes.toString("base64url") !== value) return null;
  return createHash("sha256").update(bytes).digest("hex");
}

export async function readBoundedInvitationBody(request: Request): Promise<unknown | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > INVITATION_EXCHANGE_BODY_LIMIT) {
        await reader.cancel().catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }
    if (total === 0) return null;
    const body = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(body);
    return JSON.parse(text) as unknown;
  } catch {
    await reader.cancel().catch(() => undefined);
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function exchangeInvitationContinuation(input: unknown): Promise<
  { status: "ready"; continuation: string } | { status: "unavailable" }
> {
  const parsed = exchangeInputSchema.safeParse(input);
  if (!parsed.success) return { status: "unavailable" };
  const tokenDigestHex = canonicalDigest(parsed.data.token);
  if (!tokenDigestHex) return { status: "unavailable" };
  const continuation = randomBytes(32).toString("base64url");
  const continuationDigestHex = canonicalDigest(continuation);
  if (!continuationDigestHex) return { status: "unavailable" };
  const expiresAt = new Date(Date.now() + INVITATION_CONTINUATION_MAX_AGE_SECONDS * 1000).toISOString();
  try {
    const client = await createClient();
    const { data, error } = await client.rpc("exchange_invitation_continuation", {
      input: {
        request_id: parsed.data.request_id,
        token_digest_hex: tokenDigestHex,
        continuation_digest_hex: continuationDigestHex,
        expires_at: expiresAt,
      },
    });
    if (error) return { status: "unavailable" };
    const result = exchangeResultSchema.safeParse(data);
    if (!result.success || result.data.status !== "created") return { status: "unavailable" };
    return { status: "ready", continuation };
  } catch {
    return { status: "unavailable" };
  }
}

export async function acceptInvitationContinuation(rawContinuation: string): Promise<InvitationContinuationAcceptance> {
  const continuationDigestHex = canonicalDigest(rawContinuation);
  if (!continuationDigestHex) return { status: "unavailable" };
  try {
    const client = await createClient();
    const identity = await client.auth.getUser();
    if (identity.error || !identity.data.user) return { status: "unavailable" };
    const { data, error } = await client.rpc("onboarding_accept_invitation_continuation", {
      input: { continuation_digest_hex: continuationDigestHex },
    });
    if (error) return { status: "unavailable" };
    const result = acceptanceResultSchema.safeParse(data);
    return result.success ? result.data : { status: "retryable_failure" };
  } catch {
    return { status: "retryable_failure" };
  }
}

