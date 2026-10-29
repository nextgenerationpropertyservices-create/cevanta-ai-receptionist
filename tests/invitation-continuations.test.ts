import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  authError: null as unknown,
  authUser: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" } as { id: string } | null,
  origin: vi.fn(),
  randomBytes: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("node:crypto", async () => {
  const actual = await vi.importActual<typeof import("node:crypto")>("node:crypto");
  return { ...actual, randomBytes: harness.randomBytes };
});
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: harness.authUser }, error: harness.authError }) },
    rpc: harness.rpc,
  }),
}));
vi.mock("@/lib/server/password-recovery-origin", () => ({ passwordRecoveryOrigin: harness.origin }));

import {
  acceptInvitationContinuation,
  exchangeInvitationContinuation,
  INVITATION_CONTINUATION_COOKIE,
  readBoundedInvitationBody,
} from "@/lib/server/invitation-continuations";
import { POST } from "@/app/api/invitations/continuations/route";

const requestId = "33333333-3333-4333-8333-333333333333";
const invitationId = "44444444-4444-4444-8444-444444444444";
const workspaceId = "22222222-2222-4222-8222-222222222222";
const invitationToken = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8";
const invitationDigest = "630dcd2966c4336691125448bbb25b4ff412a49c732db2c8abc1b8581bd710dd";
const continuationBytes = Buffer.from(Array.from({ length: 32 }, (_value, index) => index + 32));
const continuation = continuationBytes.toString("base64url");
const continuationDigest = createHash("sha256").update(continuationBytes).digest("hex");
const exchangeBody = JSON.stringify({ version: 1, request_id: requestId, token: invitationToken });

function exchangeRequest(overrides: {
  body?: string;
  headers?: Record<string, string | undefined>;
  url?: string;
} = {}) {
  const body = overrides.body ?? exchangeBody;
  const headers: Record<string, string> = {
    origin: "https://app.example.test",
    host: "app.example.test",
    "sec-fetch-site": "same-origin",
    "content-type": "application/json",
    "content-length": String(Buffer.byteLength(body)),
  };
  for (const [key, value] of Object.entries(overrides.headers ?? {})) {
    if (value === undefined) delete headers[key]; else headers[key] = value;
  }
  return new Request(overrides.url ?? "https://app.example.test/api/invitations/continuations", {
    method: "POST",
    headers,
    body,
  });
}

function expectExchangeResponsePolicy(response: Response) {
  expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
  expect(response.headers.get("cdn-cache-control")).toBe("no-store");
  expect(response.headers.get("vercel-cdn-cache-control")).toBe("no-store");
  expect(response.headers.get("pragma")).toBe("no-cache");
  expect(response.headers.get("expires")).toBe("0");
  expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow, noarchive");
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  expect(response.headers.get("x-frame-options")).toBe("DENY");
  expect(response.headers.get("permissions-policy")).toBe("camera=(), microphone=(), geolocation=()");
  expect(response.headers.get("content-security-policy"))
    .toBe("default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; sandbox");
  expect(response.headers.get("access-control-allow-origin")).toBeNull();
  expect(response.headers.get("access-control-allow-credentials")).toBeNull();
}

beforeEach(() => {
  harness.authError = null;
  harness.authUser = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
  harness.origin.mockReset().mockReturnValue("https://app.example.test");
  harness.randomBytes.mockReset().mockReturnValue(continuationBytes);
  harness.rpc.mockReset().mockResolvedValue({ data: { status: "created" }, error: null });
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2030-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("invitation continuation exchange helper", () => {
  it("passes only decoded-byte digests and a bounded server expiry to the public-session RPC", async () => {
    const result = await exchangeInvitationContinuation({ version: 1, request_id: requestId, token: invitationToken });

    expect(result).toEqual({ status: "ready", continuation });
    expect(harness.rpc).toHaveBeenCalledWith("exchange_invitation_continuation", {
      input: {
        request_id: requestId,
        token_digest_hex: invitationDigest,
        continuation_digest_hex: continuationDigest,
        expires_at: "2030-01-01T00:15:00.000Z",
      },
    });
    const serializedCall = JSON.stringify(harness.rpc.mock.calls);
    expect(serializedCall).not.toContain(invitationToken);
    expect(serializedCall).not.toContain(continuation);
  });

  it.each([
    { version: 2, request_id: requestId, token: invitationToken },
    { version: 1, request_id: "not-a-uuid", token: invitationToken },
    { version: 1, request_id: requestId, token: `${invitationToken}x` },
    { version: 1, request_id: requestId, token: invitationToken, tenant_id: workspaceId },
  ])("rejects malformed or extra input before database access", async input => {
    await expect(exchangeInvitationContinuation(input)).resolves.toEqual({ status: "unavailable" });
    expect(harness.rpc).not.toHaveBeenCalled();
  });

  it.each([
    [{ status: "unavailable" }, null],
    [{ status: "retryable_failure" }, null],
    [{ status: "created", invitation_id: invitationId }, null],
    [{ status: "created" }, { message: "missing migration" }],
    [null, null],
  ])("fails closed for non-created, malformed, or RPC error result %#", async (data, error) => {
    harness.rpc.mockResolvedValue({ data, error });
    await expect(exchangeInvitationContinuation({ version: 1, request_id: requestId, token: invitationToken }))
      .resolves.toEqual({ status: "unavailable" });
  });
});

describe("invitation continuation acceptance helper", () => {
  const accepted = {
    status: "accepted",
    acceptance: { invitation_id: invitationId, accepted_at: "2030-01-01T00:00:00.000000Z" },
    workspace: { id: workspaceId, name: "Fictional Trade Co" },
    role: "owner",
    entry: "setup",
  } as const;

  it("verifies an authenticated user and accepts through the digest-only command", async () => {
    harness.rpc.mockResolvedValue({ data: accepted, error: null });

    await expect(acceptInvitationContinuation(continuation)).resolves.toEqual(accepted);
    expect(harness.rpc).toHaveBeenCalledWith("onboarding_accept_invitation_continuation", {
      input: { continuation_digest_hex: continuationDigest },
    });
    expect(JSON.stringify(harness.rpc.mock.calls)).not.toContain(continuation);
  });

  it("rejects anonymous and noncanonical continuations before acceptance RPC access", async () => {
    harness.authUser = null;
    await expect(acceptInvitationContinuation(continuation)).resolves.toEqual({ status: "unavailable" });
    expect(harness.rpc).not.toHaveBeenCalled();

    harness.authUser = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
    await expect(acceptInvitationContinuation("not-a-continuation")).resolves.toEqual({ status: "unavailable" });
    expect(harness.rpc).not.toHaveBeenCalled();
  });

  it.each([
    { ...accepted, tenant_id: workspaceId },
    { ...accepted, role: "admin" },
    { ...accepted, workspace: { ...accepted.workspace, id: "bad" } },
    { status: "unknown" },
    null,
  ])("fails closed on a malformed database acceptance envelope %#", async data => {
    harness.rpc.mockResolvedValue({ data, error: null });
    await expect(acceptInvitationContinuation(continuation)).resolves.toEqual({ status: "retryable_failure" });
  });
});

describe("invitation continuation route", () => {
  it("sets the exact opaque host cookie only after database confirmation and returns status only", async () => {
    const response = await POST(exchangeRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ready" });
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${INVITATION_CONTINUATION_COOKIE}=${continuation}`);
    expect(cookie).toMatch(/Path=\//i);
    expect(cookie).toMatch(/Max-Age=900/i);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Secure/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    expect(cookie).toMatch(/Priority=High/i);
    expect(cookie).not.toMatch(/Domain=/i);
    expect(cookie).not.toContain(invitationToken);
    expectExchangeResponsePolicy(response);
  });

  it.each([
    ["cross-origin origin", { origin: "https://evil.example.test" }, 403],
    ["missing origin", { origin: undefined }, 403],
    ["mismatched host", { host: "evil.example.test" }, 403],
    ["multi-value host", { host: "app.example.test,evil.example.test" }, 403],
    ["mismatched forwarded host", { "x-forwarded-host": "evil.example.test" }, 403],
    ["mismatched forwarded proto", { "x-forwarded-proto": "http" }, 403],
    ["cross-site fetch metadata", { "sec-fetch-site": "cross-site" }, 403],
    ["missing fetch metadata", { "sec-fetch-site": undefined }, 403],
    ["wrong media type", { "content-type": "text/plain" }, 415],
    ["missing length", { "content-length": undefined }, 413],
    ["non-numeric length", { "content-length": "lots" }, 413],
    ["excessive declared length", { "content-length": "1025" }, 413],
  ])("rejects %s before exchange", async (_label, headers, expectedStatus) => {
    const response = await POST(exchangeRequest({ headers }));
    expect(response.status).toBe(expectedStatus);
    await expect(response.json()).resolves.toEqual({ status: "unavailable" });
    expect(harness.rpc).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toBeNull();
    expectExchangeResponsePolicy(response);
  });

  it("rejects malformed JSON, extra keys, and an actual streamed body over 1 KiB", async () => {
    for (const body of [
      "{ ",
      JSON.stringify({ version: 1, request_id: requestId, token: invitationToken, extra: true }),
      JSON.stringify({ version: 1, request_id: requestId, token: `${invitationToken}x` }),
      `{"padding":"${"x".repeat(1100)}"}`,
    ]) {
      const response = await POST(exchangeRequest({
        body,
        headers: body.length > 1024 ? { "content-length": "100" } : undefined,
      }));
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ status: "unavailable" });
      expect(response.headers.get("set-cookie")).toBeNull();
      expectExchangeResponsePolicy(response);
    }
    expect(harness.rpc).not.toHaveBeenCalled();
  });

  it("fails closed without setting a cookie when the migration/RPC is unavailable", async () => {
    harness.rpc.mockResolvedValue({ data: null, error: { code: "42883" } });
    const response = await POST(exchangeRequest());
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ status: "unavailable" });
    expect(response.headers.get("set-cookie")).toBeNull();
    expectExchangeResponsePolicy(response);
  });

  it("returns the same deny-all response policy when the configured origin is unavailable", async () => {
    harness.origin.mockImplementation(() => { throw new Error("unavailable"); });

    const response = await POST(exchangeRequest());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ status: "unavailable" });
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(harness.rpc).not.toHaveBeenCalled();
    expectExchangeResponsePolicy(response);
  });

  it("bounds the body reader independently of a declared content length", async () => {
    const oversized = new Request("https://app.example.test/api/invitations/continuations", {
      method: "POST",
      body: "x".repeat(1025),
    });
    await expect(readBoundedInvitationBody(oversized)).resolves.toBeNull();
  });
});
