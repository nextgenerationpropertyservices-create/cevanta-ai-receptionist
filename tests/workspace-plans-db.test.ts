import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202610310001_workspace_plans.sql", "utf8");
const boundaryMigration = readFileSync("supabase/migrations/202610310002_free_plan_trusted_boundaries.sql", "utf8");

describe("workspace plan migration safeguards", () => {
  it("backfills existing workspaces before making free the new default", () => {
    expect(migration).toMatch(/update public\.tenants set plan='managed_receptionist'/);
    expect(migration.indexOf("update public.tenants set plan='managed_receptionist'")).toBeLessThan(migration.indexOf("alter column plan set default 'free'"));
  });

  it("locks capacity by tenant in database triggers", () => {
    expect(migration).toMatch(/where id=new\.tenant_id for update/);
    expect(migration).toContain("free_plan_active_lead_limit");
    expect(migration).toContain("free_plan_technician_limit");
  });

  it("explicitly provisions managed workspaces and blocks free provider ingress before effects", () => {
    expect(migration).toContain("'managed_receptionist'");
    const restriction = migration.indexOf("if tenant_plan='free' then return jsonb_build_object('status','plan_restricted')");
    expect(restriction).toBeGreaterThan(0);
    expect(restriction).toBeLessThan(migration.indexOf("perform pg_advisory_xact_lock(hashtextextended('retell-lead:"));
  });

  it("guards direct paid-feature database boundaries for free workspaces", () => {
    expect(boundaryMigration).toMatch(/create or replace function public\.create_reactivation_campaign[\s\S]*?tenant_plan[\s\S]*?tenant_plan = 'free'/i);
    expect(boundaryMigration).toMatch(/create trigger enforce_workspace_automation_controls_free_plan[\s\S]*?workspace_automation_controls/i);
    expect(boundaryMigration).toMatch(/create or replace function public\.retell_mapping_register[\s\S]*?tenant_plan[\s\S]*?tenant_plan = 'free'/i);
    expect(boundaryMigration).toContain("free_plan_automation_restricted");
  });
});
