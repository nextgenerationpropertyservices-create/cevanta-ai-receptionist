import { z } from "zod";

export const WEEKDAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
export type Weekday = typeof WEEKDAYS[number];
export interface AvailabilityWindow { day: Weekday; start: string; end: string }

const timePattern = /^$|^([01]\d|2[0-3]):[0-5]\d$/;
const storedTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const listFromText = (maxChars:number,maxItems:number,itemChars:number) => z.string().max(maxChars).optional().default("").transform((value, context) => {
 const items=Array.from(new Set(value.split(/[\n,]/).map(item => item.trim().toLowerCase()).filter(Boolean)));
 if(items.length>maxItems) context.addIssue({code:"custom",message:`Use ${maxItems} or fewer items.`});
 return items;
}).refine(items => items.every(item => item.length <= itemChars), `Keep each item under ${itemChars} characters.`);
const timeField = z.string().trim().regex(timePattern, "Use 24-hour time like 08:00 or leave blank.").optional().default("");
const availabilityShape = Object.fromEntries(WEEKDAYS.flatMap(day => [[`availability_${day}_start`, timeField],[`availability_${day}_end`, timeField]])) as Record<string, typeof timeField>;

export const technicianProfileSchema = z.object({
 tenantId: z.uuid(),
 userId: z.uuid(),
 skills: listFromText(800,20,40),
 service_areas: listFromText(1000,30,60),
 availability_note: z.string().trim().max(500, "Availability note must be 500 characters or less.").optional().transform(value => value ?? ""),
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
 userId:value.userId,
 skills:value.skills,
 service_areas:value.service_areas,
 availability_note:value.availability_note,
 availability_windows:WEEKDAYS.flatMap(day=>{
  const start=value[`availability_${day}_start` as keyof typeof value] as string;
  const end=value[`availability_${day}_end` as keyof typeof value] as string;
  return start && end ? [{day,start,end}] : [];
 }),
}));

const storedWindow = z.object({day:z.enum(WEEKDAYS),start:z.string().regex(storedTimePattern),end:z.string().regex(storedTimePattern)}).strict().refine(value=>value.start<value.end);
const safeTextArray = (value:unknown,maxItems:number,itemChars:number) => {
 const parsed=z.array(z.string()).safeParse(value);
 if(!parsed.success) return [];
 return Array.from(new Set(parsed.data.map(item=>item.trim().toLowerCase()).filter(item=>item.length>0 && item.length<=itemChars))).slice(0,maxItems);
};
const safeWindows = (value:unknown) => {
 const parsed=z.array(storedWindow).safeParse(value);
 if(!parsed.success) return [];
 const seen=new Set<Weekday>();
 return parsed.data.filter(window=>{if(seen.has(window.day)) return false; seen.add(window.day); return true;}).slice(0,14);
};

export interface TechnicianProfile { id:string; tenant_id:string; user_id:string; skills:string[]; service_areas:string[]; availability_note:string; availability_windows:AvailabilityWindow[]; created_at:string; updated_at:string }

export function normalizeTechnicianProfile(row: Record<string, unknown>): TechnicianProfile {
 return {
  id:String(row.id ?? ""),
  tenant_id:String(row.tenant_id ?? ""),
  user_id:String(row.user_id ?? ""),
  skills:safeTextArray(row.skills,20,40),
  service_areas:safeTextArray(row.service_areas,30,60),
  availability_note:typeof row.availability_note === "string" ? row.availability_note.slice(0,500) : "",
  availability_windows:safeWindows(row.availability_windows),
  created_at:String(row.created_at ?? ""),
  updated_at:String(row.updated_at ?? ""),
 };
}
