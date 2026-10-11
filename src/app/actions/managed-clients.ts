"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/server/action-state";
import { managedClientWorkspaceSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const managedClientResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.union([z.literal("saved"), z.literal("replayed")]),
    workspace: z.object({ id: z.uuid(), name: z.string(), trade: z.string(), timezone: z.string(), account_type: z.literal("client"), status: z.string() }),
  }),
  z.object({ status: z.literal("validation_error"), issues: z.array(z.object({ field: z.string().optional(), path: z.string().optional(), code: z.string().optional(), message: z.string().optional() })).optional() }),
  z.object({ status: z.literal("conflict"), reason: z.string().optional() }),
  z.object({ status: z.union([z.literal("unavailable"), z.literal("retryable_failure")]) }),
]);

export async function provisionManagedClientWorkspace(_previous: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { status: "error", message: "Complete Supabase setup before creating client workspaces." };
  const parsed = managedClientWorkspaceSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: "Fix the client workspace details and try again.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  let destination: string | null = null;
  try {
    const client = await createClient();
    const { data, error } = await client.rpc("provision_managed_client_workspace", { input: parsed.data });
    if (error) {
      console.warn("[managedClient.provision]", { category: "rpc_error" });
      return { status: "error", message: "Client workspace creation is temporarily unavailable. Please try again." };
    }
    const response = managedClientResponseSchema.safeParse(data);
    if (!response.success) {
      console.warn("[managedClient.provision]", { category: "unexpected_response" });
      return { status: "error", message: "Client workspace creation is temporarily unavailable. Please try again." };
    }
    if (response.data.status === "saved" || response.data.status === "replayed") destination = `/workspaces/${response.data.workspace.id}/onboarding`;
    else if (response.data.status === "validation_error") return { status: "error", message: "Fix the client workspace details and try again." };
    else if (response.data.status === "conflict") return { status: "error", message: "This client workspace request was already used with different details. Refresh and try again." };
    else if (response.data.status === "unavailable") return { status: "error", message: "Only Cevanta internal owner/admin access can create managed client workspaces." };
    else return { status: "error", message: "Client workspace creation is temporarily unavailable. Please try again." };
  } catch {
    console.warn("[managedClient.provision]", { category: "unavailable" });
    return { status: "error", message: "Client workspace creation is temporarily unavailable. Please try again." };
  }
  redirect(destination);
}
