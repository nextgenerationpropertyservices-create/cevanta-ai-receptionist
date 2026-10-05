import "server-only";
import type { Appointment } from "@/lib/appointments-contracts";
import { requireMembership } from "./authorization";

export async function getAppointments(tenantId: string): Promise<{ ready: boolean; appointments: Appointment[] }> {
  const { client } = await requireMembership(tenantId);
  // RLS joins the parent job's current visibility; no stored assignment can drift.
  const result = await client.from("appointments").select("*").eq("tenant_id", tenantId).order("starts_at", { ascending: true });
  if (result.error?.code === "42P01" || result.error?.code === "PGRST205") return { ready: false, appointments: [] };
  if (result.error) throw new Error("Could not load appointments.");
  return { ready: true, appointments: (result.data ?? []) as Appointment[] };
}
