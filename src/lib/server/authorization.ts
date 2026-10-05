import "server-only";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ROLES, type Role } from "@/lib/contracts";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const uuidSchema = z.uuid();
export async function requireUser() {
  if (!isSupabaseConfigured()) redirect("/setup");
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/sign-in");
  return { client, user };
}

export async function requireMembership(tenantId: string, allowedRoles?: readonly Role[]) {
  if (!uuidSchema.safeParse(tenantId).success) throw new Error("Workspace is unavailable.");
  const { client, user } = await requireUser();
  const { data, error } = await client.from("memberships").select("role").eq("tenant_id", tenantId).eq("user_id", user.id).maybeSingle();
  const role = z.enum(ROLES).safeParse(data?.role);
  if (error || !role.success || (allowedRoles && !allowedRoles.includes(role.data))) throw new Error("You do not have permission for this workspace.");
  return { client, user, role: role.data };
}
