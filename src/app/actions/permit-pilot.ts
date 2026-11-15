"use server";

import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requirePermitWorkspace } from "@/lib/server/permits";
import { getWorkspaceRecord } from "@/lib/server/queries";

const accessInput = z.object({
  client: z.string().uuid(),
  command: z.enum(["enable", "pause", "save"]),
  expiry: z.string(),
  mode: z.enum(["permits", "bundle"]).optional(),
  dashboard: z.literal("on").optional(),
  permitdesk: z.literal("on").optional(),
});

export async function setPermitPilotAccess(operatorId: string, form: FormData) {
  const { client, tenant, role } = await getWorkspaceRecord(operatorId);
  if (tenant.account_type !== "internal" || (role !== "owner" && role !== "admin")) notFound();
  const path = `/workspaces/${operatorId}/permit-pilot`;
  const input = accessInput.safeParse(Object.fromEntries(form));
  if (!input.success) redirect(`${path}?result=invalid`);
  const enable = input.data.command === "save" ? input.data.permitdesk === "on" : input.data.command === "enable";
  const date = input.data.expiry;
  const midnight = new Date(`${date}T00:00:00.000Z`);
  if (enable && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(+midnight) ||
    !midnight.toISOString().startsWith(date) || +midnight <= Date.now())) redirect(`${path}?result=invalid`);
  const { error } = await client.rpc("set_permit_pilot_access", {
    operator_id: operatorId,
    client_id: input.data.client,
    enable_access: enable,
    end_at: enable ? midnight.toISOString() : null,
    permits_only: input.data.command === "save" ? input.data.dashboard !== "on" : input.data.mode === "permits",
  });
  redirect(`${path}?result=${error ? "error" : "saved"}`);
}

const feedbackInput = z.object({
  receipt: z.string().uuid(),
  category: z.enum(["What worked", "Issue or friction", "Suggestion", "End-of-pilot review"]),
  rating: z.enum(["", "1", "2", "3", "4", "5"]),
  message: z.string().trim().min(1).max(3000),
  review: z.string().trim().max(1500),
  quote: z.literal("on").optional(),
});

export async function submitPermitPilotFeedback(tenantId: string, form: FormData) {
  const { client } = await requirePermitWorkspace(tenantId);
  const path = `/workspaces/${tenantId}/permits/feedback`;
  const input = feedbackInput.safeParse(Object.fromEntries(form));
  if (!input.success) redirect(`${path}?result=invalid`);
  const { receipt, category, rating, message, review, quote } = input.data;
  const { error } = await client.rpc("submit_permit_pilot_feedback", {
    target: tenantId,
    feedback_id: receipt,
    feedback_category: category,
    feedback_rating: rating === "" ? null : Number(rating),
    feedback_message: message,
    feedback_review: review,
    quote_permission: Boolean(quote && review),
  });
  redirect(`${path}?result=${error ? "error" : "saved"}`);
}
