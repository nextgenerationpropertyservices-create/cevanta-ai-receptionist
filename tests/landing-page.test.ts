import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LandingPage } from "@/components/ui";

const faq = [{ question: "What is Cevanta?", answer: "A managed AI answering service." }];

const globalStyles = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("public landing page", () => {
  it("explains the value in plain language and gives visitors a clear next step", () => {
    const output = renderToStaticMarkup(createElement(LandingPage, { faq }));

    expect(output).toContain("Stop routing customers to your competitors.");
    expect(output).toContain("helps turn missed calls into office-ready lead opportunities");
    expect(output).toContain("including after-hours coverage when configured");
    expect(output).toContain("Capture more call opportunities");
    expect(output).toContain('href="/sign-up"');
    expect(output).toContain('href="/demo-dashboard"');
    expect(output).toContain('href="/sign-in"');
    expect(output).toContain('src="/cevanta-call-demo.mp4"');
    expect(output).toContain('poster="/call-demo-poster.svg"');
    expect(output).toContain("The phone rings.");
    expect(output).toContain("Your office stays in control.");
    expect(output).toContain("HVAC, plumbing, electrical, roofing");
    expect(output).toContain("A clear front door for service calls.");
    expect(output).toContain("What Cevanta does today");
    expect(output).toContain("What your office controls");
    expect(output).toContain("What is Cevanta?");
  });

  it("does not expose implementation or unsupported automation language", () => {
    const output = renderToStaticMarkup(createElement(LandingPage, { faq }));

    expect(output).not.toMatch(/Supabase|Retell|Make|webhook|API key|payment collection|automatic booking/i);
    expect(output).not.toContain("service-role");
    expect(output).not.toContain("turns missed calls into booked-job opportunities 24/7");
    expect(output).not.toContain("Answer every opportunity");
    expect(output).not.toContain("A clear front door for every service call.");
  });

  it("keeps the public funnel readable when dashboard theme variables are loaded", () => {
    expect(globalStyles).toMatch(/\.landing-page \.landing-hero h1[^}]*color:#143a38!important/);
    expect(globalStyles).toMatch(/\.landing-page \.button\.secondary[^}]*color:#143a38!important/);
    expect(globalStyles).toMatch(/\.landing-faq-list summary[^}]*color:#143a38/);
  });
});
