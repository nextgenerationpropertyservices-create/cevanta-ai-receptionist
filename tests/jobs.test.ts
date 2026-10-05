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
import { createJob, updateJob } from "@/app/actions/jobs";
import { getJob, getJobs, getTechnicians, getJobLocations } from "@/lib/server/jobs-queries";

const tenant = "11111111-1111-4111-8111-111111111111";
const job = "22222222-2222-4222-8222-222222222222";
const submission = "33333333-3333-4333-8333-333333333333";
const customer = "44444444-4444-4444-8444-444444444444";
const location = "55555555-5555-4555-8555-555555555555";
const lead = "66666666-6666-4666-8666-666666666666";
const technician = "77777777-7777-4777-8777-777777777777";
const idle = { status: "idle", message: "" } as const;
const form = (overrides: Record<string, string> = {}) => { const input = new FormData(); Object.entries({ tenantId: tenant, jobId: job, submissionId: submission, title: "Synthetic job", description: "Synthetic service description", status: "new", priority: "normal", ...overrides }).forEach(([name,value]) => input.set(name,value)); return input; };
const respond = (...data: unknown[]) => { harness.responses = data.map(value => ({ data: value, error: null })); };
const writes = () => harness.calls.filter(call => ["insert", "update"].includes(call.method));
beforeEach(() => { harness.configured = true; harness.user = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }; harness.authError = null; harness.responses = []; harness.calls = []; harness.revalidate.mockClear(); });

describe("job action authentication/permissions/validation", () => {
  it.each([createJob,updateJob])("preserves unconfigured setup redirects", async action => { harness.configured=false; await expect(action(idle,form())).rejects.toThrow("REDIRECT:/setup"); expect(harness.calls).toEqual([]); });
  it("fails closed on membership lookup errors and uses verified subject",async()=>{
    harness.responses=[{data:{role:"owner"},error:{message:"synthetic-provider-detail"}}];
    expect((await createJob(idle,form({user_id:technician,role:"owner"}))).status).toBe("error");expect(writes()).toEqual([]);
    expect(harness.calls).toContainEqual({table:"memberships",method:"eq",args:["user_id",harness.user!.id]});
    expect(harness.calls).toContainEqual({table:"memberships",method:"eq",args:["tenant_id",tenant]});
  });
  it.each([createJob,updateJob])("preserves anonymous redirects", async action => { harness.user = null; await expect(action(idle,form())).rejects.toThrow("REDIRECT:/sign-in"); expect(harness.calls).toEqual([]); });
  it("fails closed on verified-user failure", async () => { harness.authError = { message: "synthetic-auth-error" }; await expect(createJob(idle,form())).rejects.toThrow("REDIRECT:/sign-in"); expect(harness.calls).toEqual([]); });
  it.each(["technician","viewer","root",null])("blocks %s writes before jobs reads", async role => {
    for (const action of [createJob,updateJob]) { respond(role ? { role } : null); harness.calls=[]; expect((await action(idle,form())).status).toBe("error"); expect(writes()).toEqual([]); expect(harness.calls.every(call => call.table === "memberships")).toBe(true); expect(harness.revalidate).not.toHaveBeenCalled(); }
  });
  it.each(["tenantId","submissionId","jobId"])("rejects invalid/missing %s", async field => {
    const action = field === "jobId" ? updateJob : createJob;
    for (const missing of [false,true]) { respond({ role:"owner" }); harness.calls=[]; const input=form({[field]:"bad"}); if(missing)input.delete(field); expect((await action(idle,input)).status).toBe("error"); expect(writes()).toEqual([]); expect(harness.calls.every(call => call.table === "memberships")).toBe(true); }
  });
  it.each<Record<string,string>>([{title:" "},{description:""},{title:"x".repeat(161)},{priority:"root"},{status:"root"},{status:"scheduled"},{scheduled_date:"2026-02-30"},{assigned_user_id:"bad"},{customer_id:"bad"},{service_location_id:"bad"},{lead_id:"bad"}])("rejects invalid fields %j", async fields => { respond({role:"owner"}); expect((await createJob(idle,form(fields))).status).toBe("error"); expect(writes()).toEqual([]); });
});

describe("job actual creates, parent chains and retry handling", () => {
  it.each(["owner","admin","dispatcher"])("allows %s trusted create payload",async role=>{
    respond({role},null,{id:job}); expect((await createJob(idle,form({tenant_id:"hostile",id:"hostile",submission_id:"hostile"}))).status).toBe("success");
    expect(writes()).toEqual([{table:"jobs",method:"insert",args:[{title:"Synthetic job",description:"Synthetic service description",status:"new",priority:"normal",scheduled_date:null,assigned_user_id:null,lead_id:null,customer_id:null,service_location_id:null,tenant_id:tenant,submission_id:submission}]}]);
    expect(harness.revalidate).toHaveBeenCalledExactlyOnceWith(`/workspaces/${tenant}/jobs`);
  });
  it("checks full lead/customer/location chain and technician roster before inserting",async()=>{
    respond({role:"owner"},null,{id:lead,customer_id:customer},null,{id:customer},{id:location},[{user_id:technician,display_name:"Synthetic technician"}],{id:job},{id:lead});
    expect((await createJob(idle,form({lead_id:lead,customer_id:customer,service_location_id:location,assigned_user_id:technician,status:"scheduled",scheduled_date:"2026-10-03"}))).status).toBe("success");
    for(const [table,field,value] of [["leads","tenant_id",tenant],["leads","id",lead],["customers","tenant_id",tenant],["customers","id",customer],["service_locations","tenant_id",tenant],["service_locations","customer_id",customer],["service_locations","id",location]]) expect(harness.calls).toContainEqual({table,method:"eq",args:[field,value]});
    expect(harness.calls).toContainEqual({table:"get_tenant_technicians",method:"rpc",args:[{target:tenant}]});
    expect(writes()).toContainEqual({table:"leads",method:"update",args:[{status:"scheduled"}]});
  });
  it("marks converted new lead contacted after creating an unscheduled job",async()=>{
    respond({role:"dispatcher"},null,{id:lead,customer_id:null},null,{id:job},{id:lead});
    expect((await createJob(idle,form({lead_id:lead}))).status).toBe("success");
    expect(writes()).toContainEqual({table:"leads",method:"update",args:[{status:"contacted"}]});
    expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/leads`);
    expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/leads/${lead}`);
    expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/jobs`);
  });
  it.each(["lead","lead mismatch","customer","location","location without customer","technician"])("rejects invalid/invisible %s before write",async stage=>{
    const fields:Record<string,string>={};
    if(stage.startsWith("lead")){ fields.lead_id=lead;fields.customer_id=customer;respond({role:"owner"},null,stage==="lead"?null:{id:lead,customer_id:location}); }
    else if(stage==="customer"){fields.customer_id=customer;respond({role:"owner"},null,null);}
    else if(stage==="location"){fields.customer_id=customer;fields.service_location_id=location;respond({role:"owner"},null,{id:customer},null);}
    else if(stage==="location without customer"){fields.service_location_id=location;respond({role:"owner"},null);}
    else {fields.assigned_user_id=technician;respond({role:"owner"},null,[{user_id:customer}]);}
    expect((await createJob(idle,form(fields))).status).toBe("error");expect(writes()).toEqual([]);expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it("returns existing token job without overwriting or reading new parents",async()=>{
    respond({role:"owner"},{id:job}); expect((await createJob(idle,form({customer_id:customer,title:"Synthetic overwrite attempt"}))).message).toBe("Job already saved.");expect(writes()).toEqual([]);
    expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["tenant_id",tenant]});expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["submission_id",submission]});
    expect(harness.calls.some(call=>call.table==="customers")).toBe(false);
  });
  it("returns existing lead conversion without creating another job",async()=>{
    respond({role:"owner"},null,{id:lead,customer_id:customer},{id:job});expect((await createJob(idle,form({lead_id:lead,customer_id:customer}))).message).toBe("Lead already has a job.");expect(writes()).toEqual([]);
    expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["tenant_id",tenant]});expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["lead_id",lead]});
  });
  it("handles concurrent duplicate token insert through scoped lookup",async()=>{
    harness.responses=[{data:{role:"owner"},error:null},{data:null,error:null},{data:null,error:{code:"23505",message:"synthetic-provider-detail"}},{data:{id:job},error:null}];
    expect((await createJob(idle,form())).status).toBe("success");expect(writes().map(call=>call.method)).toEqual(["insert"]);
    const after=harness.calls.slice(harness.calls.findIndex(call=>call.method==="insert")+1);expect(after).toContainEqual({table:"jobs",method:"eq",args:["tenant_id",tenant]});expect(after).toContainEqual({table:"jobs",method:"eq",args:["submission_id",submission]});
  });
  it("handles concurrent conversion duplicate through scoped lead fallback",async()=>{
    harness.responses=[{data:{role:"owner"},error:null},{data:null,error:null},{data:{id:lead,customer_id:null},error:null},{data:null,error:null},{data:null,error:{code:"23505"}},{data:null,error:null},{data:{id:job},error:null},{data:{id:lead},error:null}];
    expect((await createJob(idle,form({lead_id:lead}))).status).toBe("success");expect(writes().map(call=>call.method)).toEqual(["insert","update"]);
    expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["lead_id",lead]});
  });
  it("rejects duplicate error without visible matching retry record",async()=>{
    harness.responses=[{data:{role:"owner"},error:null},{data:null,error:null},{data:null,error:{code:"23505"}},{data:null,error:null}];expect((await createJob(idle,form())).status).toBe("error");expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it.each(["42P01","PGRST205"])("reports missing schema %s with a safe message",async code=>{
    harness.responses=[{data:{role:"owner"},error:null},{data:null,error:{code,message:"synthetic-provider-detail"}}];expect((await createJob(idle,form())).message).toContain("database migration");expect(writes()).toEqual([]);expect(harness.revalidate).not.toHaveBeenCalled();
  });
});

describe("job update and member-scoped queries",()=>{
  it.each([getJobs,getTechnicians,getJobLocations])("preserves anonymous query redirects",async query=>{harness.user=null;await expect(query(tenant)).rejects.toThrow("REDIRECT:/sign-in");expect(harness.calls).toEqual([]);});
  it("scopes office location directory to tenant",async()=>{respond({role:"admin"},[]);expect(await getJobLocations(tenant)).toEqual({ready:true,locations:[]});expect(harness.calls).toContainEqual({table:"service_locations",method:"eq",args:["tenant_id",tenant]});});
  it.each([getTechnicians,getJobLocations])("does not mask provider directory errors",async query=>{harness.responses=[{data:{role:"owner"},error:null},{data:null,error:{message:"synthetic-provider-detail"}}];await expect(query(tenant)).rejects.toThrow("Could not load");});
  it.each(["owner","admin","dispatcher"])("allows %s business update without identity or parent reassignment",async role=>{
    respond({role},[{user_id:technician}],{id:job});expect((await updateJob(idle,form({assigned_user_id:technician,lead_id:lead,customer_id:customer,service_location_id:location,tenant_id:"hostile",id:"hostile",submission_id:"hostile"}))).status).toBe("success");
    expect(writes()).toEqual([{table:"jobs",method:"update",args:[{title:"Synthetic job",description:"Synthetic service description",status:"new",priority:"normal",scheduled_date:null,assigned_user_id:technician}]}]);
    expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["tenant_id",tenant]});expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["id",job]});
    expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/jobs`);expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/jobs/${job}`);
  });
  it("does not write when selected technician is absent from tenant roster",async()=>{respond({role:"owner"},[]);expect((await updateJob(idle,form({assigned_user_id:technician}))).status).toBe("error");expect(writes()).toEqual([]);expect(harness.revalidate).not.toHaveBeenCalled();});
  it.each([null,{message:"synthetic-provider-detail"}])("handles absent/error update safely %j",async error=>{harness.responses=[{data:{role:"owner"},error:null},{data:null,error}];const result=await updateJob(idle,form());expect(result.status).toBe("error");expect(result.message).not.toContain("synthetic-provider-detail");expect(harness.revalidate).not.toHaveBeenCalled();});
  it.each(["owner","admin","dispatcher","viewer"])("reads %s tenant jobs without assignment filter",async role=>{respond({role},[]);expect(await getJobs(tenant)).toEqual({ready:true,jobs:[]});expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["tenant_id",tenant]});expect(harness.calls.some(call=>call.table==="jobs"&&call.args[0]==="assigned_user_id")).toBe(false);});
  it("filters technician list and detail by verified identity, never input subject",async()=>{
    respond({role:"technician"},[]);await getJobs(tenant);expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:["assigned_user_id",harness.user!.id]});
    harness.calls=[];respond({role:"technician"},null);expect(await getJob(tenant,job)).toEqual({ready:true,job:null});for(const [field,value]of[["tenant_id",tenant],["id",job],["assigned_user_id",harness.user!.id]])expect(harness.calls).toContainEqual({table:"jobs",method:"eq",args:[field,value]});
  });
  it("rejects nonmember before jobs reads",async()=>{respond(null);await expect(getJobs(tenant)).rejects.toThrow("permission");expect(harness.calls.every(call=>call.table==="memberships")).toBe(true);});
  it("returns null for malformed job ID without jobs lookup",async()=>{respond({role:"viewer"});expect(await getJob(tenant,"bad")).toEqual({ready:true,job:null});expect(harness.calls.every(call=>call.table==="memberships")).toBe(true);});
  it.each(["technician","viewer"])("blocks %s roster and location directories server-side",async role=>{for(const query of[getTechnicians,getJobLocations]){respond({role});harness.calls=[];await expect(query(tenant)).rejects.toThrow("permission");expect(harness.calls.every(call=>call.table==="memberships")).toBe(true);}});
  it("scopes office roster RPC to requested tenant",async()=>{respond({role:"dispatcher"},[]);expect(await getTechnicians(tenant)).toEqual({ready:true,technicians:[]});expect(harness.calls).toContainEqual({table:"get_tenant_technicians",method:"rpc",args:[{target:tenant}]});});
  it.each(["42P01","PGRST205","PGRST202"])("returns safe not-ready envelope %s",async code=>{harness.responses=[{data:{role:"viewer"},error:null},{data:null,error:{code}}];expect(await getJobs(tenant)).toEqual({ready:false,jobs:[]});});
  it("does not mask other query errors as empty records",async()=>{harness.responses=[{data:{role:"viewer"},error:null},{data:null,error:{message:"synthetic-provider-detail"}}];await expect(getJobs(tenant)).rejects.toThrow("Could not load jobs.");});
});
