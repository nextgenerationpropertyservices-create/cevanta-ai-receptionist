import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const migration = [
  read("supabase/migrations/202610310001_workspace_plans.sql"),
  read("supabase/migrations/202610310002_free_plan_trusted_boundaries.sql"),
].join("\n");

describe("free-tier security boundaries", () => {
  it("keeps the plan column outside ordinary tenant update grants", () => {
    const foundation = read("supabase/migrations/202610020001_foundation.sql");
    expect(foundation).toMatch(/grant update\(name,trade,timezone\) on public\.tenants to authenticated/i);
    expect(migration).not.toMatch(/grant update\([^)]*plan[^)]*\) on public\.tenants to authenticated/i);
  });

  it("blocks mapped free Retell events before receipts, leads, or notifications", () => {
    const planGuard = migration.indexOf("if tenant_plan='free'");
    expect(planGuard).toBeGreaterThan(-1);
    expect(planGuard).toBeLessThan(migration.indexOf("insert into public.leads", planGuard));
    expect(planGuard).toBeLessThan(migration.indexOf("insert into integration_private.retell_event_receipts", planGuard));
    expect(planGuard).toBeLessThan(migration.indexOf("insert into integration_private.office_notification_outbox", planGuard));
  });

  it("enforces the plan inside direct authenticated reactivation RPCs", () => {
    expect(migration).toMatch(/create or replace function public\.create_reactivation_campaign[\s\S]*?tenant_plan[\s\S]*?=\s*'free'/i);
    expect(migration).toMatch(/create or replace function public\.review_reactivation_candidate[\s\S]*?tenant_plan[\s\S]*?=\s*'free'/i);
    expect(migration).toMatch(/create or replace function public\.schedule_reactivation_visit[\s\S]*?tenant_plan[\s\S]*?=\s*'free'/i);
  });

  it("prevents direct authenticated automation-control writes for free tenants", () => {
    expect(migration).toMatch(/create trigger[^;]*workspace_automation_controls[\s\S]*?free_plan/i);
  });

  it("enforces the plan inside direct authenticated Retell mapping RPCs", () => {
    expect(migration).toMatch(/create or replace function public\.retell_mapping_register[\s\S]*?tenant_plan[\s\S]*?=\s*'free'/i);
    expect(migration).toMatch(/create or replace function public\.retell_mapping_pause[\s\S]*?tenant_plan[\s\S]*?=\s*'free'/i);
  });

  it("checks the client plan before creating Stripe provider objects", () => {
    const source = read("src/app/actions/stripe-payment-links.ts");
    const planCheck = source.indexOf("getAuthoritativeWorkspacePlan");
    const firstProviderCall = source.indexOf('stripeRequest("products"');
    expect(planCheck).toBeGreaterThan(-1);
    expect(planCheck).toBeLessThan(firstProviderCall);
  });
});
