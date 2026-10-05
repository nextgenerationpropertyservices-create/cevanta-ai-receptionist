import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/integrations/retell/route";

const secret = "fictional-budget-test-key";
const body = new TextEncoder().encode(JSON.stringify({ event: "call_analyzed", call: { call_id: "call_fictional_budget", agent_id: "agent_fictional_budget" } }));
function request(stream: ReadableStream<Uint8Array>, signal?: AbortSignal) {
  const now = Date.now();
  const signature = `v=${now},d=${createHmac("sha256", secret).update(body).update(String(now)).digest("hex")}`;
  return new Request("http://localhost/api/integrations/retell", { method: "POST", body: stream, signal, duplex: "half", headers: { "content-type": "application/json", "x-retell-signature": signature } } as RequestInit);
}
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test"); vi.stubEnv("RETELL_INGRESS_PROTOTYPE", "enabled"); vi.stubEnv("RETELL_INGRESS_TEST_SECRET", secret);
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("total local Retell raw-read budget", () => {
  it("terminates a never-ending read at five seconds, cancels and releases stream", async () => {
    const cancel = vi.fn(); const stream = new ReadableStream<Uint8Array>({ cancel });
    let finished = false; const pending = POST(request(stream)).then(result => { finished = true; return result; });
    await vi.advanceTimersByTimeAsync(4999); expect(finished).toBe(false);
    await vi.advanceTimersByTimeAsync(1); const result = await pending;
    expect(result.status).toBe(408); expect(await result.json()).toEqual({ status: "request_timeout", persisted: false, bookingCreated: false });
    expect(cancel).toHaveBeenCalledOnce(); expect(stream.locked).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
  it("does not reset deadline after slow chunks", async () => {
    let controller!: ReadableStreamDefaultController<Uint8Array>; const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ start(value) { controller = value; }, cancel });
    const pending = POST(request(stream));
    await vi.advanceTimersByTimeAsync(3000); controller.enqueue(body.slice(0, 10));
    await vi.advanceTimersByTimeAsync(2000); expect((await pending).status).toBe(408); expect(cancel).toHaveBeenCalledOnce();
  });
  it.each(["reject", "hang"])("does not await %s cancellation", async mode => {
    const cancel = vi.fn(() => mode === "hang" ? new Promise<void>(() => {}) : Promise.reject(new Error("fictional-sensitive-marker")));
    const pending = POST(request(new ReadableStream<Uint8Array>({ cancel })));
    await vi.advanceTimersByTimeAsync(5000); expect((await pending).status).toBe(408); expect(cancel).toHaveBeenCalledOnce();
  });
  it("rejects oversized chunks without waiting for hung cancellation", async () => {
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(65537)); }, cancel });
    expect((await POST(request(stream))).status).toBe(413); expect(cancel).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
  });
  it("honors abort while reading and removes its listener", async () => {
    const abort = new AbortController();
    const cancel = vi.fn(); const input = request(new ReadableStream<Uint8Array>({ cancel }), abort.signal);
    const removeRequest = vi.spyOn(input.signal, "removeEventListener");
    const pending = POST(input); abort.abort();
    expect((await pending).status).toBe(400); expect(cancel).toHaveBeenCalledOnce(); expect(removeRequest).toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it("rejects an already aborted request without a read", async () => {
    const abort = new AbortController(); abort.abort(); const cancel = vi.fn();
    expect((await POST(request(new ReadableStream<Uint8Array>({ cancel }), abort.signal))).status).toBe(400); expect(cancel).toHaveBeenCalledOnce();
  });
  it("preserves valid fast bytes and clears timers", async () => {
    const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(body); controller.close(); } });
    expect(await (await POST(request(stream))).json()).toEqual({ status: "verified_not_persisted", persisted: false, bookingCreated: false });
    expect(vi.getTimerCount()).toBe(0); expect(stream.locked).toBe(false);
  });
  it("production does not acquire a reader or create a read timer", async () => {
    vi.stubEnv("NODE_ENV", "production"); const stream = new ReadableStream<Uint8Array>(); const input = request(stream);
    const getReader = vi.spyOn(stream, "getReader");
    expect((await POST(input)).status).toBe(404); expect(getReader).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it("timeout never echoes or logs sensitive cancellation details", async () => {
    const spies = ["log", "error", "warn", "info", "debug"].map(name => vi.spyOn(console, name as "log"));
    const pending = POST(request(new ReadableStream<Uint8Array>({ cancel() { return Promise.reject(new Error("fictional-sensitive-marker")); } })));
    await vi.advanceTimersByTimeAsync(5000); expect(await (await pending).text()).not.toContain("fictional-sensitive-marker");
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
  });
});
