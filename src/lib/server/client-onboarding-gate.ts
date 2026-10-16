import "server-only";
import type { Role, Tenant } from "@/lib/contracts";
import type { OwnerOnboardingSnapshot } from "@/lib/onboarding-contracts";

export type ClientOnboardingGate = {
  applies: boolean;
  checkable: boolean;
  complete: boolean;
  missing: string[];
};

const hasText = (value: string | null | undefined) => Boolean(value?.trim());

/**
 * Client owners/admins must finish the intake that the AI receptionist needs
 * before they can use the operational dashboard. Internal Cevanta workspaces
 * and lower-privilege roles keep their existing access rules.
 */
export function evaluateClientOnboardingGate(
  tenant: Pick<Tenant, "account_type">,
  role: Role,
  snapshot: OwnerOnboardingSnapshot | null,
  internalOperatorAccess = false,
): ClientOnboardingGate {
  const applies = tenant.account_type === "client" && (role === "owner" || role === "admin") && !internalOperatorAccess;
  if (!applies) return { applies: false, checkable: true, complete: true, missing: [] };
  if (!snapshot) return { applies: true, checkable: false, complete: false, missing: ["Setup could not be verified"] };

  const missing: string[] = [];
  if (!hasText(snapshot.workspace.name) || !hasText(snapshot.workspace.trade) || !hasText(snapshot.workspace.timezone)) {
    missing.push("business details");
  }
  const profile = snapshot.profile;
  if (!profile || !hasText(profile.business_contact_name) || (!hasText(profile.business_email) && !hasText(profile.business_phone))) {
    missing.push("an office contact");
  }
  if (!snapshot.services.some(service => service.enabled && hasText(service.name))) missing.push("at least one service");
  const openDay = snapshot.weekly_hours.some(day => !day.closed && day.intervals.length > 0);
  if (snapshot.weekly_hours.length !== 7 || !openDay) missing.push("weekly hours");
  if (!snapshot.booking?.acknowledged) missing.push("call and request rules");
  if (!snapshot.escalation.some(contact => contact.enabled && hasText(contact.contact_name) && (hasText(contact.email) || hasText(contact.phone)))) {
    missing.push("an escalation contact");
  }
  return { applies: true, checkable: true, complete: missing.length === 0, missing };
}
