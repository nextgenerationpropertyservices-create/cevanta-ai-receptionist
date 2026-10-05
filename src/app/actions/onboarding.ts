"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { ConfigurationCommand, ConfigurationResult, InvitationAcceptanceResult } from "@/lib/onboarding-contracts";
import { configureOnboarding, saveOnboardingResume, acceptOnboardingInvitation } from "@/lib/server/onboarding-rpc";

type Outcome = ConfigurationResult | InvitationAcceptanceResult;
function message(result: Outcome): string {
  switch(result.status) {
    case "saved": return "Setup information saved.";
    case "accepted": return "Workspace access confirmed.";
    case "already_accepted": return "Workspace access is already confirmed.";
    case "replayed": return "Your earlier save is confirmed. Refresh to see the latest information.";
    case "validation_error": return "Check the setup fields and try again.";
    case "unavailable": return "This workspace or invitation is unavailable. Check your account and access.";
    case "membership_conflict": return "Your existing workspace role differs from this invitation. Ask your administrator for help.";
    case "conflict": return result.reason === "revision" ? "Setup changed. Refresh before saving your edits." : result.reason === "request_reuse" ? "This request was already used for different information. Refresh before trying again." : "This record cannot accept further changes. Ask your administrator for help.";
    default: return "We could not confirm the result. Retry with the same request before starting a new save.";
  }
}
function finish<T extends Outcome>(result:T,tenant?:string) {
  let refreshRequired=false;
  if (["saved","accepted","already_accepted","replayed"].includes(result.status) && tenant) {
    try { revalidatePath(`/workspaces/${tenant}`,"layout"); }
    catch(error) { unstable_rethrow(error); refreshRequired=true; }
  }
  return {result,message:refreshRequired ? "Your save is confirmed. Refresh the workspace to see the latest information." : message(result),refreshRequired};
}
export async function saveOnboardingConfiguration(command:ConfigurationCommand,input:unknown) {
  const result=await configureOnboarding(command,input);
  const tenant=(result.status === "saved" || result.status === "replayed") && result.entity === "setup" ? result.id : (input && typeof input === "object" && "tenant_id" in input && typeof input.tenant_id === "string" ? input.tenant_id : undefined);
  return finish(result,tenant?.toLowerCase());
}
export async function saveOnboardingProgress(input:unknown) {
  const result=await saveOnboardingResume(input);
  const tenant=input && typeof input === "object" && "tenant_id" in input && typeof input.tenant_id === "string" ? input.tenant_id : undefined;
  return finish(result,tenant?.toLowerCase());
}
export async function acceptOnboardingAccess(input:unknown) {
  const result=await acceptOnboardingInvitation(input);
  return finish(result,"workspace" in result ? result.workspace.id : undefined);
}

