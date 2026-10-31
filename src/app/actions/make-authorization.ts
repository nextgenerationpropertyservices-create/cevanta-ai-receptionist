"use server";

import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { requireMembership } from "@/lib/server/authorization";
import { createMakeAuthorization } from "@/lib/server/make-management";
import type { ActionState } from "@/lib/server/action-state";
import { getAuthoritativeWorkspacePlan, FREE_PLAN_LOCKED_MESSAGE } from "@/lib/workspace-plans";

const inputSchema = z.object({ tenantId: z.uuid(), name: z.string().trim().min(1, "Enter the client name.").max(255), email: z.email("Enter a valid client email.").max(256) });

export type MakeAuthorizationActionState = ActionState & { requestId?: string; publicUri?: string; providerStatus?: string; expiresAt?: string };

export async function createClientMakeAuthorization(_previous: MakeAuthorizationActionState, form: FormData): Promise<MakeAuthorizationActionState> {
  try {
    const parsed = inputSchema.safeParse({ tenantId: String(form.get("tenantId") ?? ""), name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") });
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the client details." };
    const { client } = await requireMembership(parsed.data.tenantId, ["owner", "admin"]);
    const plan = await getAuthoritativeWorkspacePlan(client, parsed.data.tenantId);
    if (plan === null || plan === "free") return { status: "error", message: FREE_PLAN_LOCKED_MESSAGE };
    const result = await createMakeAuthorization({ name: parsed.data.name, email: parsed.data.email });
    if (result.status === "created") return { status: "success", message: "Authorization link created. Send it to the client to connect the approved accounts.", requestId: result.requestId, publicUri: result.publicUri, providerStatus: result.providerStatus };
    if (result.status === "config_missing") return { status: "error", message: "Make management is not configured yet. Add MAKE_TEAM_ID and redeploy after saving the server-only token." };
    return { status: "error", message: "Make could not create the authorization link. Check the Make token scopes and team configuration." };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to create the authorization link. Check your workspace access and try again." };
  }
}

