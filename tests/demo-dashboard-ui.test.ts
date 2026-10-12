import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import DemoDashboard from "@/app/demo-dashboard/page";

describe("demo dashboard", () => {
  it("renders a Google Meet-ready fictional managed-pilot dashboard without live automation claims", () => {
    const output = renderToStaticMarkup(createElement(DemoDashboard));
    expect(output).toContain("See how Cevanta turns missed calls into office-ready leads");
    expect(output).toContain("GOOGLE MEET SALES DEMO");
    expect(output).toContain("Every name, address, job, lead and dollar example is fictional");
    expect(output).toContain("3 AI receptionist leads need office review");
    expect(output).toContain("$497 setup + $297/month");
    expect(output).toContain("ROI SNAPSHOT");
    expect(output).toContain("What the HVAC owner fills out");
    expect(output).toContain("No automatic booking");
    expect(output).toContain("office-ready leads");
    expect(output).not.toMatch(/booking confirmed|payment collected|dispatch confirmed|SMS sent|email sent|calendar event created|sk_live_|Bearer /i);
  });
});
