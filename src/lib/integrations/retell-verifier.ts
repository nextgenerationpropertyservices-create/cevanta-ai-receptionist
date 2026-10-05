import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const RETELL_MAX_BODY_BYTES = 64 * 1024;
export const RETELL_SIGNATURE_WINDOW_MS = 5 * 60 * 1000;

const safeLeadFields = z.object({
  lead_name: z.string().trim().min(1).max(160).optional(),
  customer_name: z.string().trim().min(1).max(160).optional(),
  name: z.string().trim().min(1).max(160).optional(),
  lead_phone: z.string().trim().min(1).max(40).optional(),
  phone: z.string().trim().min(1).max(40).optional(),
  lead_email: z.string().trim().email().max(254).optional(),
  email: z.string().trim().email().max(254).optional(),
  service_type: z.string().trim().min(1).max(120).optional(),
  issue_summary: z.string().trim().min(1).max(1000).optional(),
  preferred_time: z.string().trim().min(1).max(120).optional(),
  address: z.string().trim().min(1).max(200).optional(),
  urgency: z.enum(["normal", "high", "urgent"]).optional(),
  priority: z.enum(["normal", "high", "urgent"]).optional(),
}).passthrough();

const envelope = z.object({
  event: z.literal("call_analyzed"),
  call: z.object({
    call_id: z.string().regex(/^call_[A-Za-z0-9_-]{1,128}$/),
    agent_id: z.string().regex(/^agent_[A-Za-z0-9_-]{1,128}$/),
    agent_version: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
    call_analysis: z.object({
      custom_analysis_data: safeLeadFields.optional(),
    }).passthrough().optional(),
  }).passthrough(),
}).passthrough();

export type RetellLeadDraft = {
  leadName: string;
  phone: string | null;
  email: string | null;
  description: string;
  priority: "normal" | "high" | "urgent";
};

export type RetellPrototypeResult =
  | { ok: false; reason: "unconfigured" | "oversized" | "invalid_signature" | "invalid_payload" }
  | { ok: true; metadata: {
      schemaVersion: "retell-ingress-prototype-v1";
      event: "call_analyzed";
      callReference: string;
      agentReference: string;
      agentVersion: number | null;
      signatureDeliveredAt: string;
      receivedAt: string;
      verifiedAt: string;
      leadDraft: RetellLeadDraft;
    } };

function firstText(...values: (string | undefined)[]) {
  return values.map(value => value?.trim()).find(Boolean) ?? null;
}

function leadDraft(callReference: string, fields: z.infer<typeof safeLeadFields> | undefined): RetellLeadDraft {
  const name = firstText(fields?.lead_name, fields?.customer_name, fields?.name) ?? "AI receptionist call";
  const phone = firstText(fields?.lead_phone, fields?.phone);
  const email = firstText(fields?.lead_email, fields?.email);
  const service = firstText(fields?.service_type);
  const summary = firstText(fields?.issue_summary) ?? "Call analyzed by AI receptionist for office review.";
  const preferred = firstText(fields?.preferred_time);
  const address = firstText(fields?.address);
  const priority = fields?.priority ?? fields?.urgency ?? "normal";
  const parts = [
    "AI receptionist call for office review.",
    `Call reference: ${callReference}.`,
    service ? `Service: ${service}.` : null,
    `Summary: ${summary}`,
    preferred ? `Preferred time: ${preferred}.` : null,
    address ? `Address: ${address}.` : null,
  ].filter((part): part is string => Boolean(part));
  return { leadName: name, phone, email, priority, description: parts.join("\n") };
}

/** Official algorithm: https://docs.retellai.com/features/secure-webhook
 * HMAC-SHA256(raw UTF-8 body + canonical Unix-ms timestamp, webhook API key).
 * Freshness bounds delivery age; it does not deduplicate events within the window.
 */
export function verifyRetellPrototype(
  rawBody: Uint8Array,
  signature: string | null,
  secret: string | undefined,
  receivedAtMs: number,
  verifiedAtMs: number = receivedAtMs,
): RetellPrototypeResult {
  if (!secret?.trim()) return { ok: false, reason: "unconfigured" };
  if (rawBody.byteLength > RETELL_MAX_BODY_BYTES) return { ok: false, reason: "oversized" };
  const match = signature && /^v=([1-9]\d{0,15}),d=([a-f0-9]{64})$/i.exec(signature);
  const deliveredAtMs = match ? Number(match[1]) : NaN;
  if (!match || !Number.isSafeInteger(deliveredAtMs) || !Number.isSafeInteger(receivedAtMs)
    || receivedAtMs < 0 || receivedAtMs > 8.64e15 || deliveredAtMs > 8.64e15
    || !Number.isSafeInteger(verifiedAtMs) || verifiedAtMs < receivedAtMs || verifiedAtMs > 8.64e15
    || Math.abs(verifiedAtMs - deliveredAtMs) > RETELL_SIGNATURE_WINDOW_MS) {
    return { ok: false, reason: "invalid_signature" };
  }
  const expected = createHmac("sha256", secret).update(rawBody).update(match[1], "utf8").digest();
  if (!timingSafeEqual(expected, Buffer.from(match[2], "hex"))) return { ok: false, reason: "invalid_signature" };
  try {
    // Reject invalid UTF-8 rather than substituting replacement characters.
    const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(rawBody);
    const parsed = envelope.safeParse(JSON.parse(text));
    if (!parsed.success) return { ok: false, reason: "invalid_payload" };
    return { ok: true, metadata: {
      schemaVersion: "retell-ingress-prototype-v1",
      event: parsed.data.event,
      callReference: parsed.data.call.call_id,
      agentReference: parsed.data.call.agent_id,
      agentVersion: parsed.data.call.agent_version ?? null,
      signatureDeliveredAt: new Date(deliveredAtMs).toISOString(),
      receivedAt: new Date(receivedAtMs).toISOString(),
      verifiedAt: new Date(verifiedAtMs).toISOString(),
      leadDraft: leadDraft(parsed.data.call.call_id, parsed.data.call.call_analysis?.custom_analysis_data),
    } };
  } catch {
    return { ok: false, reason: "invalid_payload" };
  }
}
