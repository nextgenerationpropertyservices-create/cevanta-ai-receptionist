import type { Lead } from "@/lib/intake-contracts";
import { AI_RECEPTIONIST_MARKER } from "@/lib/ai-lead-notifications";

export interface LeadDisplayDetails {
  name: string;
  email: string | null;
  phone: string | null;
  serviceRequest: string;
  jobTitle: string;
}

type ExtractedLeadText = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  summary?: string;
};

const FIELD_ALIASES: Array<[keyof ExtractedLeadText, RegExp]> = [
  ["name", /^(?:caller\s*)?name$/i],
  ["email", /^(?:caller\s*)?email(?:\s*address)?$/i],
  ["phone", /^(?:caller\s*)?(?:phone|phone\s*number|callback\s*number|callback|number)$/i],
  ["service", /^(?:service|service\s*type|service\s*need|request|issue|problem)$/i],
  ["summary", /^(?:summary|call\s*summary|service\s*request|notes?)$/i],
];

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripMarker(value: string) {
  return value.replace(AI_RECEPTIONIST_MARKER, "").trim();
}

function stripLabelLine(value: string) {
  return value.replace(/^[-•*\s]*(?:caller\s*)?(?:name|email(?:\s*address)?|phone(?:\s*number)?|callback(?:\s*number)?|number|service(?:\s*type|\s*need)?|request|issue|problem|summary|call\s*summary|service\s*request|notes?)\s*[:=-]\s*/i, "").trim();
}

function assignField(fields: ExtractedLeadText, label: string, raw: string) {
  const key = FIELD_ALIASES.find(([, pattern]) => pattern.test(label.trim()))?.[0];
  const value = compact(raw);
  if (key && value && !fields[key]) fields[key] = value;
}

function extractInlineFields(text: string) {
  const fields: ExtractedLeadText = {};
  const labels = "(?:caller\\s*)?(?:name|email(?:\\s*address)?|phone(?:\\s*number)?|callback(?:\\s*number)?|number|service(?:\\s*type|\\s*need)?|request|issue|problem|summary|call\\s*summary|service\\s*request|notes?)";
  const pattern = new RegExp("(?:^|[\\n.;|])\\s*([A-Za-z][A-Za-z\\s]{1,28})\\s*[:=-]\\s*([\\s\\S]*?)(?=(?:[\\n.;|]\\s*" + labels + "\\s*[:=-])|$)", "gi");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) assignField(fields, match[1] ?? "", match[2] ?? "");
  for (const line of text.split(/\r?\n/)) {
    const matchLine = line.match(/^\s*[-•*]?\s*([A-Za-z][A-Za-z\s]{1,28})\s*[:=-]\s*(.+)$/);
    if (matchLine) assignField(fields, matchLine[1] ?? "", matchLine[2] ?? "");
  }
  return fields;
}

function removeContactLines(text: string) {
  return text
    .split(/\r?\n|\s*[|]\s*/)
    .map(part => part.trim())
    .filter(part => part && !/^[-•*\s]*(?:caller\s*)?(?:name|email(?:\s*address)?|phone(?:\s*number)?|callback(?:\s*number)?|number|service(?:\s*type|\s*need)?|request|issue|problem)\s*[:=-]/i.test(part))
    .join("\n")
    .trim();
}

function cleanSummary(description: string, fields: ExtractedLeadText) {
  if (fields.summary) return fields.summary;
  const withoutMarker = stripMarker(description);
  const withoutContact = removeContactLines(withoutMarker);
  const summaryMatch = withoutContact.match(/(?:^|[\n.;|])\s*(?:summary|call\s*summary|service\s*request|notes?)\s*[:=-]\s*([\s\S]+)/i);
  if (summaryMatch?.[1]) return compact(stripLabelLine(summaryMatch[1]));
  return compact(stripLabelLine(withoutContact));
}

function titleFrom(value: string) {
  const cleaned = compact(stripLabelLine(value)).replace(/[.。]+$/g, "");
  if (!cleaned) return "Service request";
  const firstSentence = cleaned.split(/[.!?]\s+/)[0] ?? cleaned;
  const trimmed = firstSentence.length > 72 ? `${firstSentence.slice(0, 69).trim()}...` : firstSentence;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function getLeadDisplayDetails(lead: Lead): LeadDisplayDetails {
  const fields = extractInlineFields(lead.description ?? "");
  const serviceRequest = cleanSummary(lead.description ?? "", fields) || lead.description || "Service request needs office review.";
  const jobTitleSource = fields.service || serviceRequest || lead.name;
  return {
    name: lead.name?.trim() || fields.name || "New enquiry",
    email: lead.email || fields.email || null,
    phone: lead.phone || fields.phone || null,
    serviceRequest,
    jobTitle: titleFrom(jobTitleSource),
  };
}

export function leadWithDisplayDefaults(lead: Lead): Lead {
  const display = getLeadDisplayDetails(lead);
  return {
    ...lead,
    name: display.name,
    email: display.email,
    phone: display.phone,
    description: display.serviceRequest,
  };
}
