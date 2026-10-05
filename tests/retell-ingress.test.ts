import { createHmac, webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RETELL_MAX_BODY_BYTES, RETELL_SIGNATURE_WINDOW_MS, verifyRetellPrototype } from "@/lib/integrations/retell-verifier";
import { POST, GET, HEAD, PUT, PATCH, DELETE, OPTIONS } from "@/app/api/integrations/retell/route";

const secret = "fictional-retell-test-secret-not-a-provider-key";
const now = Date.parse("2030-01-01T00:00:00Z");
const payload = { event: "call_analyzed", call: { call_id: "call_fictional_01", agent_id: "agent_fictional_01", agent_version: 3 } };
const body = JSON.stringify(payload);
const bytes = (value: string) => new TextEncoder().encode(value);
const sign = (value: string | Uint8Array = body, at = now, key = secret) => `v=${at},d=${createHmac("sha256", key).update(value).update(String(at)).digest("hex")}`;
const check = (value = body, signature: string | null = sign(value), key: string | undefined = secret, clock = now) => verifyRetellPrototype(bytes(value), signature, key, clock);
const request = (value = body, signature: string | null = sign(value), extra: Record<string, string> = {}) => new Request("http://localhost/api/integrations/retell", {
  method: "POST", body: value, headers: { "content-type": "application/json", ...(signature === null ? {} : { "x-retell-signature": signature }), ...extra },
});

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("RETELL_INGRESS_PROTOTYPE", "enabled");
  vi.stubEnv("RETELL_INGRESS_TEST_SECRET", secret);
  vi.spyOn(Date, "now").mockReturnValue(now);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("Retell original-body signature and safe envelope", () => {
  it("agrees with independent WebCrypto signing using the official concatenation", async () => {
    const key = await webcrypto.subtle.importKey("raw", bytes(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const digest = Buffer.from(await webcrypto.subtle.sign("HMAC", key, bytes(body + now))).toString("hex");
    expect(check(body, `v=${now},d=${digest}`).ok).toBe(true);
  });
  it("returns only explicitly allowlisted metadata without invented tenant/event time", () => {
    const raw = JSON.stringify({ ...payload, tenant_id: "fictional_untrusted_tenant", evaluatedAt: "1900-01-01", call: { ...payload.call, transcript: "fictional-sensitive-marker", recording_url: "fictional-sensitive-marker", call_analysis: { arbitrary: true }, start_timestamp: 1 } });
    expect(check(raw)).toEqual({ ok: true, metadata: { schemaVersion: "retell-ingress-prototype-v1", event: "call_analyzed", callReference: "call_fictional_01", agentReference: "agent_fictional_01", agentVersion: 3, leadDraft: { leadName: "AI receptionist call", phone: null, email: null, description: "AI receptionist call for office review.\nCall reference: call_fictional_01.\nSummary: Call analyzed by AI receptionist for office review.", priority: "normal" }, signatureDeliveredAt: "2030-01-01T00:00:00.000Z", receivedAt: "2030-01-01T00:00:00.000Z", verifiedAt: "2030-01-01T00:00:00.000Z" } });
  });
  it("accepts original whitespace/order/unicode but rejects reserialization", () => {
    const raw = '{ "call": {"agent_id":"agent_fictional_01","call_id":"call_fictional_01","ignored":"fictional café"}, "event":"call_analyzed" }';
    expect(check(raw).ok).toBe(true);
    expect(check(JSON.stringify(JSON.parse(raw)), sign(raw))).toEqual({ ok: false, reason: "invalid_signature" });
  });
  it.each([null, "", "invalid", `v=${now},d=00`, `v=${now},d=${"g".repeat(64)}`, `${sign()},v=${now}`, ` ${sign()}`, `v=0${now},d=${"0".repeat(64)}`, `v=9999999999999999,d=${"0".repeat(64)}`])("rejects malformed signature %s", signature => {
    expect(check(body, signature)).toEqual({ ok: false, reason: "invalid_signature" });
  });
  it.each([-RETELL_SIGNATURE_WINDOW_MS - 1, RETELL_SIGNATURE_WINDOW_MS + 1])("rejects stale/future signed timestamp %i", delta => {
    expect(check(body, sign(body, now + delta))).toEqual({ ok: false, reason: "invalid_signature" });
  });
  it.each([-RETELL_SIGNATURE_WINDOW_MS, RETELL_SIGNATURE_WINDOW_MS])("accepts exact official window boundary %i", delta => {
    expect(check(body, sign(body, now + delta)).ok).toBe(true);
  });
  it.each([NaN, Infinity, -1, 1.5, 9e15])("rejects invalid execution clock %s", clock => {
    expect(check(body, sign(), secret, clock).ok).toBe(false);
  });
  it("rejects wrong key and altered timestamp/body", () => {
    expect(check(body, sign(body, now, "fictional-wrong-key")).ok).toBe(false);
    expect(check(body, sign().replace(String(now), String(now + 1))).ok).toBe(false);
    expect(check(body + " ", sign()).ok).toBe(false);
  });
  it.each([undefined, "", " "]) ("rejects unconfigured secret", key => {
    expect(verifyRetellPrototype(bytes(body), sign(), key, now)).toEqual({ ok: false, reason: "unconfigured" });
  });
  it.each(["{", "null", "[]", JSON.stringify({ event: "call_ended", call: payload.call }), JSON.stringify({ event: "call_analyzed" }), JSON.stringify({ event: "call_analyzed", call: {} }), JSON.stringify({ ...payload, call: { ...payload.call, call_id: "" } }), JSON.stringify({ ...payload, call: { ...payload.call, agent_id: 123 } }), JSON.stringify({ ...payload, call: { ...payload.call, agent_version: "3" } })])("rejects signed malformed/unsupported envelope %#", raw => {
    expect(check(raw)).toEqual({ ok: false, reason: "invalid_payload" });
  });
  it("rejects signed invalid UTF-8 and oversized bytes", () => {
    const raw = new Uint8Array([0xff]);
    expect(verifyRetellPrototype(raw, sign(raw), secret, now)).toEqual({ ok: false, reason: "invalid_payload" });
    expect(check(" ".repeat(RETELL_MAX_BODY_BYTES + 1))).toEqual({ ok: false, reason: "oversized" });
  });
  it("reports unavailable agent revision instead of inferring editor version", () => {
    const result = check(JSON.stringify({ event: "call_analyzed", call: { call_id: "call_fictional_01", agent_id: "agent_fictional_01" } }));
    expect(result.ok && result.metadata.agentVersion).toBe(null);
  });
});

it("checks freshness after body arrival and keeps clock meanings separate", () => {
  expect(verifyRetellPrototype(bytes(body), sign(), secret, now, now + RETELL_SIGNATURE_WINDOW_MS + 1).ok).toBe(false);
  const result = verifyRetellPrototype(bytes(body), sign(), secret, now, now + 1000);
  expect(result.ok && result.metadata.receivedAt).toBe("2030-01-01T00:00:00.000Z");
  expect(result.ok && result.metadata.verifiedAt).toBe("2030-01-01T00:00:01.000Z");
});

describe("actual no-writer route", () => {
  it("returns explicit no-persistence/no-booking result without private metadata", async () => {
    const result = await POST(request());
    expect(result.status).toBe(200);
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(await result.json()).toEqual({ status: "verified_not_persisted", persisted: false, bookingCreated: false });
  });
  it.each([GET, HEAD, PUT, PATCH, DELETE, OPTIONS])("rejects non-POST methods %#", handler => {
    const result = handler(); expect(result.status).toBe(405); expect(result.headers.get("allow")).toBe("POST");
  });
  it("defends POST handler against direct invocation with another method", async () => {
    expect((await POST(new Request("http://localhost", { method: "GET" }))).status).toBe(405);
  });
  it.each(["", "disabled"]) ("stays disabled without explicit opt-in %s", setting => {
    vi.stubEnv("RETELL_INGRESS_PROTOTYPE", setting);
    return expect(POST(request()).then(result => result.status)).resolves.toBe(404);
  });
  it("stays disabled in production without the production gate", async () => {
    vi.stubEnv("NODE_ENV", "production"); expect((await POST(request())).status).toBe(404);
  });
  it("can verify in production only when the production gate is explicit", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RETELL_INGRESS_PRODUCTION", "enabled");
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "verified_not_persisted", persisted: false, bookingCreated: false });
  });
  it("does not consume the body when disabled or unconfigured", async () => {
    vi.stubEnv("RETELL_INGRESS_TEST_SECRET", "");
    const input = request(); expect((await POST(input)).status).toBe(503); expect(input.bodyUsed).toBe(false);
  });
  it("rejects missing signature and signed malformed JSON safely", async () => {
    expect((await POST(request(body, null))).status).toBe(401);
    expect((await POST(request("{"))).status).toBe(400);
  });
  it.each<Record<string, string>>([{ "content-type": "text/plain" }, { "content-encoding": "gzip" }])("rejects unsupported representation %#", async headers => {
    expect((await POST(request(body, sign(), headers))).status).toBe(415);
  });
  it("bounds actual body without trusting content length", async () => {
    const raw = " ".repeat(RETELL_MAX_BODY_BYTES + 1);
    expect((await POST(request(raw, sign(raw), { "content-length": "1" }))).status).toBe(413);
    expect((await POST(request(body, sign(), { "content-length": String(RETELL_MAX_BODY_BYTES + 1) }))).status).toBe(413);
  });
  it("bounds a chunked stream and cancels before reading the rest", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(RETELL_MAX_BODY_BYTES)); controller.enqueue(new Uint8Array(1)); }, cancel });
    const input = new Request("http://localhost", { method: "POST", body: stream, duplex: "half", headers: { "content-type": "application/json" } } as RequestInit);
    expect((await POST(input)).status).toBe(413); expect(cancel).toHaveBeenCalledOnce();
  });
  it("keeps stream failures generic and does not log payload/errors", async () => {
    const errorSpy = vi.spyOn(console, "error"); const logSpy = vi.spyOn(console, "log"); const warnSpy = vi.spyOn(console, "warn");
    const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error("fictional-sensitive-marker")); } });
    const input = new Request("http://localhost", { method: "POST", body: stream, duplex: "half", headers: { "content-type": "application/json" } } as RequestInit);
    const result = await POST(input); expect(result.status).toBe(400);
    expect(await result.text()).not.toContain("fictional-sensitive-marker");
    await POST(request()); await POST(request(body, null));
    expect(errorSpy).not.toHaveBeenCalled(); expect(logSpy).not.toHaveBeenCalled(); expect(warnSpy).not.toHaveBeenCalled();
  });
  it("does not claim durable replay suppression", async () => {
    for (let attempt = 0; attempt < 2; attempt++) expect(await (await POST(request())).json()).toEqual({ status: "verified_not_persisted", persisted: false, bookingCreated: false });
  });
});

