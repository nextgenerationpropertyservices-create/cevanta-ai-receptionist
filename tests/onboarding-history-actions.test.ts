import { beforeEach, describe, expect, it, vi } from "vitest";
const h = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn(), member: vi.fn(), revalidate: vi.fn(), configured: true }));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => h.configured }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: h.getUser }, rpc: h.rpc, from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: h.member }) }) }) }) }) }));
vi.mock("next/cache", () => ({ revalidatePath: h.revalidate }));
vi.mock("next/navigation", () => ({ unstable_rethrow: (e: unknown) => { if (e instanceof Error && e.message === "NEXT_CONTROL") throw e; } }));
import { loadOnboardingHistory, reenableOnboardingHistory } from "@/app/actions/onboarding-history";
import { listOnboardingHistory, reenableOnboardingHistoryItem } from "@/lib/server/onboarding-rpc";

const tenant = "48000000-0000-4000-8000-000000000001";
const request = "48000000-0000-4000-8000-000000000002";
const user = "48000000-0000-4000-8000-000000000003";
const row = "48000000-0000-4000-8000-000000000004";
const historyInput = () => ({ tenant_id: tenant, kind: "services" as const });
const serviceItem = () => ({ id: row, kind: "service", state: "disabled", version: 2, name: "Maintenance", description: "Seasonal", position: 4, updated_at: "2026-10-04T12:00:00.000000Z", can_reenable: true });
const historyResult = () => ({ status: "available", tenant_id: tenant, kind: "services", config_revision: 12, items: [serviceItem()], page: { limit: 25, next_cursor: null, has_more: false } });
const reenableInput = () => ({ tenant_id: tenant, request_id: request, expected_config_revision: 12, kind: "services" as const, row_id: row, payload: { name: "Maintenance", description: "Seasonal", position: 4 } });
const reenableResult = () => ({ status: "saved", entity: "history_reenable", kind: "services", id: row, version: 3, config_revision: 13 });

beforeEach(() => { vi.resetAllMocks(); h.configured = true; h.getUser.mockResolvedValue({ data: { user: { id: user } }, error: null }); h.member.mockResolvedValue({ data: { role: "owner" }, error: null }); h.rpc.mockResolvedValue({ data: historyResult(), error: null }); });

describe("onboarding history action boundary", () => {
  it.each([null, {}, { tenant_id: tenant, kind: "bad" }, { ...historyInput(), state: "inactive" }, { ...historyInput(), limit: 51 }, { ...historyInput(), search: "x".repeat(121) }, { tenant_id: tenant, kind: "date_exceptions", search: "holiday" }])("rejects malformed history list before authentication/RPC", async value => {
    expect((await loadOnboardingHistory(value)).result.status).toBe("validation_error");
    expect(h.getUser).not.toHaveBeenCalled();
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it("normalizes list defaults and does not revalidate read-only history", async () => {
    const response = await loadOnboardingHistory(historyInput());
    expect(response.result).toEqual(historyResult());
    expect(h.rpc).toHaveBeenCalledWith("onboarding_history_list", { input: { tenant_id: tenant, kind: "services", state: "disabled", limit: 25, cursor: null, search: null, sort: "position", direction: "asc" } });
    expect(h.revalidate).not.toHaveBeenCalled();
  });

  it.each(["admin", "owner"])("allows %s history reads through the office gate", async role => {
    h.member.mockResolvedValue({ data: { role }, error: null });
    h.rpc.mockResolvedValue({ data: { ...historyResult(), page: { limit: 2, next_cursor: null, has_more: false } }, error: null });
    expect((await listOnboardingHistory({ ...historyInput(), limit: 2, state: "all_retained", sort: "updated_at", direction: "desc", cursor: null, search: "Maint" })).status).toBe("available");
    expect(h.rpc).toHaveBeenCalledWith("onboarding_history_list", { input: { tenant_id: tenant, kind: "services", state: "all_retained", limit: 2, cursor: null, search: "Maint", sort: "updated_at", direction: "desc" } });
  });

  it.each(["dispatcher", "technician", "viewer", "invalid"])("denies %s before history RPC", async role => {
    h.member.mockResolvedValue({ data: { role }, error: null });
    expect((await loadOnboardingHistory(historyInput())).result.status).toBe("unavailable");
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it.each([null, { ...historyResult(), request_id: request }, { ...historyResult(), tenant_id: row }, { ...historyResult(), kind: "escalation_contacts" }, { ...historyResult(), items: [{ ...serviceItem(), email: "private@example.invalid" }] }, { ...historyResult(), page: { limit: 50, next_cursor: null, has_more: false } }])("fails closed on corrupt history result", async data => {
    h.rpc.mockResolvedValue({ data, error: null });
    expect((await loadOnboardingHistory(historyInput())).result.status).toBe("retryable_failure");
    expect(h.revalidate).not.toHaveBeenCalled();
  });

  it.each([{}, { ...reenableInput(), row_id: "bad" }, { ...reenableInput(), expected_config_revision: "12" }, { ...reenableInput(), payload: { ...reenableInput().payload, enabled: true } }, { ...reenableInput(), kind: "date_exceptions", payload: { date: "2026-02-30", closed: true, intervals: [] } }])("rejects malformed re-enable before authentication/RPC", async value => {
    expect((await reenableOnboardingHistory(value)).result.status).toBe("validation_error");
    expect(h.getUser).not.toHaveBeenCalled();
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it("reenables one row with exact args and refreshes after confirmed mutation", async () => {
    h.rpc.mockResolvedValue({ data: reenableResult(), error: null });
    const response = await reenableOnboardingHistory(reenableInput());
    expect(response.result).toEqual(reenableResult());
    expect(h.rpc).toHaveBeenCalledWith("onboarding_history_reenable", { input: reenableInput() });
    expect(h.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}`, "layout");
  });

  it.each([{ status: "replayed", entity: "history_reenable", kind: "services", id: row, version: 3, config_revision: 13 }, { status: "conflict", reason: "revision" }, { status: "conflict", reason: "request_reuse" }, { status: "validation_error", issues: [{ field: "payload", code: "invalid_input" }] }, { status: "unavailable" }, { status: "retryable_failure" }])("preserves safe re-enable response %j", async data => {
    h.rpc.mockResolvedValue({ data, error: null });
    const response = await reenableOnboardingHistory(reenableInput());
    expect(response.result).toEqual(data);
  });

  it.each([{ ...reenableResult(), entity: "setup" }, { ...reenableResult(), id: tenant }, { ...reenableResult(), kind: "date_exceptions" }, { ...reenableResult(), request_id: request }])("fails closed on corrupt re-enable success", async data => {
    h.rpc.mockResolvedValue({ data, error: null });
    expect((await reenableOnboardingHistoryItem(reenableInput())).status).toBe("retryable_failure");
  });

  it("keeps confirmed re-enable when refresh fails", async () => {
    h.rpc.mockResolvedValue({ data: reenableResult(), error: null });
    h.revalidate.mockImplementation(() => { throw new Error("private refresh"); });
    const response = await reenableOnboardingHistory(reenableInput());
    expect(response.result).toEqual(reenableResult());
    expect(response.refreshRequired).toBe(true);
    expect(response.message).toContain("confirmed");
  });
});


