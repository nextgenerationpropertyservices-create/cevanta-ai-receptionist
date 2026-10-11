import { z } from "zod";

const skillList = z.string().max(800).transform(value => Array.from(new Set(value.split(/[\n,]/).map(item => item.trim().toLowerCase()).filter(Boolean))).slice(0,20));

export const technicianProfileSchema = z.object({
 tenantId: z.uuid(),
 userId: z.uuid(),
 skills: skillList.refine(items => items.every(item => item.length <= 40), "Keep each skill under 40 characters."),
 availability_note: z.string().trim().max(500, "Availability note must be 500 characters or less.").optional().transform(value => value ?? ""),
});

export interface TechnicianProfile { id:string; tenant_id:string; user_id:string; skills:string[]; availability_note:string; created_at:string; updated_at:string }

