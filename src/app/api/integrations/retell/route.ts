import { z } from "zod";
import { RETELL_MAX_BODY_BYTES, verifyRetellPrototype } from "@/lib/integrations/retell-verifier";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

// Local read budget only; edge buffering, rate and distributed concurrency remain
// separate hosting gates. A total deadline must not reset for each chunk.
const READ_DEADLINE_MS = 5000;
const connectionIdSchema = z.uuid();
const ingestResponse = z.discriminatedUnion("status", [
  z.object({ status: z.literal("applied"), tenant_id: z.uuid(), lead_id: z.uuid() }),
  z.object({ status: z.literal("duplicate"), tenant_id: z.uuid(), lead_id: z.uuid() }),
  z.object({ status: z.literal("validation_error") }),
  z.object({ status: z.literal("unmapped_tenant") }),
  z.object({ status: z.literal("retryable_failure") }),
]);

function response(status: number, result: string, persisted = false) {
  return Response.json({ status: result, persisted, bookingCreated: false }, {
    status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function writerEnabled() {
  return process.env.RETELL_INGRESS_LEAD_WRITER === "enabled";
}

async function persistLead(result: Extract<ReturnType<typeof verifyRetellPrototype>, { ok: true }>) {
  const connection = connectionIdSchema.safeParse(process.env.RETELL_INGRESS_CONNECTION_ID);
  if (!connection.success) return response(503, "unconfigured");
  const payload = {
    connection_id: connection.data,
    provider_account_id: result.metadata.agentReference,
    provider_event_id: `${result.metadata.event}:${result.metadata.callReference}`,
    provider_call_id: result.metadata.callReference,
    lead_name: result.metadata.leadDraft.leadName,
    lead_phone: result.metadata.leadDraft.phone,
    lead_email: result.metadata.leadDraft.email,
    lead_description: result.metadata.leadDraft.description,
    lead_priority: result.metadata.leadDraft.priority,
  };
  try {
    const { data, error } = await createServiceClient().rpc("ingest_retell_call_lead", { input: payload });
    if (error) return response(503, "retryable_failure");
    const parsed = ingestResponse.safeParse(data);
    if (!parsed.success) return response(503, "retryable_failure");
    if (parsed.data.status === "applied") return response(200, "lead_created", true);
    if (parsed.data.status === "duplicate") return response(200, "duplicate", true);
    if (parsed.data.status === "unmapped_tenant") return response(202, "unmapped_tenant");
    if (parsed.data.status === "validation_error") return response(400, "rejected");
    return response(503, "retryable_failure");
  } catch {
    return response(503, "retryable_failure");
  }
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed();
  // Local fictional-secret prototype only. No real Retell key or connection is read unless the reviewed writer gate is enabled.
  if (process.env.NODE_ENV === "production" || process.env.RETELL_INGRESS_PROTOTYPE !== "enabled") {
    return response(404, "disabled");
  }
  const secret = process.env.RETELL_INGRESS_TEST_SECRET;
  if (!secret?.trim()) return response(503, "unconfigured");
  const receivedAtMs = Date.now(); // Trusted execution clock, never a payload field.
  if (request.headers.get("content-encoding") && request.headers.get("content-encoding") !== "identity") {
    return response(415, "unsupported_media_type");
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return response(415, "unsupported_media_type");
  }
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > RETELL_MAX_BODY_BYTES)) {
    return response(413, "payload_too_large");
  }
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try { reader = request.body?.getReader(); } catch { return response(400, "invalid_request"); }
  if (!reader) return response(400, "invalid_request");
  const started = performance.now();
  let timedOut = false;
  let aborted = request.signal.aborted;
  let stopRead: () => void = () => {};
  const stopped = new Promise<never>((_resolve, reject) => {
    stopRead = () => reject(new Error("Read stopped."));
  });
  const onAbort = () => { aborted = true; stopRead(); };
  const timer = setTimeout(() => { timedOut = true; stopRead(); }, READ_DEADLINE_MS);
  request.signal.addEventListener("abort", onAbort, { once: true });
  let completed = false;
  try {
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      if (aborted || request.signal.aborted) return response(400, "invalid_request");
      if (performance.now() - started >= READ_DEADLINE_MS) return response(408, "request_timeout");
      const { done, value } = await Promise.race([reader.read(), stopped]);
      if (aborted || request.signal.aborted) return response(400, "invalid_request");
      if (timedOut || performance.now() - started >= READ_DEADLINE_MS) return response(408, "request_timeout");
      if (done) { completed = true; break; }
      length += value.byteLength;
      if (length > RETELL_MAX_BODY_BYTES) {
        return response(413, "payload_too_large");
      }
      chunks.push(value);
    }
    const result = verifyRetellPrototype(Buffer.concat(chunks), request.headers.get("x-retell-signature"), secret, receivedAtMs, Date.now());
    if (!result.ok) {
      return response(result.reason === "invalid_signature" ? 401 : 400, "rejected");
    }
    if (writerEnabled()) return persistLead(result);
    // Do not echo even authenticated opaque identifiers to the sender. No logging,
    // persistence, booking, tenant routing, extraction validation or external call in default mode.
    return response(200, "verified_not_persisted");
  } catch {
    return response(timedOut ? 408 : 400, timedOut ? "request_timeout" : "invalid_request");
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", onAbort);
    // Never await an arbitrary underlying source's cancellation promise: it can
    // reject or remain pending forever. Initiate cancellation and absorb failure.
    if (!completed) {
      try { void reader.cancel().catch(() => {}); } catch { /* No payload/error logging. */ }
    }
    try { reader.releaseLock(); } catch { /* Best effort if an adapter retains a read. */ }
  }
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
