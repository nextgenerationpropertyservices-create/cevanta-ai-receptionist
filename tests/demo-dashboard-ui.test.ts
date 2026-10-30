import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import DemoDashboard from "@/app/demo-dashboard/page";

const globalStyles = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("client-facing demo dashboard", () => {
  it("mirrors the useful client Overview sections with clearly fictional data", () => {
    const output = renderToStaticMarkup(createElement(DemoDashboard));

    expect(output).toContain("Northstar Heating &amp; Cooling");
    expect(output).toContain("Fictional client workspace");
    expect(output).toContain("FRONT OFFICE COMMAND CENTER");
    expect(output).toContain("NEEDS ATTENTION");
    expect(output).toContain("TODAY&#x27;S QUEUE");
    expect(output).toContain("DISPATCH COVERAGE");
    expect(output).toContain("CALENDAR PULSE");
    expect(output).toContain("VALUE SNAPSHOT");
    expect(output).toContain("Fictional records");
    expect(output).toContain("Example only. Results depend on call volume");
  });

  it("uses public-safe navigation and clear calls to action", () => {
    const output = renderToStaticMarkup(createElement(DemoDashboard));

    expect(output).toContain('aria-label="Demo dashboard navigation"');
    expect(output).toContain('aria-current="page"');
    expect(output).toContain('href="/sign-up"');
    expect(output).toContain('href="/#watch"');
    expect(output).toContain('href="/sign-in"');
    expect(output).toContain('href="#today-queue"');
    expect(output).not.toMatch(/href="\/workspaces\//);
  });

  it("states the client approval boundary without implying live automation", () => {
    const output = renderToStaticMarkup(createElement(DemoDashboard));

    expect(output).toContain("Live booking, SMS or email messages, external calendar writes, payment collection, and dispatch automation stay off");
    expect(output).toContain("the client approves each feature");
    expect(output).toContain("configured and tested for that business");
    expect(output).not.toMatch(/booking confirmed|payment collected|dispatch confirmed|SMS sent|email sent|calendar event created/i);
  });

  it("contains no presenter scripts, operator controls, or implementation secrets", () => {
    const output = renderToStaticMarkup(createElement(DemoDashboard));

    expect(output).not.toMatch(/talk track|what to say|use this close|sales call|presenter|operator|tenant id/i);
    expect(output).not.toMatch(/Retell|Make\.com|Supabase|webhook|API key|service-role|sk_live_|Bearer /i);
    expect(output).not.toMatch(/<input|<textarea|<form|<button/i);
  });

  it("keeps demo-only responsive containment and visible keyboard focus rules", () => {
    expect(globalStyles).toMatch(/\.demo-overview-shell\{[^}]*overflow-x:hidden/);
    expect(globalStyles).toMatch(/\.demo-overview-main\{[^}]*max-width:1440px/);
    expect(globalStyles).toMatch(/@media\(max-width:760px\)\{[^}]*\.demo-overview-topbar-inner/);
    expect(globalStyles).toMatch(/\.demo-overview-nav a\[aria-current="page"\]/);
    expect(globalStyles).toMatch(/a:focus-visible[^}]*outline-color:var\(--accent\)/);
  });
});
