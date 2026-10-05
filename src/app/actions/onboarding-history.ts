"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { OnboardingHistoryListResult, OnboardingHistoryReenableResult } from "@/lib/onboarding-contracts";
import { listOnboardingHistory, reenableOnboardingHistoryItem } from "@/lib/server/onboarding-rpc";

type HistoryOutcome = OnboardingHistoryListResult | OnboardingHistoryReenableResult;
function message(result: HistoryOutcome): string {
  switch (result.status) {
    case "available": return "Setup history loaded.";
    case "saved": return "Setup history item re-enabled.";
    case "replayed": return "Your earlier re-enable is confirmed. Refresh to see the latest setup.";
    case "validation_error": return "Check the history request and try again.";
    case "conflict": return result.reason === "revision" ? "Setup changed. Refresh before re-enabling this item." : result.reason === "request_reuse" ? "This request was already used for different information. Refresh before trying again." : "This record cannot accept further changes. Ask your administrator for help.";
    case "unavailable": return "This setup history is unavailable. Check your account and access.";
    default: return "We could not confirm the result. Retry with the same request before starting a new save.";
  }
}
function tenantFromInput(input: unknown): string | undefined {
  return input && typeof input === "object" && "tenant_id" in input && typeof input.tenant_id === "string" ? input.tenant_id.toLowerCase() : undefined;
}
function finish<T extends HistoryOutcome>(result: T, tenant?: string) {
  let refreshRequired = false;
  if ((result.status === "saved" || result.status === "replayed") && tenant) {
    try { revalidatePath(`/workspaces/${tenant}`, "layout"); }
    catch (error) { unstable_rethrow(error); refreshRequired = true; }
  }
  return { result, message: refreshRequired ? "Your save is confirmed. Refresh the workspace to see the latest setup." : message(result), refreshRequired };
}
export async function loadOnboardingHistory(input: unknown) {
  const result = await listOnboardingHistory(input);
  return finish(result);
}
export async function reenableOnboardingHistory(input: unknown) {
  const result = await reenableOnboardingHistoryItem(input);
  return finish(result, tenantFromInput(input));
}
