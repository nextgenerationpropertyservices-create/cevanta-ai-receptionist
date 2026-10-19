"use server";

import "server-only";
import { z } from "zod";
import { requireMembership } from "@/lib/server/authorization";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const agentIdSchema = z.string().trim().regex(/^agent_[A-Za-z0-9_-]{1,128}$/);
const connectionIdSchema = z.uuid();

export type RetellMappingResult =
  | { status: "mapped" | "already_mapped"; agent_id: string }
  | { status: "invalid_agent" | "not_configured" | "conflict" | "unavailable" };

export type RetellMappingPauseResult =
  | { status: "paused" }
  | { status: "not_mapped" | "not_configured" | "unavailable" };

export type RetellMappingHealth =
  | { status: "active" | "paused" | "not_mapped" | "not_configured" | "unavailable" };

/**
 * Registers an already-created Retell draft with the trusted Make connection.
 * The connection id is server configuration; callers can submit only an agent
 * id and must already be an owner/admin of the target workspace.
 */
export async function registerRetellAgentMapping(tenantId: string, rawAgentId: string): Promise<RetellMappingResult> {
  await requireMembership(tenantId, ["owner", "admin"]);
  try {
    const agent = agentIdSchema.safeParse(rawAgentId);
    const connection = connectionIdSchema.safeParse(process.env.MAKE_RETELL_INGRESS_CONNECTION_ID);
    if (!agent.success) return { status: "invalid_agent" };
    if (!isSupabaseConfigured() || !connection.success) return { status: "not_configured" };

    const db = createServiceClient().schema("integration_private");
    const existing = await db.from("retell_connections").select("tenant_id,enabled").eq("connection_id", connection.data).eq("provider_account_id", agent.data).maybeSingle();
    if (existing.error) return { status: "unavailable" };
    if (existing.data && existing.data.tenant_id !== tenantId) return { status: "conflict" };
    if (existing.data?.enabled) return { status: "already_mapped", agent_id: agent.data };

    const { error } = await db.from("retell_connections").upsert({
      tenant_id: tenantId,
      connection_id: connection.data,
      provider_account_id: agent.data,
      enabled: true,
    }, { onConflict: "connection_id,provider_account_id" });
    if (error) return { status: "unavailable" };
    return { status: existing.data ? "mapped" : "mapped", agent_id: agent.data };
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
  await requireMembership(tenantId, ["owner", "admin"]);
  try {
    const connection = connectionIdSchema.safeParse(process.env.MAKE_RETELL_INGRESS_CONNECTION_ID);
    if (!isSupabaseConfigured() || !connection.success) return { status: "not_configured" };

    const db = createServiceClient().schema("integration_private");
    const { data, error } = await db
      .from("retell_connections")
      .update({ enabled: false })
      .eq("tenant_id", tenantId)
      .eq("connection_id", connection.data)
      .eq("enabled", true)
      .select("provider_account_id");
    if (error) return { status: "unavailable" };
    return { status: data?.length ? "paused" : "not_mapped" };
  } catch {
    return { status: "unavailable" };
  }
}

/** Returns a non-sensitive tenant route state for the owner/admin Integrations page. */
export async function getRetellAgentMappingHealth(tenantId: string): Promise<RetellMappingHealth> {
  await requireMembership(tenantId, ["owner", "admin"]);
  try {
    const connection = connectionIdSchema.safeParse(process.env.MAKE_RETELL_INGRESS_CONNECTION_ID);
    if (!isSupabaseConfigured() || !connection.success) return { status: "not_configured" };

    const db = createServiceClient().schema("integration_private");
    const { data, error } = await db
      .from("retell_connections")
      .select("enabled")
      .eq("tenant_id", tenantId)
      .eq("connection_id", connection.data);
    if (error) return { status: "unavailable" };
    if (!data?.length) return { status: "not_mapped" };
    return { status: data.some(row => row.enabled) ? "active" : "paused" };
  } catch {
    return { status: "unavailable" };
  }
}
