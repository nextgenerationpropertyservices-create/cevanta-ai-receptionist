import { beforeEach, describe, expect, it, vi } from "vitest";
const harness = vi.hoisted(() => ({ configured: true,
  user: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" } as { id: string } | null,
  authError: null as unknown, responses: [] as { data: unknown; error: unknown }[],
  calls: [] as { table: string; method: string; args: unknown[] }[], revalidate: vi.fn(),
}));
const reply = () => harness.responses.shift() ?? { data: null, error: null };
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => harness.configured }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: harness.user }, error: harness.authError }) },
  rpc: async (name: string, args: unknown) => { harness.calls.push({ table: name, method: "rpc", args: [args] }); return reply(); },
  from: (table: string) => {
    const response = reply();
    const chain = Object.fromEntries(["select", "eq", "order", "insert", "update", "single", "maybeSingle"].map(method => [method, (...args: unknown[]) => { harness.calls.push({ table, method, args }); return chain; }])) as Record<string, unknown>;
    chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve(response).then(resolve); return chain;
  },
}) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); }, unstable_rethrow: (error: unknown) => { if (error instanceof Error && error.message.startsWith("REDIRECT:")) throw error; } }));
vi.mock("next/cache", () => ({ revalidatePath: harness.revalidate }));
import { createAppointment, updateAppointment } from "@/app/actions/appointments";
import { getAppointments } from "@/lib/server/appointments-queries";

const tenant = "11111111-1111-4111-8111-111111111111";
const job = "22222222-2222-4222-8222-222222222222";
const submission = "33333333-3333-4333-8333-333333333333";




const idle = { status: "idle", message: "" } as const;
const form = (overrides: Record<string, string> = {}) => { const input = new FormData(); Object.entries({ tenantId: tenant, jobId: job, submissionId: submission, appointmentId: job, job_id: job, title: "Synthetic appointment", starts_at: "2026-10-03T10:00", ends_at: "2026-10-03T11:00", status: "scheduled", ...overrides }).forEach(([name,value]) => input.set(name,value)); return input; };
const respond = (...data: unknown[]) => { harness.responses = data.map(value => ({ data: value, error: null })); };
const writes = () => harness.calls.filter(call => ["insert", "update"].includes(call.method));
beforeEach(() => { harness.configured = true; harness.user = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }; harness.authError = null; harness.responses = []; harness.calls = []; });
describe("appointment auth and validation",()=>{
 it.each([createAppointment,updateAppointment])("preserves anonymous redirect",async action=>{harness.user=null;await expect(action(idle,form())).rejects.toThrow("REDIRECT:/sign-in");expect(harness.calls).toEqual([]);});
 it.each([createAppointment,updateAppointment])("preserves setup redirect",async action=>{harness.configured=false;await expect(action(idle,form())).rejects.toThrow("REDIRECT:/setup");expect(harness.calls).toEqual([]);});
 it("rejects unverified user before membership",async()=>{harness.authError={message:"synthetic-provider-detail"};await expect(createAppointment(idle,form())).rejects.toThrow("REDIRECT:/sign-in");expect(harness.calls).toEqual([]);});
 it.each(["technician","viewer","root",null])("blocks %s writes",async role=>{for(const action of [createAppointment,updateAppointment]){respond(role?{role}:null);harness.calls=[];expect((await action(idle,form())).status).toBe("error");expect(harness.calls.every(call=>call.table==="memberships")).toBe(true);expect(writes()).toEqual([]);}});
 it("scopes membership to verified subject and tenant",async()=>{respond({role:"viewer"});await createAppointment(idle,form({role:"owner",user_id:job}));expect(harness.calls).toContainEqual({table:"memberships",method:"eq",args:["user_id",harness.user!.id]});expect(harness.calls).toContainEqual({table:"memberships",method:"eq",args:["tenant_id",tenant]});});
 it("fails closed on membership error",async()=>{harness.responses=[{data:{role:"owner"},error:{message:"synthetic-provider-detail"}}];expect((await createAppointment(idle,form())).status).toBe("error");expect(writes()).toEqual([]);});
 it.each(["tenantId","submissionId","job_id","appointmentId"])("rejects invalid/missing %s",async field=>{for(const missing of[false,true]){respond({role:"owner"});harness.calls=[];const input=form({[field]:"bad"});if(missing)input.delete(field);expect((await (field==="appointmentId"?updateAppointment:createAppointment)(idle,input)).status).toBe("error");expect(writes()).toEqual([]);}});
 it.each<Record<string,string>>([{title:" "},{title:"x".repeat(161)},{starts_at:"bad"},{starts_at:"2026-02-30T10:00"},{starts_at:"2026-10-03T25:00"},{starts_at:"2026-10-03T10:00:00-04:00"},{ends_at:"2026-10-03T10:00"},{ends_at:"2026-10-03T09:59"},{ends_at:"2026-10-10T10:00:01"},{status:"completed"},{ends_at:""}])("rejects invalid fields %j",async fields=>{for(const action of[createAppointment,updateAppointment]){respond({role:"owner"});harness.calls=[];expect((await action(idle,form(fields))).status).toBe("error");expect(writes()).toEqual([]);expect(harness.calls.every(call=>call.table==="memberships")).toBe(true);}});
});
describe("appointment creates, edits and idempotency",()=>{
 it("fails closed on replay lookup failure before parent reads or writes", async () => {
  harness.responses = [{ data: { role: "owner" }, error: null }, { data: { id: job }, error: { message: "synthetic-provider-detail" } }];
  const result = await createAppointment(idle, form());
  expect(result.status).toBe("error");
  expect(result.message).not.toContain("synthetic-provider-detail");
  expect(writes()).toEqual([]);
  expect(harness.calls.some(call => call.table === "jobs")).toBe(false);
  expect(harness.revalidate).not.toHaveBeenCalled();
 });
 it("does not report a successful create when the database rejects the write", async () => {
  harness.responses = [{ data: { role: "dispatcher" }, error: null }, { data: null, error: null }, { data: { id: job }, error: null }, { data: null, error: { code: "42501", message: "synthetic-provider-detail" } }];
  const result = await createAppointment(idle, form());
  expect(result.status).toBe("error");
  expect(result.message).not.toContain("synthetic-provider-detail");
  expect(writes()).toHaveLength(1);
  expect(harness.revalidate).not.toHaveBeenCalled();
 });
 it.each(["owner","admin","dispatcher"])("allows %s create with trusted identities and explicit UTC",async role=>{
  respond({role},null,{id:job},{id:job});expect((await createAppointment(idle,form({tenant_id:"hostile",id:"hostile",submission_id:"hostile"}))).status).toBe("success");
  expect(writes()).toEqual([{table:"appointments",method:"insert",args:[{title:"Synthetic appointment",starts_at:"2026-10-03T10:00:00.000Z",ends_at:"2026-10-03T11:00:00.000Z",status:"scheduled",tenant_id:tenant,job_id:job,submission_id:submission}]}]);
  expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["tenant_id",tenant]});expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["id",job]});
  expect(harness.revalidate).toHaveBeenCalledExactlyOnceWith(`/workspaces/${tenant}/calendar`);
 });
 it("accepts ISO UTC and exactly seven days",async()=>{respond({role:"owner"},null,{id:job},{id:job});expect((await createAppointment(idle,form({starts_at:"2026-10-03T10:00:00Z",ends_at:"2026-10-10T10:00:00Z"}))).status).toBe("success");});
 it.each(["owner","admin","dispatcher"])("allows %s reschedule/cancel without reparenting",async role=>{respond({role},{id:job});expect((await updateAppointment(idle,form({status:"cancelled",job_id:"hostile",tenant_id:"hostile",submission_id:"hostile",id:"hostile"}))).status).toBe("success");expect(writes()).toEqual([{table:"appointments",method:"update",args:[{title:"Synthetic appointment",starts_at:"2026-10-03T10:00:00.000Z",ends_at:"2026-10-03T11:00:00.000Z",status:"cancelled"}]}]);expect(harness.calls).toContainEqual({table:"appointments",method:"eq",args:["tenant_id",tenant]});expect(harness.calls).toContainEqual({table:"appointments",method:"eq",args:["id",job]});expect(harness.calls.some(call=>call.table==="jobs")).toBe(false);});
 it("returns replay without new parent read or overwrite",async()=>{respond({role:"owner"},{id:job});expect((await createAppointment(idle,form())).message).toBe("Appointment already saved.");expect(writes()).toEqual([]);expect(harness.calls.some(call=>call.table==="jobs")).toBe(false);expect(harness.calls).toContainEqual({table:"appointments",method:"eq",args:["submission_id",submission]});});
 it.each([null,{message:"synthetic-provider-detail"}])("rejects absent/error parent %j",async error=>{harness.responses=[{data:{role:"owner"},error:null},{data:null,error:null},{data:null,error}];expect((await createAppointment(idle,form())).status).toBe("error");expect(writes()).toEqual([]);expect(harness.revalidate).not.toHaveBeenCalled();});
 it("recovers concurrent unique violation through tenant/token lookup",async()=>{harness.responses=[{data:{role:"owner"},error:null},{data:null,error:null},{data:{id:job},error:null},{data:null,error:{code:"23505"}},{data:{id:job},error:null}];expect((await createAppointment(idle,form())).status).toBe("success");expect(writes()).toHaveLength(1);const after=harness.calls.slice(harness.calls.findIndex(call=>call.method==="insert")+1);expect(after).toContainEqual({table:"appointments",method:"eq",args:["tenant_id",tenant]});expect(after).toContainEqual({table:"appointments",method:"eq",args:["submission_id",submission]});});
 it.each([null,{message:"synthetic-provider-detail"}])("fails safely when retry invisible/error %j",async error=>{harness.responses=[{data:{role:"owner"},error:null},{data:null,error:null},{data:{id:job},error:null},{data:null,error:{code:"23505"}},{data:null,error}];const result=await createAppointment(idle,form());expect(result.status).toBe("error");expect(result.message).not.toContain("synthetic-provider-detail");expect(harness.revalidate).not.toHaveBeenCalled();});
 it.each([null,{message:"synthetic-provider-detail"}])("rejects absent/error update %j",async error=>{harness.responses=[{data:{role:"owner"},error:null},{data:null,error}];const result=await updateAppointment(idle,form());expect(result.status).toBe("error");expect(result.message).not.toContain("synthetic-provider-detail");expect(harness.revalidate).not.toHaveBeenCalled();});
 it.each(["42P01","PGRST205"])("safe migration readiness on %s",async code=>{harness.responses=[{data:{role:"owner"},error:null},{data:null,error:{code}}];expect((await createAppointment(idle,form())).message).toContain("database migration");expect(writes()).toEqual([]);});
});
describe("appointment protected queries",()=>{
 it.each(["owner","admin","dispatcher","technician","viewer"])("reads %s through current parent RLS and tenant scope",async role=>{respond({role},[]);expect(await getAppointments(tenant)).toEqual({ready:true,appointments:[]});expect(harness.calls).toContainEqual({table:"appointments",method:"eq",args:["tenant_id",tenant]});expect(harness.calls).toContainEqual({table:"appointments",method:"order",args:["starts_at",{ascending:true}]});});
 it("redirects anonymous before data",async()=>{harness.user=null;await expect(getAppointments(tenant)).rejects.toThrow("REDIRECT:/sign-in");expect(harness.calls).toEqual([]);});
 it("rejects nonmember before appointment lookup",async()=>{respond(null);await expect(getAppointments(tenant)).rejects.toThrow("permission");expect(harness.calls.every(call=>call.table==="memberships")).toBe(true);});
 it.each(["42P01","PGRST205"])("returns not-ready on %s",async code=>{harness.responses=[{data:{role:"viewer"},error:null},{data:null,error:{code}}];expect(await getAppointments(tenant)).toEqual({ready:false,appointments:[]});});
 it("does not turn query failure into empty success",async()=>{harness.responses=[{data:{role:"viewer"},error:null},{data:null,error:{message:"synthetic-provider-detail"}}];await expect(getAppointments(tenant)).rejects.toThrow("Could not load appointments.");});
});


