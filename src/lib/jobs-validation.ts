import { z } from "zod";
import { JOB_PRIORITIES, JOB_STATUSES } from "./jobs-contracts";
const optionalId = z.union([z.uuid(), z.literal("")]).optional().transform(value => value || null);
export const jobSchema = z.object({
 title: z.string().trim().min(1, "Title is required.").max(160), description: z.string().trim().min(1, "Description is required.").max(4000),
 status: z.enum(JOB_STATUSES), priority: z.enum(JOB_PRIORITIES),
 scheduled_date: z.union([z.iso.date(), z.literal("")]).optional().transform(value => value || null),
 assigned_user_id: optionalId, lead_id: optionalId, customer_id: optionalId, service_location_id: optionalId,
}).refine(value => value.status !== "scheduled" || !!value.scheduled_date, { message: "Scheduled jobs need a schedule date.", path: ["scheduled_date"] });

