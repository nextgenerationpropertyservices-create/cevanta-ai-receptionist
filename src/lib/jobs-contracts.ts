export const JOB_STATUSES = ["new", "scheduled", "in_progress", "completed", "cancelled"] as const;
export const JOB_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export interface Job {
 id: string; tenant_id: string; submission_id: string; lead_id: string | null; customer_id: string | null; service_location_id: string | null;
 title: string; description: string; status: typeof JOB_STATUSES[number]; priority: typeof JOB_PRIORITIES[number];
 scheduled_date: string | null; assigned_user_id: string | null; created_at: string; updated_at: string;
}
export interface Technician { user_id: string; display_name: string }
