import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/integrations/retell/route";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => ({ rpc: mocks.rpc }) }));

const secret = "fictional-retell-writer-secret";
const now = Date.parse("2030-01-01T00:00:00Z");
const connection = "49000000-0000-4000-8002-000000000001";
const lead = "49000000-0000-4000-8003-000000000001";
const tenant = "49000000-0000-4000-8000-000000000001";
const payload = {
  event: "call_analyzed",
  tenant_id: "forged-tenant-id",
  call: {
    call_id: "call_fictional_writer_001",
    agent_id: "agent_fictional_writer",
    transcript: "fictional-sensitive-transcript",
    recording_url: "https://recording.example.invalid/private",
    call_analysis: { custom_analysis_data: {
      lead_name: "Fictional Caller",
      lead_phone: "+15550000007",
      lead_email: "caller@example.invalid",
      service_type: "No heat",
      issue_summary: "Furnace stopped overnight",
      preferred_time: "Tomorrow morning",
      address: "123 Fictional Street",
      priority: "urgent",
    } },
  },
};
const body = JSON.stringify(payload);
const sign = (value = body, at = now) => `v=${at},d=${createHmac("sha256", secret).update(value).update(String(at)).digest("hex")}`;
const request = (value = body, signature: string | null = sign(value)) => new Request("http://localhost/api/integrations/retell", {
  method: "POST",
  body: value,
  headers: { "content-type": "application/json", ...(signature ? { "x-retell-signature": signature } : {}) },
});

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("RETELL_INGRESS_PROTOTYPE", "enabled");
  vi.stubEnv("RETELL_INGRESS_TEST_SECRET", secret);
  vi.stubEnv("RETELL_INGRESS_LEAD_WRITER", "enabled");
  vi.stubEnv("RETELL_INGRESS_CONNECTION_ID", connection);
  vi.spyOn(Date, "now").mockReturnValue(now);
  mocks.rpc.mockReset();
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("Retell lead writer gate", () => {
  it("stays verifier-only unless writer mode is explicitly enabled", async () => {
    vi.stubEnv("RETELL_INGRESS_LEAD_WRITER", "");
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "verified_not_persisted", persisted: false, bookingCreated: false });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("persists a safe lead draft through the RPC without payload tenant, transcript or recording", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { status: "applied", tenant_id: tenant, lead_id: lead }, error: null });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "lead_created", persisted: true, bookingCreated: false });
    expect(mocks.rpc).toHaveBeenCalledWith("ingest_retell_call_lead", { input: {
      connection_id: connection,
      provider_account_id: "agent_fictional_writer",
      provider_event_id: "call_analyzed:call_fictional_writer_001",
      provider_call_id: "call_fictional_writer_001",
      lead_name: "Fictional Caller",
      lead_phone: "+15550000007",
      lead_email: "caller@example.invalid",
      lead_description: expect.stringContaining("AI receptionist call for office review."),
      lead_priority: "urgent",
    } });
    const sent = mocks.rpc.mock.calls[0][1].input;
    expect(JSON.stringify(sent)).not.toContain("forged-tenant-id");
    expect(JSON.stringify(sent)).not.toContain("fictional-sensitive-transcript");
    expect(JSON.stringify(sent)).not.toContain("recording.example.invalid");
  });
  it("returns duplicate success without creating booking promises", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { status: "duplicate", tenant_id: tenant, lead_id: lead }, error: null });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "duplicate", persisted: true, bookingCreated: false });
  });
  it.each([
    [{ status: "unmapped_tenant" }, 202, { status: "unmapped_tenant", persisted: false, bookingCreated: false }],
    [{ status: "validation_error" }, 400, { status: "rejected", persisted: false, bookingCreated: false }],
    [{ status: "retryable_failure" }, 503, { status: "retryable_failure", persisted: false, bookingCreated: false }],
  ])("maps RPC status %# safely", async (data, status, body) => {
    mocks.rpc.mockResolvedValueOnce({ data, error: null });
    const response = await POST(request());
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual(body);
  });
  it("does not call RPC for bad signatures or unsupported events", async () => {
    expect((await POST(request(body, null))).status).toBe(401);
    const unsupported = JSON.stringify({ ...payload, event: "call_started" });
    expect((await POST(request(unsupported, sign(unsupported)))).status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("fails safely when writer config is incomplete or RPC errors", async () => {
    vi.stubEnv("RETELL_INGRESS_CONNECTION_ID", "bad");
    expect(await (await POST(request())).json()).toEqual({ status: "unconfigured", persisted: false, bookingCreated: false });
    vi.stubEnv("RETELL_INGRESS_CONNECTION_ID", connection);
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: "fictional-private-db-error" } });
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("fictional-private-db-error");
  });
});

