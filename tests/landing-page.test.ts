import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LandingPage } from "@/components/ui";

const globalStyles = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("public landing page", () => {
  it("explains the value in plain language and gives visitors a clear next step", () => {
    const output = renderToStaticMarkup(createElement(LandingPage));

    expect(output).toContain("Stop routing customers to your competitors.");
    expect(output).toContain("turns missed calls into booked-job opportunities 24/7");
    expect(output).toContain("Our AI answering machine");
    expect(output).toContain('href="/sign-up"');
    expect(output).toContain('href="/demo-dashboard"');
    expect(output).toContain('href="/sign-in"');
    expect(output).toContain('src="/cevanta-call-demo.mp4"');
    expect(output).toContain('poster="/call-demo-poster.svg"');
    expect(output).toContain("The phone rings.");
    expect(output).toContain("Your office stays in control.");
  });

  it("does not expose implementation or unsupported automation language", () => {
    const output = renderToStaticMarkup(createElement(LandingPage));

    expect(output).not.toMatch(/Supabase|Retell|Make|webhook|API key|payment collection|automatic booking/i);
    expect(output).not.toContain("service-role");
  });

  it("keeps the public funnel readable when dashboard theme variables are loaded", () => {
    expect(globalStyles).toMatch(/\.landing-page \.landing-hero h1[^}]*color:#143a38!important/);
    expect(globalStyles).toMatch(/\.landing-page \.button\.secondary[^}]*color:#143a38!important/);
  });
});
