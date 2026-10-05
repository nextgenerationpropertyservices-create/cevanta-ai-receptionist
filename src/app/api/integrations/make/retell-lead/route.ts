import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64 * 1024;
const SIGNATURE_WINDOW_MS = 5 * 60 * 1000;
const READ_DEADLINE_MS = 5000;

const connectionIdSchema = z.uuid();
const leadFields = z.object({
  lead_name: z.string().trim().min(1).max(160).optional(),
  customer_name: z.string().trim().min(1).max(160).optional(),
  name: z.string().trim().min(1).max(160).optional(),
  caller_name: z.string().trim().min(1).max(160).optional(),
  lead_phone: z.string().trim().min(1).max(40).optional(),
  phone: z.string().trim().min(1).max(40).optional(),
  caller_phone: z.string().trim().min(1).max(40).optional(),
  lead_email: z.string().trim().email().max(254).optional(),
  email: z.string().trim().email().max(254).optional(),
  service_type: z.string().trim().min(1).max(120).optional(),
  issue_summary: z.string().trim().min(1).max(1000).optional(),
  call_summary: z.string().trim().min(1).max(1000).optional(),
  preferred_time: z.string().trim().min(1).max(120).optional(),
  preferred_appointment_time: z.string().trim().min(1).max(120).optional(),
  address: z.string().trim().min(1).max(200).optional(),
  service_address: z.string().trim().min(1).max(200).optional(),
  urgency: z.enum(["normal", "high", "urgent", "Normal", "Urgent", "Emergency"]).optional(),
  priority: z.enum(["normal", "high", "urgent"]).optional(),
}).passthrough();

const envelope = z.object({
  event: z.literal("retell_call_analyzed"),
  call_id: z.string().regex(/^call_[A-Za-z0-9_-]{1,128}$/),
  agent_id: z.string().regex(/^agent_[A-Za-z0-9_-]{1,128}$/),
  lead: leadFields.optional(),
}).passthrough();

const ingestResponse = z.discriminatedUnion("status", [
  z.object({ status: z.literal("applied"), tenant_id: z.uuid(), lead_id: z.uuid() }),
  z.object({ status: z.literal("duplicate"), tenant_id: z.uuid(), lead_id: z.uuid() }),
  z.object({ status: z.literal("validation_error") }),
  z.object({ status: z.literal("unmapped_tenant") }),
  z.object({ status: z.literal("retryable_failure") }),
]);

function response(status: number, result: string, persisted = false) {
  return Response.json({ status: result, persisted, bookingCreated: false }, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function ingressEnabled() {
  if (process.env.MAKE_RETELL_INGRESS_ENABLED !== "enabled") return false;
  if (process.env.NODE_ENV === "production") return process.env.MAKE_RETELL_INGRESS_PRODUCTION === "enabled";
  return true;
}

function writerEnabled() {
  return process.env.MAKE_RETELL_INGRESS_LEAD_WRITER === "enabled";
}

function firstText(...values: (string | undefined)[]) {
  return values.map(value => value?.trim()).find(Boolean) ?? null;
}

function normalizePriority(fields: z.infer<typeof leadFields> | undefined): "normal" | "high" | "urgent" {
  const value = fields?.priority ?? fields?.urgency;
  if (value === "urgent" || value === "Urgent" || value === "Emergency") return "urgent";
  if (value === "high") return "high";
  return "normal";
}

function leadDraft(callId: string, fields: z.infer<typeof leadFields> | undefined) {
  const leadName = firstText(fields?.lead_name, fields?.customer_name, fields?.caller_name, fields?.name) ?? "AI receptionist call";
  const phone = firstText(fields?.lead_phone, fields?.caller_phone, fields?.phone);
  const email = firstText(fields?.lead_email, fields?.email);
  const service = firstText(fields?.service_type);
  const summary = firstText(fields?.issue_summary, fields?.call_summary) ?? "Call analyzed by AI receptionist for office review.";
  const preferred = firstText(fields?.preferred_time, fields?.preferred_appointment_time);
  const address = firstText(fields?.address, fields?.service_address);
  const parts = [
    "AI receptionist call for office review.",
    `Call reference: ${callId}.`,
    service ? `Service: ${service}.` : null,
    `Summary: ${summary}`,
    preferred ? `Preferred time: ${preferred}.` : null,
    address ? `Address: ${address}.` : null,
  ].filter((part): part is string => Boolean(part));
  return { leadName, phone, email, priority: normalizePriority(fields), description: parts.join("\n") };
}

function verifyMakeSignature(rawBody: Uint8Array, signature: string | null, secret: string | undefined, verifiedAtMs: number) {
  if (!secret?.trim()) return false;
  const match = signature && /^v=([1-9]\d{0,15}),d=([a-f0-9]{64})$/i.exec(signature);
  const deliveredAtMs = match ? Number(match[1]) : NaN;
  if (!match || !Number.isSafeInteger(deliveredAtMs) || Math.abs(verifiedAtMs - deliveredAtMs) > SIGNATURE_WINDOW_MS) return false;
  const expected = createHmac("sha256", secret).update(rawBody).update(match[1], "utf8").digest();
  return timingSafeEqual(expected, Buffer.from(match[2], "hex"));
}

async function readBody(request: Request) {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) return { error: response(413, "payload_too_large") };
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try { reader = request.body?.getReader(); } catch { return { error: response(400, "invalid_request") }; }
  if (!reader) return { error: response(400, "invalid_request") };
  const started = performance.now();
  const chunks: Uint8Array[] = [];
  let length = 0;
  let completed = false;
  try {
    while (true) {
      if (performance.now() - started >= READ_DEADLINE_MS) return { error: response(408, "request_timeout") };
      const { done, value } = await reader.read();
      if (done) { completed = true; break; }
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) return { error: response(413, "payload_too_large") };
      chunks.push(value);
    }
    return { body: Buffer.concat(chunks) };
  } catch {
    return { error: response(400, "invalid_request") };
  } finally {
    if (!completed) {
      try { void reader.cancel().catch(() => {}); } catch { /* No payload/error logging. */ }
    }
    try { reader.releaseLock(); } catch { /* Best effort. */ }
  }
}

async function persistLead(parsed: z.infer<typeof envelope>) {
  const connection = connectionIdSchema.safeParse(process.env.MAKE_RETELL_INGRESS_CONNECTION_ID);
  if (!connection.success) return response(503, "unconfigured");
  const draft = leadDraft(parsed.call_id, parsed.lead);
  const payload = {
    connection_id: connection.data,
    provider_account_id: parsed.agent_id,
    provider_event_id: `call_analyzed:${parsed.call_id}`,
    provider_call_id: parsed.call_id,
    lead_name: draft.leadName,
    lead_phone: draft.phone,
    lead_email: draft.email,
    lead_description: draft.description,
    lead_priority: draft.priority,
  };
  try {
    const { data, error } = await createServiceClient().rpc("ingest_retell_call_lead", { input: payload });
    if (error) return response(503, "retryable_failure");
    const result = ingestResponse.safeParse(data);
    if (!result.success) return response(503, "retryable_failure");
    if (result.data.status === "applied") return response(200, "lead_created", true);
    if (result.data.status === "duplicate") return response(200, "duplicate", true);
    if (result.data.status === "unmapped_tenant") return response(202, "unmapped_tenant");
    if (result.data.status === "validation_error") return response(400, "rejected");
    return response(503, "retryable_failure");
  } catch {
    return response(503, "retryable_failure");
  }
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed();
  if (!ingressEnabled()) return response(404, "disabled");
  if (request.headers.get("content-encoding") && request.headers.get("content-encoding") !== "identity") return response(415, "unsupported_media_type");
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return response(415, "unsupported_media_type");
  const read = await readBody(request);
  if (read.error) return read.error;
  const rawBody = read.body!;
  if (!verifyMakeSignature(rawBody, request.headers.get("x-cevanta-make-signature"), process.env.MAKE_RETELL_INGRESS_SECRET, Date.now())) {
    return response(401, "rejected");
  }
  let input: unknown;
  try {
    const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(rawBody);
    input = JSON.parse(text);
  } catch {
    return response(400, "rejected");
  }
  const parsed = envelope.safeParse(input);
  if (!parsed.success) return response(400, "rejected");
  if (!writerEnabled()) return response(200, "verified_not_persisted");
  return persistLead(parsed.data);
}

function methodNotAllowed() {
  return new Response(null, { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } });
}

export const GET = methodNotAllowed;
export const HEAD = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const OPTIONS = methodNotAllowed;

