import { z } from "zod";
export const permitStatuses = ["draft","ready","submitted","issued","closed"] as const;
export const permitStatusLabels = {draft:"Draft",ready:"Ready to file",submitted:"Submitted",issued:"Issued",closed:"Closed"};
export const permitFields = z.object({
  title:z.string().trim().min(1).max(160),site:z.string().trim().min(1).max(200),
  jurisdiction:z.string().trim().min(1).max(160),scope:z.string().trim().min(1).max(4000)
});
export const permitTracking = (today:string) => z.object({
  status:z.enum(permitStatuses),submitted_on:z.union([z.literal(""),z.iso.date()]),
  permit_number:z.string().trim().max(100),next_followup:z.union([z.literal(""),z.iso.date()])
}).superRefine((v,ctx)=>{
  const issue=(message:string)=>ctx.addIssue({code:"custom",message});
  if (["submitted","issued","closed"].includes(v.status)&&!v.submitted_on) issue("Enter the actual submission date.");
  if (v.submitted_on && v.submitted_on > today) issue("Submission date cannot be in the future.");
  if (["issued","closed"].includes(v.status)&&!v.permit_number) issue("Enter the town-issued permit number.");
  if (v.next_followup&&v.submitted_on&&v.next_followup<v.submitted_on) issue("Follow-up must be on or after submission.");
});
export type Permit = z.infer<typeof permitFields> & { id:string;job_id:string|null;status:typeof permitStatuses[number];submitted_on:string|null;permit_number:string;next_followup:string|null;updated_at:string };
