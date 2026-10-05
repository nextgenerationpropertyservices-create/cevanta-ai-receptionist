import type { Lead } from "@/lib/intake-contracts";

export const AI_RECEPTIONIST_MARKER = "AI receptionist call for office review.";

export function isNewAiReceptionistLead(lead: Lead) {
  return lead.status === "new" && lead.description.includes(AI_RECEPTIONIST_MARKER);
}

export function isAiReceptionistLead(lead: Lead) {
  return lead.description.includes(AI_RECEPTIONIST_MARKER);
}
