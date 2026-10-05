import { test, expect } from "@playwright/test";

test("unconfigured app explains setup and protects workspace access", async ({ page }) => {
  test.skip(process.env.E2E_AUTHENTICATED === "1" || process.env.E2E_CONFIGURED === "1", "This case requires an unconfigured app.");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Connect your workspace" })).toBeVisible();
  await page.goto("/workspaces/10000000-0000-4000-8000-000000000001/customers");
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByRole("heading", { name: "Connect your workspace" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create customer" })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("configured app requires sign-in for every workspace module", async ({ page }) => {
  test.skip(process.env.E2E_CONFIGURED !== "1", "Requires configured app; no credentials are used.");
  await page.goto("/sign-in");
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel(/^Password\b/)).toBeVisible();
  for (const route of ["", "/customers", "/leads", "/jobs", "/calendar", "/settings"]) {
    await page.goto(`/workspaces/10000000-0000-4000-8000-000000000001${route}`);
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("authenticated owner/admin workflow creates customer, location, equipment and settings", async ({ page }) => {
  const { E2E_EMAIL: email, E2E_PASSWORD: password, E2E_TENANT_ID: tenant, E2E_FOREIGN_TENANT_ID: foreign } = process.env;
  test.skip(process.env.E2E_AUTHENTICATED !== "1" || !email || !password || !tenant || !foreign, "Requires disposable Supabase account, owner/admin membership and inaccessible tenant via environment.");
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel(/^Password\b/).fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect.poll(() => /\/workspaces$/.test(page.url())).toBe(true);
  await page.goto(`/workspaces/${tenant}/customers`);
  const name = `QA fictional customer ${Date.now()}`;
  await page.getByLabel("Customer name").fill(name);
  await page.getByRole("button", { name: "Create customer" }).click();
  await expect.poll(() => page.getByText("Saved successfully.").isVisible()).toBe(true);
  await page.getByRole("link", { name: `Open ${name}` }).click();
  await page.getByLabel("Location label").fill("QA fictional location");
  await page.getByLabel("Street address").fill("100 Example Street");
  await page.getByLabel("City", { exact: true }).fill("Example City");
  await page.getByLabel("State / region").fill("NY");
  await page.getByLabel("Postal code").fill("00000");
  await page.getByRole("button", { name: "Add location" }).click();
  await expect.poll(() => page.getByRole("heading", { name: "QA fictional location" }).isVisible()).toBe(true);
  await page.getByLabel("Equipment name").fill("QA fictional heat pump");
  await page.getByLabel("Equipment type").fill("Heat pump");
  await page.getByRole("button", { name: "Add equipment" }).click();
  await expect.poll(() => page.getByText("QA fictional heat pump", { exact: true }).isVisible()).toBe(true);
  await page.goto(`/workspaces/${tenant}/settings`);
  await expect.poll(() => page.getByRole("button", { name: "Save settings" }).isVisible()).toBe(true);
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect.poll(() => page.getByText("Saved successfully.").isVisible()).toBe(true);
  await page.goto(`/workspaces/${foreign}/customers`);
  // Membership rejection renders the root error boundary. Wait for that actual
  // unavailable state before negative checks; an unfinished navigation is not denial.
  await expect.poll(() => new URL(page.url()).pathname === `/workspaces/${foreign}/customers`).toBe(true);
  await expect.poll(() => page.getByRole("heading", { name: "We couldn’t open this page.", exact: true }).isVisible()).toBe(true);
  await expect.poll(() => page.getByRole("button", { name: "Try again", exact: true }).isVisible()).toBe(true);
  await expect.poll(async () => (await page.getByRole("button", { name: "Create customer" }).count()) === 0).toBe(true);
  await expect.poll(async () => (await page.getByText(name, { exact: true }).count()) === 0).toBe(true);
});

test("technician sees records with no mutation controls", async ({ page }) => {
  const { E2E_TECHNICIAN_EMAIL: email, E2E_TECHNICIAN_PASSWORD: password, E2E_TENANT_ID: tenant } = process.env;
  test.skip(process.env.E2E_AUTHENTICATED !== "1" || !email || !password || !tenant, "Requires disposable technician account via environment.");
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel(/^Password\b/).fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect.poll(() => /\/workspaces$/.test(page.url())).toBe(true);
  await page.goto(`/workspaces/${tenant}/customers`);
  await expect.poll(() => page.getByText("Your technician role can view customer records.", { exact: false }).isVisible()).toBe(true);
  await expect.poll(async () => (await page.getByRole("button", { name: "Create customer" }).count()) === 0).toBe(true);
  await page.goto(`/workspaces/${tenant}/settings`);
  await expect.poll(async () => (await page.getByRole("button", { name: "Save settings" }).count()) === 0).toBe(true);
});

