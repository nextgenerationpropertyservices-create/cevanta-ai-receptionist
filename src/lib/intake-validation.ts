import { z } from "zod";
import { LEAD_PRIORITIES, LEAD_STATUSES } from "./intake-contracts";
const optional = (max: number) => z.string().trim().max(max).optional().transform(value => value || null);
export const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(160),
  email: z.union([z.email().max(254), z.literal("")]).optional().transform(value => value || null),
  phone: optional(40), description: z.string().trim().min(1, "Description is required.").max(4000),
  priority: z.enum(LEAD_PRIORITIES), status: z.enum(LEAD_STATUSES),
  customer_id: z.union([z.uuid(), z.literal("")]).optional().transform(value => value || null),
  follow_up_date: z.union([z.iso.date(), z.literal("")]).optional().transform(value => value || null),
});
