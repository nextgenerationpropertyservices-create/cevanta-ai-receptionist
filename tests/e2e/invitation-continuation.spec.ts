import { test, expect } from "@playwright/test";

const fictionalRequest = "33333333-3333-4333-8333-333333333333";
const fictionalToken = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8";

test("fragment bootstrap removes credentials, exchanges once, and replaces history", async ({ page }) => {
  let exchangeCount = 0;
  let unsafeRequestObserved = false;
  let thirdPartyRequestObserved = false;
  let cspExecutionFailureObserved = false;
  let firstPartyOrigin = "";
  page.on("console", message => {
    if (message.type() === "error" && /refused to execute (?:an )?inline script/i.test(message.text())) {
      cspExecutionFailureObserved = true;
    }
  });
  page.on("request", request => {
    const serialized = `${request.url()} ${request.headers().referer ?? ""}`;
    if (serialized.includes(fictionalToken) || serialized.includes(fictionalRequest)) unsafeRequestObserved = true;
    if (firstPartyOrigin && new URL(request.url()).origin !== firstPartyOrigin) thirdPartyRequestObserved = true;
  });
  await page.route("**/api/invitations/continuations", async route => {
    exchangeCount += 1;
    const request = route.request();
    const body = request.postDataJSON() as Record<string, unknown>;
    expect(Boolean(body && body.version === 1 && body.request_id === fictionalRequest && body.token === fictionalToken)).toBe(true);
    expect(request.headers()["content-type"]?.startsWith("application/json")).toBe(true);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "ready" }) });
  });
  await page.goto("/");
  firstPartyOrigin = new URL(page.url()).origin;
  cspExecutionFailureObserved = false;
  await page.evaluate(url => window.location.assign(url), `/invite#v=1&r=${fictionalRequest}&t=${fictionalToken}`);
  await expect.poll(() => new URL(page.url()).pathname).toBe("/invite/continue");
  expect(new URL(page.url()).pathname).toBe("/invite/continue");
  expect(page.url().includes("#")).toBe(false);
  expect(exchangeCount).toBe(1);
  expect(unsafeRequestObserved).toBe(false);
  expect(thirdPartyRequestObserved).toBe(false);
  expect(cspExecutionFailureObserved).toBe(false);

  await page.goBack();
  expect(new URL(page.url()).pathname).toBe("/");
});

test("malformed fragments are removed and never exchanged", async ({ page }) => {
  let exchangeCount = 0;
  await page.route("**/api/invitations/continuations", async route => {
    exchangeCount += 1;
    await route.abort();
  });

  await page.goto(`/invite#v=1&r=${fictionalRequest}&t=invalid&extra=1`);
  await expect(page.getByRole("heading", { name: "This invitation is unavailable." })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/invite");
  expect(page.url().includes("#")).toBe(false);
  expect(exchangeCount).toBe(0);
});

