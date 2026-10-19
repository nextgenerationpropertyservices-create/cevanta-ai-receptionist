import { describe, expect, it } from "vitest";
import { normalizeTechnicianRoster, technicianRosterSchema } from "@/lib/technician-roster";

const tenantId="11111111-1111-4111-8111-111111111111";

describe("technician roster", () => {
 it("allows a name and skills before an email exists", () => {
  const result=technicianRosterSchema.parse({tenantId,display_name:"Casey Field Tech",skill_presets:["no heat","maintenance"],skills:"mini split"});
  expect(result.email).toBeUndefined();
  expect(result.skills).toEqual(["no heat","maintenance","mini split"]);
 });
 it("normalizes stored roster data safely", () => {
  const entry=normalizeTechnicianRoster({id:"roster",tenant_id:tenantId,display_name:"Casey",email:null,linked_user_id:null,skills:["No Heat","no heat",""],service_areas:["Lewiston"],availability_windows:[],availability_note:""});
  expect(entry.skills).toEqual(["no heat"]);
  expect(entry.linked_user_id).toBeNull();
 });
 it("rejects unknown preset skills", () => {
  expect(technicianRosterSchema.safeParse({tenantId,display_name:"Casey",skill_presets:["not-a-skill"]}).success).toBe(false);
 });
});