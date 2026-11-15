import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  acceptContinuation: vi.fn(),
  cookieDelete: vi.fn(),
  cookieGet: vi.fn(),
  origin: vi.fn(),
  randomBytes: vi.fn(),
  revalidatePath: vi.fn(),
  requireMembership: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("node:crypto", async () => {
  const actual = await vi.importActual<typeof import("node:crypto")>("node:crypto");
  return { ...actual, randomBytes: harness.randomBytes };
});
vi.mock("next/cache", () => ({ revalidatePath: harness.revalidatePath }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: harness.cookieGet, delete: harness.cookieDelete }),
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); },
}));
vi.mock("@/lib/server/authorization", () => ({ requireMembership: harness.requireMembership }));
vi.mock("@/lib/server/invitation-continuations", () => ({
  INVITATION_CONTINUATION_COOKIE: "__Host-cevanta-invite",
  acceptInvitationContinuation: harness.acceptContinuation,
}));
vi.mock("@/lib/server/password-recovery-origin", () => ({ passwordRecoveryOrigin: harness.origin }));

import { acceptClientInvitation, issueClientInvitation } from "@/app/actions/invitations";

const operatorTenantId = "11111111-1111-4111-8111-111111111111";
const clientTenantId = "22222222-2222-4222-8222-222222222222";
const requestId = "33333333-3333-4333-8333-333333333333";
const invitationId = "44444444-4444-4444-8444-444444444444";
const fixedToken = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8";
const decodedByteDigest = "630dcd2966c4336691125448bbb25b4ff412a49c732db2c8abc1b8581bd710dd";
const priorTextDigest = "ea866a757e4c38babfa8127cbe9a409d3e1f93a00ff1488ff735fcf917afffd0";

function invitationForm() {
  const form = new FormData();
  form.set("request_id", requestId);
  form.set("operator_tenant_id", operatorTenantId);
  form.set("client_tenant_id", clientTenantId);
  form.set("recipient_email", "OWNER@EXAMPLE.TEST");
  return form;
}

beforeEach(() => {
  harness.acceptContinuation.mockReset().mockResolvedValue({ status: "unavailable" });
  harness.cookieDelete.mockReset();
  harness.cookieGet.mockReset().mockReturnValue({ value: fixedToken });
  harness.origin.mockReset().mockReturnValue("https://app.example.test");
  harness.randomBytes.mockReset().mockReturnValue(Buffer.from(Array.from({ length: 32 }, (_value, index) => index)));
  harness.revalidatePath.mockReset();
  harness.requireMembership.mockReset().mockResolvedValue({ client: { rpc: harness.rpc }, role: "owner", user: { id: "55555555-5555-4555-8555-555555555555" } });
  harness.rpc.mockReset().mockResolvedValue({
    data: {
      status: "created",
      invitation_id: invitationId,
      recipient_email: "owner@example.test",
      intended_role: "owner",
      expires_at: "2030-01-08T00:00:00.000000Z",
    },
    error: null,
  });
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2030-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("client invitation issuance digest", () => {
  it("hashes the canonical decoded 32-byte token and sends that fixed digest to the issuance RPC", async () => {
    const result = await issueClientInvitation({ status: "idle", message: "" }, invitationForm());

    expect(harness.randomBytes).toHaveBeenCalledWith(32);
    expect(Buffer.from(fixedToken, "base64url")).toHaveLength(32);
    expect(Buffer.from(fixedToken, "base64url").toString("base64url")).toBe(fixedToken);
    expect(createHash("sha256").update(Buffer.from(fixedToken, "base64url")).digest("hex")).toBe(decodedByteDigest);
    expect(createHash("sha256").update(fixedToken, "utf8").digest("hex")).toBe(priorTextDigest);
    expect(decodedByteDigest).not.toBe(priorTextDigest);
    expect(harness.rpc).toHaveBeenCalledWith("issue_client_invitation", {
      input: expect.objectContaining({
        request_id: requestId,
        operator_tenant_id: operatorTenantId,
        client_tenant_id: clientTenantId,
        recipient_email: "owner@example.test",
        intended_role: "owner",
        token_digest_hex: decodedByteDigest,
        expires_at: "2030-01-08T00:00:00.000Z",
      }),
    });
    expect(result).toEqual({
      status: "success",
      message: "Private invitation created. Copy it now; the token is shown only once.",
      inviteUrl: `https://app.example.test/invite#v=1&r=${requestId}&t=${fixedToken}`,
      expiresAt: "2030-01-08T00:00:00.000000Z",
    });
    expect(harness.revalidatePath).toHaveBeenCalledWith(`/workspaces/${operatorTenantId}/clients`);
  });

  it("rejects a noncanonical generated token before origin, authorization, or issuance", async () => {
    harness.randomBytes.mockReturnValue({ toString: () => `${"A".repeat(42)}B` });

    const result = await issueClientInvitation({ status: "idle", message: "" }, invitationForm());

    expect(result).toEqual({ status: "error", message: "Could not prepare the invitation. Please retry." });
    expect(harness.origin).not.toHaveBeenCalled();
    expect(harness.requireMembership).not.toHaveBeenCalled();
    expect(harness.rpc).not.toHaveBeenCalled();
    expect(harness.revalidatePath).not.toHaveBeenCalled();
  });
});

describe("client invitation acceptance", () => {
  it("reads and clears only the opaque cookie and follows the strict database workspace", async () => {
    harness.acceptContinuation.mockResolvedValue({
      status: "accepted",
      acceptance: { invitation_id: invitationId, accepted_at: "2030-01-01T00:00:00.000000Z" },
      workspace: { id: clientTenantId, name: "Fictional Trade Co" },
      role: "owner",
      entry: "setup",
    });
    const hostile = new FormData();
    hostile.set("tenant_id", operatorTenantId);
    hostile.set("token", "hostile-browser-token");
    hostile.set("next", "https://evil.example.test");

    await expect(acceptClientInvitation({ status: "idle", message: "" }, hostile))
      .rejects.toThrow(`REDIRECT:/workspaces/${clientTenantId}/onboarding`);

    expect(harness.cookieGet).toHaveBeenCalledWith("__Host-cevanta-invite");
    expect(harness.cookieDelete).toHaveBeenCalledWith("__Host-cevanta-invite");
    expect(harness.acceptContinuation).toHaveBeenCalledWith(fixedToken);
    expect(harness.acceptContinuation).not.toHaveBeenCalledWith("hostile-browser-token");
  });

  it("clears the cookie and returns one generic failure for missing or rejected continuations", async () => {
    harness.cookieGet.mockReturnValue(undefined);
    const result = await acceptClientInvitation({ status: "idle", message: "" }, new FormData());

    expect(result).toEqual({
      status: "error",
      message: "This invitation is unavailable. Ask the Cevanta operator for a new private invitation.",
    });
    expect(harness.cookieDelete).toHaveBeenCalledWith("__Host-cevanta-invite");
    expect(harness.acceptContinuation).toHaveBeenCalledWith("");
  });
});
