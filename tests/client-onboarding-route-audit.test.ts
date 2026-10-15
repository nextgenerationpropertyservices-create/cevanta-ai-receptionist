import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function pageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return pageFiles(path);
    return entry.name === "page.tsx" ? [path] : [];
  });
}

describe("client onboarding route coverage", () => {
  it("keeps every operational workspace page behind the shared workspace gate", () => {
    const root = join(process.cwd(), "src", "app", "workspaces", "[tenantId]");
    const unguarded = pageFiles(root).filter(file => {
      const relative = file.slice(root.length + 1).replaceAll("\\", "/");
      if (relative === "onboarding/page.tsx") return false;
      const source = readFileSync(file, "utf8");
      return !source.includes("getWorkspace(") && !source.includes("getManagedClientWorkspaces(");
    });
    expect(unguarded).toEqual([]);
  });
});
