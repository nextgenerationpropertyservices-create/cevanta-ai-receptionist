import { z } from "zod";
import { ROLES } from "@/lib/contracts";

export const teamMemberSchema = z.object({
  tenantId: z.uuid(),
  email: z.email().max(254).transform(value => value.trim().toLowerCase()),
  role: z.enum(ROLES).refine(value => ["dispatcher","technician","viewer"].includes(value), "Choose dispatcher, technician, or viewer."),
});
