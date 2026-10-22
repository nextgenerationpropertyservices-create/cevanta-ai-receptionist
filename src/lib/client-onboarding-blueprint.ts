export type ClientIndustryTemplate = {
  id: string;
  label: string;
  tradeMatches: string[];
  defaultServices: string[];
  intakeFocus: string[];
  escalationFocus: string[];
  neverPromise: string[];
};

export type OnboardingBlueprintStep = {
  title: string;
  ownerAction: string;
  systemUse: string;
  gate: string;
};

export type IntakeField = {
  label: string;
  required: boolean;
  officeUse: string;
};

export const CLIENT_INDUSTRY_TEMPLATES: ClientIndustryTemplate[] = [
  {
    id: "hvac",
    label: "HVAC and mechanical service",
    tradeMatches: ["hvac", "heating", "cooling", "air conditioning", "mechanical"],
    defaultServices: ["No heat", "No cooling", "Maintenance", "Thermostat issue", "System estimate", "Emergency review"],
    intakeFocus: ["equipment or system type", "symptoms", "when the issue started", "service address", "urgency", "preferred appointment window"],
    escalationFocus: ["no heat in unsafe weather", "gas smell or electrical danger", "water leak near equipment", "repeat customer urgent callbacks"],
    neverPromise: ["confirmed appointment times", "exact pricing", "parts availability", "warranty decisions", "emergency dispatch"],
  },
  {
    id: "plumbing",
    label: "Plumbing service",
    tradeMatches: ["plumbing", "plumber", "drain", "water heater"],
    defaultServices: ["Leak", "Clogged drain", "Water heater", "Fixture repair", "Estimate", "Emergency review"],
    intakeFocus: ["affected fixture or area", "leak or blockage severity", "property access", "service address", "urgency", "preferred appointment window"],
    escalationFocus: ["active flooding", "sewer backup", "no water", "water heater safety concern"],
    neverPromise: ["same-day arrival", "exact pricing", "permit decisions", "insurance coverage", "emergency dispatch"],
  },
  {
    id: "electrical",
    label: "Electrical service",
    tradeMatches: ["electrical", "electrician", "generator", "panel"],
    defaultServices: ["No power", "Breaker issue", "Outlet or switch", "Panel or generator", "Lighting", "Emergency review"],
    intakeFocus: ["affected area", "hazard signs", "power status", "service address", "urgency", "preferred appointment window"],
    escalationFocus: ["sparks or burning smell", "partial outage with safety concern", "downed line", "medical equipment power issue"],
    neverPromise: ["live troubleshooting", "code compliance approval", "exact pricing", "utility restoration", "emergency dispatch"],
  },
  {
    id: "roofing",
    label: "Roofing and exterior service",
    tradeMatches: ["roof", "roofing", "gutter", "siding", "exterior"],
    defaultServices: ["Leak", "Storm damage", "Repair", "Inspection", "Replacement estimate", "Emergency review"],
    intakeFocus: ["roof or exterior area", "damage timing", "active leak status", "service address", "urgency", "preferred appointment window"],
    escalationFocus: ["active interior leak", "storm damage", "unsafe structural concern", "commercial property exposure"],
    neverPromise: ["insurance coverage", "exact pricing", "same-day tarp or repair", "warranty approval", "emergency dispatch"],
  },
  {
    id: "general-trade",
    label: "General trade service",
    tradeMatches: ["trade", "service", "general", "contractor"],
    defaultServices: ["Service request", "Repair", "Maintenance", "Estimate", "Urgent review"],
    intakeFocus: ["service needed", "problem summary", "service address", "urgency", "preferred appointment window"],
    escalationFocus: ["safety concern", "active property damage", "repeat customer urgent issue"],
    neverPromise: ["confirmed appointments", "exact pricing", "technical diagnosis", "parts availability", "dispatch"],
  },
];

export const STANDARD_INTAKE_FIELDS: IntakeField[] = [
  { label: "Caller name", required: true, officeUse: "identify who requested service" },
  { label: "Callback phone", required: true, officeUse: "office follow-up after review" },
  { label: "Service address", required: true, officeUse: "route the request to the right client workspace and service area" },
  { label: "Service type", required: true, officeUse: "match the request to the client service list" },
  { label: "Problem summary", required: true, officeUse: "create the office-review lead" },
  { label: "Urgency", required: true, officeUse: "flag urgent work without promising dispatch" },
  { label: "Preferred appointment window", required: false, officeUse: "store a preference, not a confirmed booking" },
  { label: "Escalation note", required: false, officeUse: "help the office decide if a human should review first" },
];

export const SELF_SERVICE_ONBOARDING_STEPS: OnboardingBlueprintStep[] = [
  { title: "Account and workspace", ownerAction: "Create or verify the account and isolated client workspace.", systemUse: "Attach all saved setup, leads, jobs, and provider mappings to one tenant.", gate: "Verified user and tenant membership required." },
  { title: "Industry template", ownerAction: "Choose the closest service template and adjust services.", systemUse: "Start the receptionist prompt, extraction fields, and office review checklist from a known template.", gate: "Template can guide setup, but client-specific rules override defaults." },
  { title: "Business setup", ownerAction: "Enter business details, services, area, hours, escalation contacts, intake rules, and never-promise rules.", systemUse: "Generate a safe receptionist draft and readiness checklist.", gate: "Missing profile, services, hours, call rules, or escalation blocks activation." },
  { title: "Secure connections", ownerAction: "Authorize supported tools and select accounts, calendars, resources, or workflows.", systemUse: "Store trusted connection state and actionable errors without exposing secrets.", gate: "Unsupported or expired connections stay in review." },
  { title: "Receptionist review", ownerAction: "Review the generated receptionist behavior and make a fictional test call.", systemUse: "Verify call capture, field extraction, duplicate handling, and correct dashboard delivery.", gate: "A 200 response is not enough; the lead must persist in the right workspace." },
  { title: "Activation approval", ownerAction: "Approve only eligible features after test evidence and rollback notes exist.", systemUse: "Keep automation switches scoped to the client and feature.", gate: "No SMS, email, calendar write, booking, payment, or dispatch activation without separate approval." },
];

export const STANDARD_PROVIDER_BOUNDARIES = [
  "Use one reusable Make intake workflow when standard intake fields are enough.",
  "Route each event by trusted server-side mapping, not by a client-supplied workspace ID.",
  "Treat received, pending, failed, and delivered as different states so failed dashboard writes can retry.",
  "Keep office review first until booking, messages, calendar writes, payment, and dispatch each pass their own approval gates.",
];

export function templateForTrade(trade: string | null | undefined): ClientIndustryTemplate {
  const normalized = (trade ?? "").toLowerCase();
  return CLIENT_INDUSTRY_TEMPLATES.find(template => template.tradeMatches.some(match => normalized.includes(match))) ?? CLIENT_INDUSTRY_TEMPLATES[CLIENT_INDUSTRY_TEMPLATES.length - 1];
}

export function starterServicesForTrade(trade: string | null | undefined) {
  return templateForTrade(trade).defaultServices.map((name, position) => ({
    id: null,
    name,
    description: `Office-review intake for ${name.toLowerCase()} requests.`,
    enabled: true,
    position,
  }));
}
