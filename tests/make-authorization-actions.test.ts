import { beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  requireMembership: vi.fn(),
  createAuthorization: vi.fn(),
  plan: "managed_receptionist" as string | null,
}));

vi.mock("@/lib/server/authorization", () => ({ requireMembership: harness.requireMembership }));
vi.mock("@/lib/server/make-management", () => ({ createMakeAuthorization: harness.createAuthorization }));
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }));

import { createClientMakeAuthorization } from "@/app/actions/make-authorization";

const tenantId = "11111111-1111-4111-8111-111111111111";
const idle = { status: "idle", message: "" } as const;

function form() {
  const data = new FormData();
  data.set("tenantId", tenantId);
  data.set("name", "Fictional Harbor Mechanical");
  data.set("email", "office@example.test");
  return data;
}

function client() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { plan: harness.plan }, error: null }),
        }),
      }),
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  harness.plan = "managed_receptionist";
  harness.requireMembership.mockResolvedValue({ client: client(), role: "owner" });
  harness.createAuthorization.mockResolvedValue({ status: "created", requestId: "fictional-request", publicUri: "https://example.test/authorize", providerStatus: "pending" });
});

describe("Make authorization plan boundary", () => {
  it("keeps managed-plan authorization creation working", async () => {
    const result = await createClientMakeAuthorization(idle, form());

    expect(result.status).toBe("success");
    expect(harness.requireMembership).toHaveBeenCalledWith(tenantId, ["owner", "admin"]);
    expect(harness.createAuthorization).toHaveBeenCalledOnce();
  });

  it.each(["free", null])("blocks %s plan before the Make provider call", async plan => {
    harness.plan = plan;

    const result = await createClientMakeAuthorization(idle, form());

    expect(result.status).toBe("error");
    expect(harness.createAuthorization).not.toHaveBeenCalled();
  });
});
