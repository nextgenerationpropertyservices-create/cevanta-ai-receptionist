import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/integrations/make/retell-lead/route";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => ({ rpc: mocks.rpc }) }));

const secret = "fictional-make-bridge-secret";
const now = Date.parse("2030-01-01T00:00:00Z");
const connection = "49000000-0000-4000-8002-000000000001";
const lead = "49000000-0000-4000-8003-000000000001";
const tenant = "49000000-0000-4000-8000-000000000001";
const payload = {
  event: "retell_call_analyzed",
  tenant_id: "forged-tenant-id",
  transcript: "fictional-sensitive-transcript",
  recording_url: "https://recording.example.invalid/private",
  call_id: "call_make_bridge_001",
  agent_id: "agent_a9182cc8117ac588f68bc52a3d",
  lead: {
    caller_name: "Fictional Make Caller",
    caller_phone: "+15550100300",
    email: "make-caller@example.invalid",
    service_type: "No cooling",
    call_summary: "AC stopped cooling during a fictional bridge test.",
    preferred_appointment_time: "Tomorrow afternoon",
    service_address: "123 Fictional Bridge Street",
    urgency: "Routine",
  },
};
const body = JSON.stringify(payload);
const sign = (value = body, at = now) => `v=${at},d=${createHmac("sha256", secret).update(value).update(String(at)).digest("hex")}`;
const request = (value = body, signature: string | null = sign(value), headers: Record<string, string> = {}) => new Request("http://localhost/api/integrations/make/retell-lead", {
  method: "POST",
  body: value,
  headers: { "content-type": "application/json", ...(signature ? { "x-cevanta-make-signature": signature } : {}), ...headers },
});
const bearerRequest = (value = body, token = secret) => request(value, null, { authorization: `Bearer ${token}` });

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("MAKE_RETELL_INGRESS_ENABLED", "enabled");
  vi.stubEnv("MAKE_RETELL_INGRESS_SECRET", secret);
  vi.stubEnv("MAKE_RETELL_INGRESS_LEAD_WRITER", "enabled");
  vi.stubEnv("MAKE_RETELL_INGRESS_CONNECTION_ID", connection);
  vi.spyOn(Date, "now").mockReturnValue(now);
  mocks.rpc.mockReset();
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("Make Retell lead bridge", () => {
  it("stays disabled unless explicitly enabled", async () => {
    vi.stubEnv("MAKE_RETELL_INGRESS_ENABLED", "");
    const response = await POST(request());
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ status: "disabled", persisted: false, bookingCreated: false });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("keeps production disabled unless the production gate is explicit", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.rpc.mockResolvedValueOnce({ data: { status: "applied", tenant_id: tenant, lead_id: lead }, error: null });
    expect((await POST(request())).status).toBe(404);
    expect(mocks.rpc).not.toHaveBeenCalled();

    vi.stubEnv("MAKE_RETELL_INGRESS_PRODUCTION", "enabled");
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "lead_created", persisted: true, bookingCreated: false });
  });

  it("accepts signed payloads in verifier-only mode without persistence", async () => {
    vi.stubEnv("MAKE_RETELL_INGRESS_LEAD_WRITER", "");
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "verified_not_persisted", persisted: false, bookingCreated: false });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("accepts private Make app bearer authorization in verifier-only mode without persistence", async () => {
    vi.stubEnv("MAKE_RETELL_INGRESS_LEAD_WRITER", "");
    const response = await POST(bearerRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "verified_not_persisted", persisted: false, bookingCreated: false });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("treats blank optional Make fields as missing in verifier-only mode", async () => {
    vi.stubEnv("MAKE_RETELL_INGRESS_LEAD_WRITER", "");
    const blankOptionalPayload = JSON.stringify({
      ...payload,
      call_id: "call_make_bridge_blank_optional_001",
      lead: {
        caller_name: "",
        caller_phone: "+15550100301",
        service_type: "",
        call_summary: "The fictional caller gave service details in the summary only.",
        service_address: "",
        urgency: "",
        preferred_appointment_time: " ",
      },
    });
    const response = await POST(request(blankOptionalPayload, sign(blankOptionalPayload)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "verified_not_persisted", persisted: false, bookingCreated: false });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });


  it("rejects wrong private Make app bearer authorization before RPC", async () => {
    expect((await POST(bearerRequest(body, "wrong-fictional-token"))).status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects unsigned, stale, altered and unsupported payloads before RPC", async () => {
    expect((await POST(request(body, null))).status).toBe(401);
    expect((await POST(request(body, sign(body, now - 301_000)))).status).toBe(401);
    const altered = JSON.stringify({ ...payload, call_id: "call_make_bridge_002" });
    expect((await POST(request(altered, sign(body)))).status).toBe(401);
    const unsupported = JSON.stringify({ ...payload, event: "call_started" });
    expect((await POST(request(unsupported, sign(unsupported)))).status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("normalizes unknown Retell urgency text instead of rejecting the lead", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { status: "applied", tenant_id: tenant, lead_id: lead }, error: null });
    const unknownUrgencyPayload = JSON.stringify({
      ...payload,
      call_id: "call_make_bridge_unknown_urgency_001",
      lead: { ...payload.lead, urgency: "Unknown" },
    });
    const response = await POST(request(unknownUrgencyPayload, sign(unknownUrgencyPayload)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "lead_created", persisted: true, bookingCreated: false });
    expect(mocks.rpc.mock.calls[0][1].input.lead_priority).toBe("normal");
  });

  it("omits missing optional contact fields before calling the lead RPC", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { status: "applied", tenant_id: tenant, lead_id: lead }, error: null });
    const noOptionalContactPayload = JSON.stringify({
      ...payload,
      call_id: "call_make_bridge_no_optional_contact_001",
      lead: {
        caller_name: "Fictional No Email Caller",
        service_type: "No cooling",
        call_summary: "Fictional caller skipped email and phone during a bridge test.",
        urgency: "Unknown",
      },
    });
    const response = await POST(request(noOptionalContactPayload, sign(noOptionalContactPayload)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "lead_created", persisted: true, bookingCreated: false });
    const sent = mocks.rpc.mock.calls[0][1].input;
    expect(sent).not.toHaveProperty("lead_email");
    expect(sent).not.toHaveProperty("lead_phone");
    expect(sent.lead_priority).toBe("normal");
  });
  it("writes only a safe lead draft through the existing Retell lead RPC", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { status: "applied", tenant_id: tenant, lead_id: lead }, error: null });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "lead_created", persisted: true, bookingCreated: false });
    expect(mocks.rpc).toHaveBeenCalledWith("ingest_retell_call_lead", { input: {
      connection_id: connection,
      provider_account_id: "agent_a9182cc8117ac588f68bc52a3d",
      provider_event_id: "call_analyzed:call_make_bridge_001",
      provider_call_id: "call_make_bridge_001",
      lead_name: "Fictional Make Caller",
      lead_phone: "+15550100300",
      lead_email: "make-caller@example.invalid",
      lead_description: expect.stringContaining("AC stopped cooling during a fictional bridge test."),
      lead_priority: "normal",
    } });
    const sent = mocks.rpc.mock.calls[0][1].input;
    expect(JSON.stringify(sent)).not.toContain("forged-tenant-id");
    expect(JSON.stringify(sent)).not.toContain("fictional-sensitive-transcript");
    expect(JSON.stringify(sent)).not.toContain("recording.example.invalid");
  });

  it.each([
    [{ status: "duplicate", tenant_id: tenant, lead_id: lead }, 200, { status: "duplicate", persisted: true, bookingCreated: false }],
    [{ status: "unmapped_tenant" }, 202, { status: "unmapped_tenant", persisted: false, bookingCreated: false }],
    [{ status: "validation_error" }, 400, { status: "rejected", persisted: false, bookingCreated: false }],
    [{ status: "retryable_failure" }, 503, { status: "retryable_failure", persisted: false, bookingCreated: false }],
  ])("maps RPC status %# safely", async (data, status, expected) => {
    mocks.rpc.mockResolvedValueOnce({ data, error: null });
    const response = await POST(request());
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual(expected);
  });
});

