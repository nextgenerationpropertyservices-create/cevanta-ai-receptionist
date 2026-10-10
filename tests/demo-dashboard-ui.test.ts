import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import DemoDashboard from "@/app/demo-dashboard/page";

describe("demo dashboard", () => {
  it("renders a fictional managed-pilot dashboard without live automation claims", () => {
    const output = renderToStaticMarkup(createElement(DemoDashboard));
    expect(output).toContain("Northstar HVAC Demo Dashboard");
    expect(output).toContain("Every name, phone number, address, lead, job and calendar item is fictional");
    expect(output).toContain("No SMS, email, payment, quote, dispatch or confirmed appointment");
    expect(output).toContain("Sam Carter");
    expect(output).toContain("Office review");
  });
});
