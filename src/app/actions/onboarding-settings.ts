"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { ConfigurationResult } from "@/lib/onboarding-contracts";
import { configureOnboarding } from "@/lib/server/onboarding-rpc";

type SettingsActionState = { result: ConfigurationResult; message: string; refreshRequired: boolean };

function settingsMessage(result: ConfigurationResult): string {
  switch (result.status) {
    case "saved": return "Workspace settings saved.";
    case "replayed": return "Your earlier settings save is confirmed. Refresh to see the latest information.";
    case "validation_error": return "Check the workspace settings and try again.";
    case "unavailable": return "This workspace is unavailable. Check your account and access.";
    case "conflict": return result.reason === "revision" ? "Workspace settings changed. Refresh before saving your edits." : result.reason === "request_reuse" ? "This request was already used for different settings. Refresh before trying again." : "These settings cannot accept further changes. Ask your administrator for help.";
    default: return "We could not confirm the settings save. Retry with the same request before starting a new save.";
  }
}

function tenantFromInput(input: unknown): string | undefined {
  return input && typeof input === "object" && "tenant_id" in input && typeof input.tenant_id === "string" ? input.tenant_id.toLowerCase() : undefined;
}

function finish(result: ConfigurationResult, input: unknown): SettingsActionState {
  let refreshRequired = false;
  const tenant = tenantFromInput(input);
  if ((result.status === "saved" || result.status === "replayed") && result.entity === "setup" && result.id === tenant && tenant) {
    try { revalidatePath(`/workspaces/${tenant}`, "layout"); }
    catch (error) { unstable_rethrow(error); refreshRequired = true; }
  }
  return { result, message: refreshRequired ? "Your settings save is confirmed. Refresh the workspace to see the latest information." : settingsMessage(result), refreshRequired };
}

export async function saveOnboardingSettings(input: unknown): Promise<SettingsActionState> {
  const result = await configureOnboarding("save_business_profile", input);
  if ((result.status === "saved" || result.status === "replayed") && (result.entity !== "setup" || result.id !== tenantFromInput(input))) {
    return finish({ status: "retryable_failure" }, input);
  }
  return finish(result, input);
}
