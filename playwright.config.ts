import { defineConfig } from "@playwright/test";

// Installed Playwright otherwise captures page text in error-context.md on failure.
process.env.PLAYWRIGHT_NO_COPY_PROMPT = "1";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "off",
    screenshot: "off",
    video: "off",
    // Failure assertions must use booleans so reporters cannot reveal matched
    // account/page values. Do not add authenticated attachments or storageState.
    ...(process.env.E2E_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.E2E_CHROMIUM_PATH } }
      : {}),
  },
  reporter: "list",
});
