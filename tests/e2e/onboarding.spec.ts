import { test, expect, type Page } from "@playwright/test";

const fictionalTenant = "10000000-0000-4000-8000-000000000001";
// Suppress Playwright call logs/values on authenticated failures. No attachments,
// storageState, cookies, tokens, screenshots or page text enter test evidence.
async function privateStep(work: () => Promise<unknown>) {
  try { await work(); } catch { throw new Error("Authenticated Setup step failed; private diagnostics suppressed."); }
}
async function login(page: Page, email: string, password: string) {
  await privateStep(async () => {
    await page.goto("/sign-in");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel(/^Password\b/).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect.poll(() => new URL(page.url()).pathname === "/workspaces").toBe(true);
  });
}
async function narrow(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
async function noPrivateMetadata(page: Page) {
  // Scan rendered main content only: Next's internal transport references are
  // not application markup. Return a boolean rather than captured page content.
  expect(await page.locator("main").evaluate(element => !/token_digest|request_id|expected_config_revision|providerConnectionAuthorized|hostedReady|private-receipt-sentinel/.test(element.textContent ?? ""))).toBe(true);
}

test("anonymous Setup entry is protected and has no mobile overflow", async ({ page }) => {
  await page.goto(`/workspaces/${fictionalTenant}/onboarding`);
  await expect.poll(() => /^\/(sign-in|setup)$/.test(new URL(page.url()).pathname)).toBe(true);
  expect(await page.getByRole("button", { name: "Save business details" }).count()).toBe(0);
  expect(await page.getByLabel("Business email", { exact: false }).count()).toBe(0);
  await narrow(page);
});

for (const role of ["owner", "admin"] as const) {
  test.describe(`${role} disposable journey`, () => {
    const email = process.env[role === "owner" ? "E2E_EMAIL" : "E2E_ADMIN_EMAIL"];
    const password = process.env[role === "owner" ? "E2E_PASSWORD" : "E2E_ADMIN_PASSWORD"];
    const tenant = process.env.E2E_TENANT_ID;
    test.skip(process.env.E2E_AUTHENTICATED !== "1" || !email || !password || !tenant, "Requires explicitly enabled disposable owner/admin account and tenant.");
  test(`${role} can save fictional Setup profile and reload pending information`, async ({ page }) => {
    await login(page, email!, password!);
    await privateStep(async () => {
      await page.goto(`/workspaces/${tenant}/onboarding`);
      await expect.poll(() => page.getByRole("button", { name: "Save business details", exact: true }).isVisible()).toBe(true);
      expect(await page.getByRole("heading", { name: "Readiness review is pending" }).isVisible()).toBe(true);
      expect(await page.getByText("Provider verification is pending.", { exact: false }).isVisible()).toBe(true);
      expect(await page.getByRole("button", { name: /Go live|Send invitation|Create account/ }).count()).toBe(0);
      await noPrivateMetadata(page);
      await narrow(page);
      // Change only an optional contact in a disposable tenant; retain existing
      // valid tenant authority. Unique synthetic value proves persistence.
      const contact = `QA fictional setup ${role} ${Date.now()}`;
      await page.getByLabel("Contact name", { exact: false }).fill(contact);
      await page.getByRole("button", { name: "Save business details", exact: true }).click();
      await expect.poll(() => page.getByText("Business details saved. Readiness review remains pending.", { exact: true }).isVisible()).toBe(true);
      await page.reload();
      await expect.poll(async () => (await page.getByLabel("Contact name", { exact: false }).inputValue()) === contact).toBe(true);
      expect(await page.getByRole("heading", { name: "Readiness review is pending" }).isVisible()).toBe(true);
      await noPrivateMetadata(page);
      await narrow(page);
    });
  });
  });
}

for (const role of ["dispatcher", "technician", "viewer"] as const) {
  test.describe(`${role} disposable journey`, () => {
    const email = process.env[`E2E_${role.toUpperCase()}_EMAIL`];
    const password = process.env[`E2E_${role.toUpperCase()}_PASSWORD`];
    const tenant = process.env.E2E_TENANT_ID;
    test.skip(process.env.E2E_AUTHENTICATED !== "1" || !email || !password || !tenant, "Requires explicitly enabled disposable limited-role account and tenant.");
  test(`${role} has safe Setup context without mutation or private contacts`, async ({ page }) => {
    await login(page, email!, password!);
    await privateStep(async () => {
      await page.goto(`/workspaces/${tenant}/onboarding`);
      const heading = role === "dispatcher" ? "Office setup information" : "Your workspace access";
      await expect.poll(() => page.getByRole("heading", { name: heading, exact: true }).isVisible()).toBe(true);
      expect(await page.locator("main form").count()).toBe(0);
      expect(await page.getByRole("button", { name: "Save business details" }).count()).toBe(0);
      expect(await page.getByLabel("Business email", { exact: false }).count()).toBe(0);
      expect(await page.getByLabel("Contact name", { exact: false }).count()).toBe(0);
      expect(await page.getByRole("heading", { name: "Escalation contacts" }).count()).toBe(0);
      expect(await page.getByRole("link", { name: /Return to dashboard/ }).isVisible()).toBe(true);
      await noPrivateMetadata(page);
      await narrow(page);
    });
  });
  });
}

test("actual oversized rendered action rejection requires an approved transport harness", async () => {
  test.skip(true, "No disposable authenticated action session/harness supplied. Need observed real rendered request, bounded synthetic oversize, safe response/log and no-mutation verification; never guess Next-Action IDs.");
});
