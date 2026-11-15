import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  configured: true,
  requireMembership: vi.fn(),
  operatorAccountType: "internal",
  clientPlan: "managed_receptionist",
  relationExists: true,
  calls: [] as Array<{ table: string; method: string; args: unknown[] }>,
}));

vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => harness.configured }));
vi.mock("@/lib/server/authorization", () => ({ requireMembership: harness.requireMembership }));

import { createStripePaymentRequest, type StripePaymentRequestState } from "@/app/actions/stripe-payment-links";
import { nextStripeRequestId, safeStripePaymentLink, StripePaymentRequestResult } from "@/app/workspaces/[tenantId]/clients/stripe-payment-request-form";

const operatorTenantId = "11111111-1111-4111-8111-111111111111";
const clientTenantId = "22222222-2222-4222-8222-222222222222";
const requestId = "33333333-3333-4333-8333-333333333333";
const idle: StripePaymentRequestState = { status: "idle", message: "" };

function paymentForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  form.set("operatorTenantId", operatorTenantId);
  form.set("clientTenantId", clientTenantId);
  form.set("paymentType", "setup");
  form.set("setupAmountDollars", "497.00");
  form.set("monthlyAmountDollars", "297.00");
  form.set("requestId", requestId);
  for (const [key, value] of Object.entries(overrides)) form.set(key, value);
  return form;
}

function databaseClient() {
  return {
    from(table: string) {
      const filters = new Map<string, unknown>();
      const chain = {
        select(...args: unknown[]) { harness.calls.push({ table, method: "select", args }); return chain; },
        eq(...args: unknown[]) { harness.calls.push({ table, method: "eq", args }); filters.set(String(args[0]), args[1]); return chain; },
        async single() {
          harness.calls.push({ table, method: "single", args: [] });
          if (table !== "tenants") return { data: null, error: { message: "not found" } };
          if (filters.get("id") === operatorTenantId) return { data: { id: operatorTenantId, account_type: harness.operatorAccountType }, error: null };
          if (filters.get("id") === clientTenantId) return { data: { name: "Fictional Northstar Trades", plan: harness.clientPlan }, error: null };
          return { data: null, error: { message: "not found" } };
        },
        async maybeSingle() {
          harness.calls.push({ table, method: "maybeSingle", args: [] });
          return harness.relationExists ? { data: { client_tenant_id: clientTenantId }, error: null } : { data: null, error: null };
        },
      };
      return chain;
    },
  };
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });
}

async function reachStripeRequest(fetchMock: ReturnType<typeof vi.fn>) {
  for (let attempt = 0; attempt < 12 && fetchMock.mock.calls.length === 0; attempt += 1) await Promise.resolve();
}

beforeEach(() => {
  harness.configured = true;
  harness.operatorAccountType = "internal";
  harness.clientPlan = "managed_receptionist";
  harness.relationExists = true;
  harness.calls = [];
  harness.requireMembership.mockReset().mockResolvedValue({ client: databaseClient(), role: "owner", user: { id: "44444444-4444-4444-8444-444444444444" } });
  vi.stubEnv("STRIPE_SECRET_KEY", "fictional-provider-token");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("manual Stripe payment requests", () => {
  it("returns a validated hosted link in authorized action state without creating recurring billing", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: "prod_fictional" }))
      .mockResolvedValueOnce(jsonResponse({ id: "price_fictional" }))
      .mockResolvedValueOnce(jsonResponse({ url: "https://buy.stripe.com/test_fictional" }));
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await createStripePaymentRequest(idle, paymentForm());

    expect(result).toEqual({ status: "success", message: "Stripe hosted payment link created. Confirm payment in Stripe before changing any launch milestone.", paymentRequest: { requestId, paymentLink: "https://buy.stripe.com/test_fictional", clientName: "Fictional Northstar Trades", paymentLabel: "Setup fee", paymentAmount: "$497.00" } });
    expect(harness.requireMembership).toHaveBeenCalledWith(operatorTenantId, ["owner", "admin"]);
    expect(harness.calls).toContainEqual({ table: "managed_client_workspaces", method: "eq", args: ["operator_tenant_id", operatorTenantId] });
    expect(harness.calls).toContainEqual({ table: "managed_client_workspaces", method: "eq", args: ["client_tenant_id", clientTenantId] });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String((fetchMock.mock.calls[1]?.[1] as RequestInit).body)).not.toContain("recurring");
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).headers).toMatchObject({ "Idempotency-Key": `${requestId}-product-setup` });
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit).headers).toMatchObject({ "Idempotency-Key": `${requestId}-price-setup` });
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).headers).toMatchObject({ "Idempotency-Key": `${requestId}-link-setup` });
    for (const call of fetchMock.mock.calls) expect((call[1] as RequestInit).signal).toBeInstanceOf(AbortSignal);
  });

  it("fails closed before Stripe for denied membership or a non-internal operator", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as typeof fetch;
    harness.requireMembership.mockRejectedValueOnce(new Error("fictional-private-authorization-detail"));
    const denied = await createStripePaymentRequest(idle, paymentForm());
    expect(denied).toEqual({ status: "error", message: "Payment request creation is temporarily unavailable. Please try again." });
    expect(JSON.stringify(denied)).not.toContain("fictional-private-authorization-detail");
    expect(fetchMock).not.toHaveBeenCalled();

    harness.requireMembership.mockResolvedValueOnce({ client: databaseClient(), role: "admin" });
    harness.operatorAccountType = "client";
    const wrongWorkspace = await createStripePaymentRequest(idle, paymentForm());
    expect(wrongWorkspace.message).toContain("Only the internal Cevanta owner dashboard");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an unconnected client before Stripe without leaking database details", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as typeof fetch;
    harness.relationExists = false;

    const result = await createStripePaymentRequest(idle, paymentForm());

    expect(result).toEqual({ status: "error", message: "That client is not connected to this Cevanta workspace." });
    expect(JSON.stringify(result)).not.toMatch(/relation|managed_client_workspaces|database/i);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(harness.calls).toContainEqual({ table: "managed_client_workspaces", method: "eq", args: ["operator_tenant_id", operatorTenantId] });
    expect(harness.calls).toContainEqual({ table: "managed_client_workspaces", method: "eq", args: ["client_tenant_id", clientTenantId] });
  });

  it("rejects free or unavailable client plans before creating Stripe objects", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as typeof fetch;

    harness.clientPlan = "free";
    await expect(createStripePaymentRequest(idle, paymentForm())).resolves.toEqual({
      status: "error",
      message: "Upgrade the client workspace before creating a Stripe payment request.",
    });
    expect(fetchMock).not.toHaveBeenCalled();

    harness.clientPlan = "unexpected";
    await expect(createStripePaymentRequest(idle, paymentForm())).resolves.toEqual({
      status: "error",
      message: "Upgrade the client workspace before creating a Stripe payment request.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a provider URL outside the exact Stripe checkout hosts", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: "prod_fictional" }))
      .mockResolvedValueOnce(jsonResponse({ id: "price_fictional" }))
      .mockResolvedValueOnce(jsonResponse({ url: "https://buy.stripe.com.evil.example/payment" }));
    globalThis.fetch = fetchMock as typeof fetch;
    expect(await createStripePaymentRequest(idle, paymentForm())).toEqual({ status: "error", message: "Stripe returned an unexpected payment-link response." });
    expect(safeStripePaymentLink("https://checkout.stripe.com/c/pay_fictional")).toBe("https://checkout.stripe.com/c/pay_fictional");
    expect(safeStripePaymentLink("https://buy.stripe.com.evil.example/payment")).toBeNull();
  });

  it("stops a Stripe request with no response headers after five seconds without retrying", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new Error("fictional-provider-abort-detail")), { once: true });
    }));
    globalThis.fetch = fetchMock as typeof fetch;
    const pending = createStripePaymentRequest(idle, paymentForm());
    await reachStripeRequest(fetchMock);

    await vi.advanceTimersByTimeAsync(4_999);
    expect(fetchMock).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);

    const result = await pending;
    expect(result).toEqual({ status: "error", message: "Stripe could not create this payment request. Check the Stripe account and try again." });
    expect(JSON.stringify(result)).not.toContain("fictional-provider-abort-detail");
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).signal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the same deadline while parsing a stalled Stripe response body", async () => {
    vi.useFakeTimers();
    const json = vi.fn(() => new Promise<never>(() => {}));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json });
    globalThis.fetch = fetchMock as typeof fetch;
    const pending = createStripePaymentRequest(idle, paymentForm());
    await reachStripeRequest(fetchMock);

    await vi.advanceTimersByTimeAsync(4_999);
    expect(json).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);

    await expect(pending).resolves.toEqual({ status: "error", message: "Stripe could not create this payment request. Check the Stripe account and try again." });
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).signal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("retains one idempotency request after a partial failure and rotates it only after success", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: "prod_fictional" }))
      .mockResolvedValueOnce(jsonResponse({ error: { type: "fictional_failure" } }, 500))
      .mockResolvedValueOnce(jsonResponse({ id: "prod_fictional" }))
      .mockResolvedValueOnce(jsonResponse({ id: "price_fictional" }))
      .mockResolvedValueOnce(jsonResponse({ url: "https://checkout.stripe.com/c/pay_fictional" }));
    globalThis.fetch = fetchMock as typeof fetch;

    const failed = await createStripePaymentRequest(idle, paymentForm());
    expect(failed.status).toBe("error");
    expect(nextStripeRequestId(requestId, failed, () => "should-not-be-used")).toBe(requestId);

    const succeeded = await createStripePaymentRequest(failed, paymentForm());
    const nextRequestId = "55555555-5555-4555-8555-555555555555";
    expect(succeeded.status).toBe("success");
    expect(nextStripeRequestId(requestId, succeeded, () => nextRequestId)).toBe(nextRequestId);
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).headers).toMatchObject({ "Idempotency-Key": `${requestId}-product-setup` });
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).headers).toMatchObject({ "Idempotency-Key": `${requestId}-product-setup` });
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit).headers).toMatchObject({ "Idempotency-Key": `${requestId}-price-setup` });
    expect((fetchMock.mock.calls[3]?.[1] as RequestInit).headers).toMatchObject({ "Idempotency-Key": `${requestId}-price-setup` });
  });

  it("renders only validated Stripe links with safe external-link attributes", () => {
    const request = { requestId, paymentLink: "https://buy.stripe.com/test_fictional", clientName: "Fictional Northstar Trades", paymentLabel: "Setup fee", paymentAmount: "$497.00" };
    const html = renderToStaticMarkup(createElement(StripePaymentRequestResult, { paymentRequest: request }));
    expect(html).toContain('href="https://buy.stripe.com/test_fictional"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('referrerPolicy="no-referrer"');

    const rejected = renderToStaticMarkup(createElement(StripePaymentRequestResult, { paymentRequest: { ...request, paymentLink: "https://example.test/payment" } }));
    expect(rejected).toBe("");
  });
});
