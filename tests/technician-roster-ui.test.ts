import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const page=readFileSync(join(root,"src/app/workspaces/[tenantId]/technicians/page.tsx"),"utf8");

describe("technician roster UI", () => {
 it("offers name-first roster entry, checkbox skills, and delayed linking", () => {
  expect(page).toContain("Start with a name and skills");
  expect(page).toContain("Email is optional at this step");
  expect(page).toContain("Choose common skills");
  expect(page).toContain("PENDING LINK");
  expect(page).toContain("Link confirmed email");
  expect(page).toContain("Only linked accounts can receive jobs.");
 });
});