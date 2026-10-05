"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { OFFICE_ROLES } from "@/lib/contracts";
import { appointmentSchema } from "@/lib/appointments-validation";
import { requireMembership, uuidSchema } from "@/lib/server/authorization";
import type { ActionState } from "@/lib/server/action-state";

const missing = (code?: string) => code === "42P01" || code === "PGRST205";
const setupMessage = "Appointments need their database migration before saving.";

async function saveAppointment(form: FormData, editing: boolean): Promise<ActionState> {
  try {
    const tenantId = uuidSchema.parse(form.get("tenantId"));
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const targetId = uuidSchema.parse(form.get(editing ? "appointmentId" : "submissionId"));
    const parsed = appointmentSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the appointment fields." };

    let jobId: string | undefined;
    if (!editing) {
      jobId = uuidSchema.parse(form.get("job_id"));
      const replay = await client.from("appointments").select("id").eq("tenant_id", tenantId).eq("submission_id", targetId).maybeSingle();
      if (missing(replay.error?.code)) return { status: "error", message: setupMessage };
      if (replay.error) throw new Error("Lookup failed.");
      if (replay.data) {
        revalidatePath(`/workspaces/${tenantId}/calendar`);
        return { status: "success", message: "Appointment already saved." };
      }
      const job = await client.from("jobs").select("id").eq("tenant_id", tenantId).eq("id", jobId).maybeSingle();
      if (missing(job.error?.code)) return { status: "error", message: setupMessage };
      if (job.error || !job.data) throw new Error("Job unavailable.");
    }

    const result = editing
      ? await client.from("appointments").update(parsed.data).eq("tenant_id", tenantId).eq("id", targetId).select("id").single()
      : await client.from("appointments").insert({ ...parsed.data, tenant_id: tenantId, job_id: jobId, submission_id: targetId }).select("id").single();
    if (!editing && result.error?.code === "23505") {
      const replay = await client.from("appointments").select("id").eq("tenant_id", tenantId).eq("submission_id", targetId).maybeSingle();
      if (replay.error || !replay.data) throw new Error("Save failed.");
    } else {
      if (missing(result.error?.code)) return { status: "error", message: setupMessage };
      if (result.error || !result.data) throw new Error("Save failed.");
    }
    revalidatePath(`/workspaces/${tenantId}/calendar`);
    return { status: "success", message: "Appointment saved successfully." };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to save this appointment. Check your permissions and form values, then try again." };
  }
}

export async function createAppointment(_previous: ActionState, form: FormData): Promise<ActionState> {
  return saveAppointment(form, false);
}
export async function updateAppointment(_previous: ActionState, form: FormData): Promise<ActionState> {
  return saveAppointment(form, true);
}
