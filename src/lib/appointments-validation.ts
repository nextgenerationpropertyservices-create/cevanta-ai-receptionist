import { z } from "zod";
import { APPOINTMENT_STATUSES, MAX_APPOINTMENT_DURATION_MS } from "./appointments-contracts";

// datetime-local values are explicitly entered in UTC, never server/browser local time.
const utcInstant = z.string().trim().transform(value => {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00Z`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return `${value}Z`;
  return value;
}).pipe(z.iso.datetime({ offset: false, message: "Enter a valid UTC date and time." }))
  .transform(value => new Date(value).toISOString());

export const appointmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  starts_at: utcInstant,
  ends_at: utcInstant,
  status: z.enum(APPOINTMENT_STATUSES),
}).superRefine((value, context) => {
  const duration = Date.parse(value.ends_at) - Date.parse(value.starts_at);
  if (duration <= 0 || duration > MAX_APPOINTMENT_DURATION_MS) {
    context.addIssue({ code: "custom", path: ["ends_at"], message: "End must be after start and within seven days." });
  }
});
