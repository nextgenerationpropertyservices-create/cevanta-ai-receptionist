import { z } from "zod";
import { COMMON_TECHNICIAN_SKILLS, WEEKDAYS, type AvailabilityWindow } from "@/lib/technician-profiles";

const listFromText = (maxChars:number,maxItems:number,itemChars:number) => z.string().max(maxChars).optional().default("").transform((value, context) => {
 const items=Array.from(new Set(value.split(/[\n,]/).map(item => item.trim().toLowerCase()).filter(Boolean)));
 if(items.length>maxItems) context.addIssue({code:"custom",message:`Use ${maxItems} or fewer items.`});
 return items;
}).refine(items => items.every(item => item.length <= itemChars), `Keep each item under ${itemChars} characters.`);
const presetList = z.preprocess(value => Array.isArray(value) ? value : value ? [value] : [], z.array(z.string()).max(20)).default([]).transform((items, context) => {
 const normalized=Array.from(new Set(items.map(item => item.trim().toLowerCase()).filter(Boolean)));
 const allowed=new Set<string>(COMMON_TECHNICIAN_SKILLS);
 if(normalized.some(item => !allowed.has(item))) context.addIssue({code:"custom",message:"Choose skills from the available list."});
 return normalized;
});
const timePattern = /^$|^([01]\d|2[0-3]):[0-5]\d$/;
const timeField = z.string().trim().regex(timePattern, "Use 24-hour time like 08:00 or leave blank.").optional().default("");
const availabilityShape = Object.fromEntries(WEEKDAYS.flatMap(day => [[`availability_${day}_start`, timeField],[`availability_${day}_end`, timeField]])) as Record<string, typeof timeField>;

export const technicianRosterSchema = z.object({
 tenantId:z.uuid(),
 rosterId:z.preprocess(value => value || undefined,z.uuid().optional()),
 display_name:z.string().trim().min(1,"Enter a technician name.").max(160,"Keep the name under 160 characters."),
 email:z.preprocess(value => typeof value === "string" && value.trim() ? value : undefined,z.email().max(254).optional()),
 skills:listFromText(800,20,40),
 skill_presets:presetList,
 service_areas:listFromText(1000,30,60),
 availability_note:z.string().trim().max(500,"Availability note must be 500 characters or less.").optional().default(""),
 ...availabilityShape,
}).superRefine((value,context)=>{
 for(const day of WEEKDAYS) {
  const start=value[`availability_${day}_start` as keyof typeof value] as string;
  const end=value[`availability_${day}_end` as keyof typeof value] as string;
  if((start && !end) || (!start && end)) context.addIssue({code:"custom",path:[`availability_${day}_start`],message:"Add both start and end times for each availability window."});
  if(start && end && start >= end) context.addIssue({code:"custom",path:[`availability_${day}_start`],message:"Availability start time must be before end time."});
 }
}).transform(value=>({
 tenantId:value.tenantId,
 rosterId:value.rosterId,
 display_name:value.display_name,
 email:value.email,
 skills:Array.from(new Set([...value.skill_presets,...value.skills])).slice(0,20),
 service_areas:value.service_areas,
 availability_note:value.availability_note,
 availability_windows:WEEKDAYS.flatMap(day=>{
  const start=value[`availability_${day}_start` as keyof typeof value] as string;
  const end=value[`availability_${day}_end` as keyof typeof value] as string;
  return start && end ? [{day,start,end}] : [];
 }),
}));

export interface TechnicianRosterEntry { id:string; tenant_id:string; display_name:string; email:string|null; linked_user_id:string|null; skills:string[]; service_areas:string[]; availability_note:string; availability_windows:AvailabilityWindow[]; created_at:string; updated_at:string }
const safeArray=(value:unknown) => Array.isArray(value) ? Array.from(new Set(value.filter((item):item is string => typeof item === "string").map(item=>item.trim().toLowerCase()).filter(Boolean))).slice(0,30) : [];
const safeWindows=(value:unknown):AvailabilityWindow[] => Array.isArray(value) ? value.filter((item):item is AvailabilityWindow => !!item && typeof item === "object" && typeof (item as AvailabilityWindow).day === "string" && typeof (item as AvailabilityWindow).start === "string" && typeof (item as AvailabilityWindow).end === "string").slice(0,14) : [];
export function normalizeTechnicianRoster(row:Record<string,unknown>):TechnicianRosterEntry {
 return {
  id:String(row.id ?? ""),tenant_id:String(row.tenant_id ?? ""),display_name:String(row.display_name ?? "Technician"),
  email:typeof row.email === "string" ? row.email : null, linked_user_id:typeof row.linked_user_id === "string" ? row.linked_user_id : null,
  skills:safeArray(row.skills).slice(0,20),service_areas:safeArray(row.service_areas),availability_note:typeof row.availability_note === "string" ? row.availability_note.slice(0,500) : "",availability_windows:safeWindows(row.availability_windows),created_at:String(row.created_at ?? ""),updated_at:String(row.updated_at ?? "")
 };
}