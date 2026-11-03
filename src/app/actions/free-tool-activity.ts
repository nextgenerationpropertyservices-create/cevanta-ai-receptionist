"use server";

import { requireMembership, uuidSchema } from "@/lib/server/authorization";

export async function recordFreeToolOpen(tenantId: string): Promise<void> {
  if (!uuidSchema.safeParse(tenantId).success) return;
  const { client, user } = await requireMembership(tenantId, ["owner"]);
  if (!user.email_confirmed_at) return;
  await client.rpc("record_free_tool_open", { p_tenant_id: tenantId });
}
