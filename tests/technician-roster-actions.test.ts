import { beforeEach, describe, expect, it, vi } from "vitest";
const harness=vi.hoisted(()=>({rpc:vi.fn(),revalidate:vi.fn(),membership:vi.fn()}));
vi.mock("@/lib/server/authorization",()=>({requireMembership:harness.membership,uuidSchema:{parse:(value:unknown)=>String(value)}}));
vi.mock("next/cache",()=>({revalidatePath:harness.revalidate}));
vi.mock("next/navigation",()=>({unstable_rethrow:(error:unknown)=>{if(error instanceof Error && error.message.startsWith("REDIRECT:")) throw error;}}));
import { linkTechnicianRoster } from "@/app/actions/technician-roster";
const tenant="11111111-1111-4111-8111-111111111111";
const roster="22222222-2222-4222-8222-222222222222";
const idle={status:"idle",message:""} as const;
const form=(email:string)=>{const input=new FormData();input.set("tenantId",tenant);input.set("rosterId",roster);input.set("email",email);return input;};
beforeEach(()=>{harness.rpc.mockReset();harness.revalidate.mockClear();harness.membership.mockResolvedValue({client:{rpc:harness.rpc}});});
describe("technician roster actions",()=>{
 it("links only through the guarded server RPC",async()=>{harness.rpc.mockResolvedValue({data:{status:"linked"},error:null});const result=await linkTechnicianRoster(idle,form("Tech@Example.Invalid"));expect(result.status).toBe("success");expect(harness.rpc).toHaveBeenCalledWith("link_technician_roster",{input:{tenant_id:tenant,roster_id:roster,email:"tech@example.invalid"}});expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/jobs`);});
 it("rejects malformed email before any provider or database call",async()=>{const result=await linkTechnicianRoster(idle,form("not-an-email"));expect(result.status).toBe("error");expect(harness.rpc).not.toHaveBeenCalled();});
 it("explains that the account must already be confirmed",async()=>{harness.rpc.mockResolvedValue({data:{status:"account_not_found"},error:null});const result=await linkTechnicianRoster(idle,form("missing@example.invalid"));expect(result.message).toMatch(/confirmed Cevanta account/i);});
});