export const APPOINTMENT_STATUSES = ["scheduled", "cancelled"] as const;
export const MAX_APPOINTMENT_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
/** Absolute UTC instants. Entry/display is explicitly UTC in this milestone. */
export interface Appointment {
  id: string;
  tenant_id: string;
  job_id: string;
  submission_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: typeof APPOINTMENT_STATUSES[number];
  created_at: string;
  updated_at: string;
}
