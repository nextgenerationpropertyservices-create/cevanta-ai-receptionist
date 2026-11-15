import "server-only";
import { z } from "zod";
import { requireMembership } from "./authorization";

export const FREE_TOOL_USERS_PAGE_SIZE = 50;

const rowSchema = z.object({
  workspace_id: z.uuid(),
  workspace_name: z.string(),
  email: z.email(),
  signed_up_at: z.iso.datetime({ offset: true }),
  last_opened_at: z.iso.datetime({ offset: true }).nullable(),
  last_tool_activity_at: z.iso.datetime({ offset: true }).nullable(),
  tools_used: z.array(z.string()),
  plan: z.enum(["free", "dashboard_plus", "managed_receptionist"]),
});

export async function getFreeToolUsers(operatorTenantId: string, offset: number) {
  const { client, user } = await requireMembership(operatorTenantId, ["owner", "admin"]);
  if (!user.email_confirmed_at) return null;

  const { data, error } = await client.rpc("list_free_tool_users", {
    p_operator_tenant_id: operatorTenantId,
    p_offset: offset,
  });
  if (error) return null;
  const parsed = z.array(rowSchema).max(FREE_TOOL_USERS_PAGE_SIZE + 1).safeParse(data);
  if (!parsed.success) return null;

  return {
    rows: parsed.data.slice(0, FREE_TOOL_USERS_PAGE_SIZE),
    hasNext: parsed.data.length > FREE_TOOL_USERS_PAGE_SIZE,
  };
}
