import { z } from "zod";
export const permitStatuses = ["draft","ready","submitted","issued","closed"] as const;
export const permitStatusLabels = {draft:"Draft",ready:"Ready to file",submitted:"Submitted",issued:"Issued",closed:"Closed"};
export const permitFields = z.object({
  title:z.string().trim().min(1).max(160),site:z.string().trim().min(1).max(200),
  jurisdiction:z.string().trim().min(1).max(160),scope:z.string().trim().min(1).max(4000)
});
export const permitTracking = (today:string) => z.object({
  status:z.enum(permitStatuses),submitted_on:z.union([z.literal(""),z.iso.date()]),
  closeout_reference:z.string().trim().max(160).default(""),closed_on:z.union([z.literal(""),z.iso.date()]).default(""),
  permit_number:z.string().trim().max(100),next_followup:z.union([z.literal(""),z.iso.date()])
}).superRefine((v,ctx)=>{
  const issue=(message:string)=>ctx.addIssue({code:"custom",message});
  if (["submitted","issued","closed"].includes(v.status)&&!v.submitted_on) issue("Enter the actual submission date.");
  if (v.submitted_on && v.submitted_on > today) issue("Submission date cannot be in the future.");
  if (["issued","closed"].includes(v.status)&&!v.permit_number) issue("Enter the town-issued permit number.");
  if (v.closed_on && (v.closed_on > today || (v.submitted_on && v.closed_on < v.submitted_on))) issue("Enter a closure date between submission and today.");
  if (v.next_followup&&v.submitted_on&&v.next_followup<v.submitted_on) issue("Follow-up must be on or after submission.");
});
export type Permit = z.infer<typeof permitFields> & { id:string;job_id:string|null;status:typeof permitStatuses[number];submitted_on:string|null;permit_number:string;next_followup:string|null;closeout_reference?:string;closed_on?:string|null;updated_at:string };

export const utilityStates = {not_required:"Not required",pending:"Pending",scheduled:"Scheduled",complete:"Complete"};
export const inspectionStates = {not_scheduled:"Not scheduled",scheduled:"Scheduled",corrections:"Corrections required",passed:"Passed",cancelled:"Cancelled"};
export const permitOperations = z.object({
  parcel:z.string().trim().max(1000),
  permit_coordinator:z.string().trim().max(1000),
  blocker:z.string().trim().max(1000),
  utility_provider:z.string().trim().max(1000),
  meter_spot:z.string().trim().max(1000),
  inspection_type:z.string().trim().max(1000),
  first_inspection:z.string().trim().max(1000),
  load_reviewer:z.string().trim().max(1000),
  photo_checklist:z.string().trim().max(1000),
  inspection_preparation:z.string().trim().max(1000),
  existing_va:z.string().trim().regex(/^\d{0,9}$/),
  added_va:z.string().trim().regex(/^\d{0,9}$/),
  minimum_service:z.string().trim().regex(/^\d{0,9}$/),
  issued_on:z.union([z.literal(""),z.iso.date()]).transform(value=>value||null),
  expires_on:z.union([z.literal(""),z.iso.date()]).transform(value=>value||null),
  work_on:z.union([z.literal(""),z.iso.date()]).transform(value=>value||null),
  disconnect_on:z.union([z.literal(""),z.iso.date()]).transform(value=>value||null),
  reconnect_on:z.union([z.literal(""),z.iso.date()]).transform(value=>value||null),
  utility_status:z.enum(utilityStates),
  utility_reference:z.string().trim().max(160),
  inspection_status:z.enum(inspectionStates),
  inspection_date:z.union([z.literal(""),z.iso.date()]).transform(value=>value||null),
  inspection_notes:z.string().trim().max(4000)
}).refine(value=>value.inspection_status!=="scheduled" || value.inspection_date!==null, {
  message:"Enter an inspection date before marking it scheduled."
});
export type PermitOperations = z.infer<typeof permitOperations>;
export function permitLane(permit: Pick<Permit,"status"> & Partial<PermitOperations>) {
  if (permit.status==="closed") return "Closed out";
  if (permit.status==="issued") {
    if (permit.inspection_status==="passed" || permit.inspection_status==="scheduled" || permit.inspection_status==="corrections") return "Inspection";
    if (permit.utility_status==="pending" || permit.utility_status==="scheduled") return "Utility coordination";
  }
  return permit.status==="submitted" ? "AHJ review" : permitStatusLabels[permit.status];
}
export const permitLanes = ["Draft","Ready to file","AHJ review","Issued","Utility coordination","Inspection","Closed out"] as const;
