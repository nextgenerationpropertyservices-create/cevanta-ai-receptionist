"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/server/authorization";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const agentIdSchema = z.string().trim().regex(/^agent_[A-Za-z0-9_-]{1,128}$/);
const connectionIdSchema = z.uuid();
const tenantIdSchema = z.uuid();
const registerResultSchema = z.object({
  status: z.enum(["mapped", "already_mapped", "invalid_agent", "conflict", "unavailable"]),
}).strict();
const pauseResultSchema = z.object({
  status: z.enum(["paused", "not_mapped", "unavailable"]),
}).strict();
const healthResultSchema = z.object({
  status: z.enum(["active", "paused", "not_mapped", "unavailable"]),
}).strict();

export type RetellMappingResult =
  | { status: "mapped" | "already_mapped" }
  | { status: "invalid_agent" | "not_configured" | "conflict" | "unavailable" };

export type RetellMappingPauseResult =
  | { status: "paused" }
  | { status: "not_mapped" | "not_configured" | "unavailable" };

export type RetellMappingHealth =
  | { status: "active" | "paused" | "not_mapped" | "not_configured" | "unavailable" };

/**
 * Registers an already-created Retell draft with the trusted Make connection.
 * The connection id is server configuration; callers can submit only an agent
 * id. The authenticated database command is the final authority for the
 * operator role and active managed-client relationship.
 */
export async function registerRetellAgentMapping(tenantId: string, rawAgentId: string): Promise<RetellMappingResult> {
  const { client } = await requireUser();
  try {
    const tenant = tenantIdSchema.safeParse(tenantId);
    const agent = agentIdSchema.safeParse(rawAgentId);
    const connection = connectionIdSchema.safeParse(process.env.MAKE_RETELL_INGRESS_CONNECTION_ID);
    if (!agent.success) return { status: "invalid_agent" };
    if (!tenant.success) return { status: "unavailable" };
    if (!isSupabaseConfigured() || !connection.success) return { status: "not_configured" };

    const { data, error } = await client.rpc("retell_mapping_register", {
      p_tenant_id: tenant.data,
      p_connection_id: connection.data,
      p_provider_account_id: agent.data,
    });
    if (error) return { status: "unavailable" };
    const result = registerResultSchema.safeParse(data);
    if (!result.success) return { status: "unavailable" };
    if (result.data.status === "conflict") return { status: "conflict" };
    if (result.data.status === "unavailable") return { status: "unavailable" };
    if (result.data.status === "already_mapped") {
      revalidatePath(`/workspaces/${tenantId}/integrations`);
      return { status: "already_mapped" };
    }
    if (result.data.status === "mapped") {
      revalidatePath(`/workspaces/${tenantId}/integrations`);
      return { status: "mapped" };
    }
    return { status: "invalid_agent" };
  } catch {
    return { status: "unavailable" };
  }
}

/**
 * Reversibly stops this workspace's shared Make route from accepting Retell
 * events. This changes only the private tenant mapping; it does not delete
 * the Retell agent, change phone routing, or revoke provider credentials.
 */
export async function pauseRetellAgentMapping(tenantId: string): Promise<RetellMappingPauseResult> {
  const { client } = await requireUser();
  try {
    const tenant = tenantIdSchema.safeParse(tenantId);
    const connection = connectionIdSchema.safeParse(process.env.MAKE_RETELL_INGRESS_CONNECTION_ID);
    if (!tenant.success) return { status: "unavailable" };
    if (!isSupabaseConfigured() || !connection.success) return { status: "not_configured" };

    const { data, error } = await client.rpc("retell_mapping_pause", {
      p_tenant_id: tenant.data,
      p_connection_id: connection.data,
    });
    if (error) return { status: "unavailable" };
    const result = pauseResultSchema.safeParse(data);
    if (!result.success || result.data.status === "unavailable") return { status: "unavailable" };
    if (result.data.status === "paused") {
      revalidatePath(`/workspaces/${tenantId}/integrations`);
      return { status: "paused" };
    }
    return { status: "not_mapped" };
  } catch {
    return { status: "unavailable" };
  }
}

/** Returns a non-sensitive tenant route state for the owner/admin Integrations page. */
export async function getRetellAgentMappingHealth(tenantId: string): Promise<RetellMappingHealth> {
  const { client } = await requireUser();
  try {
    const tenant = tenantIdSchema.safeParse(tenantId);
    const connection = connectionIdSchema.safeParse(process.env.MAKE_RETELL_INGRESS_CONNECTION_ID);
    if (!tenant.success) return { status: "unavailable" };
    if (!isSupabaseConfigured() || !connection.success) return { status: "not_configured" };

    const { data, error } = await client.rpc("retell_mapping_health", {
      p_tenant_id: tenant.data,
      p_connection_id: connection.data,
    });
    if (error) return { status: "unavailable" };
    const result = healthResultSchema.safeParse(data);
    if (!result.success) return { status: "unavailable" };
    return result.data;
  } catch {
    return { status: "unavailable" };
  }
}
