export const LEAD_STATUSES = ["new", "contacted", "scheduled", "closed"] as const;
export const LEAD_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export interface Lead {
  id: string; tenant_id: string; submission_id: string; customer_id: string | null;
  name: string; email: string | null; phone: string | null; description: string;
  priority: typeof LEAD_PRIORITIES[number]; status: typeof LEAD_STATUSES[number];
  follow_up_date: string | null; created_at: string; updated_at: string;
}
