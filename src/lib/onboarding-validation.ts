import { MAX_ONBOARDING_BODY_BYTES, MAX_ONBOARDING_VERSION, ONBOARDING_COMMANDS, ONBOARDING_HISTORY_DIRECTIONS, ONBOARDING_HISTORY_KINDS, ONBOARDING_HISTORY_SORTS, ONBOARDING_HISTORY_STATES, ONBOARDING_STEPS, ONBOARDING_TIMEZONES, ONBOARDING_VERSION, type ConfigurationCommand, type ConfigurationInput, type HoursInterval, type InvitationAcceptanceInput, type OnboardingHistoryListInput, type OnboardingHistoryReenableInput, type ResumeInput, type ValidationCode, type ValidationIssue, type ValidationResult } from "./onboarding-contracts";

const edgeWhitespace = /^[\u0009-\u000d\u0020]+|[\u0009-\u000d\u0020]+$/g;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Deliberately bounded ASCII mailbox representation; quoted/Unicode mailboxes excluded.
export const ONBOARDING_EMAIL_PATTERN = "^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)+$";
export const ONBOARDING_PHONE_PATTERN = "^\\+[1-9][0-9]{1,14}$";
const emailPattern = new RegExp(ONBOARDING_EMAIL_PATTERN);
const phonePattern = new RegExp(ONBOARDING_PHONE_PATTERN);
const timezones = new Set(ONBOARDING_TIMEZONES);
const trim = (value: string) => value.replace(edgeWhitespace, "");
const validUnicode = (value: string) => !/[\u0000]/.test(value) && !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(value);
export function isOnboardingEmail(value: string): boolean { return value.length <= 254 && emailPattern.test(value) && value.split("@")[0].length <= 64 && value.split("@")[1].split(".").every(label => label.length <= 63); }
export function isOnboardingPhone(value: string): boolean { return phonePattern.test(value); }
export function isOnboardingDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day >= 1 && day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
// Last base64url digit encodes four data bits and two zero pad bits (32 bytes).
export function isCanonicalInvitationToken(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/.test(value); }

class Parser {
  issues: ValidationIssue[] = [];
  fail(field: string, code: ValidationCode) { if (this.issues.length < 32) this.issues.push({ field, code }); }
  object(value: unknown, keys: readonly string[], field: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) { this.fail(field, "invalid_input"); return {}; }
    const obj = value as Record<string, unknown>;
    if (Object.keys(obj).some(key => !keys.includes(key))) this.fail(field, "unknown_field");
    for (const key of keys) if (!Object.hasOwn(obj, key)) this.fail(`${field}.${key}`, "invalid_input");
    return obj;
  }
  partialObject(value: unknown, keys: readonly string[], required: readonly string[], field: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) { this.fail(field, "invalid_input"); return {}; }
    const obj = value as Record<string, unknown>;
    if (Object.keys(obj).some(key => !keys.includes(key))) this.fail(field, "unknown_field");
    for (const key of required) if (!Object.hasOwn(obj, key)) this.fail(`${field}.${key}`, "invalid_input");
    return obj;
  }
  text(value: unknown, min: number, max: number, field: string): string {
    if (typeof value !== "string") { this.fail(field, "invalid_text"); return ""; }
    const normalized = trim(value);
    if (!validUnicode(normalized) || [...normalized].length < min || [...normalized].length > max) this.fail(field, "invalid_text");
    return normalized;
  }
  uuid(value: unknown, field: string): string { if (typeof value !== "string" || !uuidPattern.test(value)) { this.fail(field, "invalid_uuid"); return ""; } return value.toLowerCase(); }
  number(value: unknown, min: number, max: number, field: string): number { if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) { this.fail(field, "invalid_number"); return 0; } return value; }
  boolean(value: unknown, field: string): boolean { if (typeof value !== "boolean") { this.fail(field, "invalid_boolean"); return false; } return value; }
  contact(value: unknown, kind: "email" | "phone", field: string): string | null {
    if (value === null) return null;
    const text = this.text(value, 0, kind === "email" ? 254 : 40, field);
    if (!text) return null;
    if (!(kind === "email" ? isOnboardingEmail(text) : isOnboardingPhone(text))) this.fail(field, kind === "email" ? "invalid_email" : "invalid_phone");
    return text;
  }
  date(value: unknown, field: string): string { if (typeof value !== "string" || !isOnboardingDate(value)) { this.fail(field, "invalid_date"); return ""; } return value; }
  array(value: unknown, max: number, field: string): unknown[] { if (!Array.isArray(value) || value.length > max) { this.fail(field, "invalid_input"); return []; } return value; }
  intervals(value: unknown, closed: boolean, field: string): HoursInterval[] {
    const rows = this.array(value, 8, field).map((item, index) => {
      const path = `${field}.${index}`, row = this.object(item, ["start_minute", "end_minute"], path);
      const start_minute = this.number(row.start_minute, 0, 1439, `${path}.start_minute`), end_minute = this.number(row.end_minute, 1, 1440, `${path}.end_minute`);
      if (start_minute >= end_minute) this.fail(path, "invalid_interval");
      return { start_minute, end_minute };
    }).sort((a, b) => a.start_minute - b.start_minute || a.end_minute - b.end_minute);
    if ((closed && rows.length) || rows.some((row, i) => i > 0 && row.start_minute < rows[i - 1].end_minute)) this.fail(field, "invalid_interval");
    return rows;
  }
  body(value: unknown): void { try { const encoded = JSON.stringify(value); if (!encoded) this.fail("input", "invalid_input"); else if (new TextEncoder().encode(encoded).length > MAX_ONBOARDING_BODY_BYTES) this.fail("input", "too_large"); } catch { this.fail("input", "invalid_input"); } }
  result<T>(value: T): ValidationResult<T> { return this.issues.length ? { ok: false, issues: this.issues } : { ok: true, value }; }
}

export function validateConfiguration<C extends ConfigurationCommand>(command: C, input: unknown): ValidationResult<ConfigurationInput<C>> {
  const p = new Parser(); p.body(input);
  if (!ONBOARDING_COMMANDS.includes(command)) { p.fail("command", "invalid_input"); return p.result({} as ConfigurationInput<C>); }
  const root = p.object(input, ["tenant_id", "request_id", "expected_config_revision", "payload"], "input");
  const base = { tenant_id: p.uuid(root.tenant_id, "tenant_id"), request_id: p.uuid(root.request_id, "request_id"), expected_config_revision: p.number(root.expected_config_revision, 0, MAX_ONBOARDING_VERSION, "expected_config_revision") };
  let payload: unknown;
  if (command === "save_business_profile") {
    const row = p.object(root.payload, ["name", "trade", "timezone", "business_contact_name", "business_email", "business_phone"], "payload");
    const timezone = p.text(row.timezone, 1, 100, "timezone"); if (!timezones.has(timezone)) p.fail("timezone", "unsupported_timezone");
    payload = { name: p.text(row.name, 1, 160, "name"), trade: p.text(row.trade, 1, 80, "trade"), timezone, business_contact_name: p.text(row.business_contact_name, 0, 160, "business_contact_name"), business_email: p.contact(row.business_email, "email", "business_email"), business_phone: p.contact(row.business_phone, "phone", "business_phone") };
  } else if (command === "replace_services" || command === "replace_escalation_contacts") {
    const row = p.object(root.payload, ["items"], "payload"), ids = new Set<string>();
    const items = p.array(row.items, command === "replace_services" ? 100 : 20, "items").map((item, i) => {
      const path = `items.${i}`, keys = command === "replace_services" ? ["id", "name", "description", "enabled", "position"] : ["id", "label", "contact_name", "email", "phone", "enabled", "position"];
      const obj = p.object(item, keys, path), id = obj.id === null ? null : p.uuid(obj.id, `${path}.id`);
      if (id && ids.has(id)) p.fail(`${path}.id`, "duplicate_id"); if (id) ids.add(id);
      const common = { id, enabled: p.boolean(obj.enabled, `${path}.enabled`), position: p.number(obj.position, 0, 9999, `${path}.position`) };
      return command === "replace_services" ? { ...common, name: p.text(obj.name, 0, 120, `${path}.name`), description: p.text(obj.description, 0, 2000, `${path}.description`) } : { ...common, label: p.text(obj.label, 0, 120, `${path}.label`), contact_name: p.text(obj.contact_name, 0, 160, `${path}.contact_name`), email: p.contact(obj.email, "email", `${path}.email`), phone: p.contact(obj.phone, "phone", `${path}.phone`) };
    });
    // Position/id ties preserve original null-ID order; existing IDs sort deterministically.
    items.sort((a, b) => a.position - b.position || ((a.id ?? "") < (b.id ?? "") ? -1 : (a.id ?? "") > (b.id ?? "") ? 1 : 0)); payload = { items };
  } else if (command === "replace_weekly_hours") {
    const row = p.object(root.payload, ["days"], "payload"), weekdays = new Set<number>();
    const days = p.array(row.days, 7, "days").map((item, i) => { const path = `days.${i}`, obj = p.object(item, ["weekday", "closed", "intervals"], path), weekday = p.number(obj.weekday, 0, 6, `${path}.weekday`), closed = p.boolean(obj.closed, `${path}.closed`); if (weekdays.has(weekday)) p.fail(`${path}.weekday`, "invalid_input"); weekdays.add(weekday); return { weekday, closed, intervals: p.intervals(obj.intervals, closed, `${path}.intervals`) }; }).sort((a, b) => a.weekday - b.weekday);
    if (days.length !== 7 || weekdays.size !== 7) p.fail("days", "invalid_input"); payload = { days };
  } else if (command === "upsert_hours_exception" || command === "remove_hours_exception") {
    const row = p.object(root.payload, command === "upsert_hours_exception" ? ["date", "closed", "intervals"] : ["date"], "payload"), date = p.date(row.date, "date");
    if (command === "remove_hours_exception") payload = { date }; else { const closed = p.boolean(row.closed, "closed"); payload = { date, closed, intervals: p.intervals(row.intervals, closed, "intervals") }; }
  } else {
    const row = p.object(root.payload, ["lead_time_minutes", "buffer_before_minutes", "buffer_after_minutes", "horizon_days", "notes", "acknowledged"], "payload");
    const nullableNumber = (key: string, min: number, max: number) => row[key] === null ? null : p.number(row[key], min, max, key);
    payload = { lead_time_minutes: nullableNumber("lead_time_minutes", 0, 525600), buffer_before_minutes: nullableNumber("buffer_before_minutes", 0, 1440), buffer_after_minutes: nullableNumber("buffer_after_minutes", 0, 1440), horizon_days: nullableNumber("horizon_days", 1, 730), notes: p.text(row.notes, 0, 2000, "notes"), acknowledged: p.boolean(row.acknowledged, "acknowledged") };
  }
  return p.result({ ...base, payload } as ConfigurationInput<C>);
}
export function validateResume(input: unknown): ValidationResult<ResumeInput> { const p = new Parser(); p.body(input); const row = p.object(input, ["tenant_id", "request_id", "expected_version", "step_id"], "input"); const step_id = p.text(row.step_id, 1, 20, "step_id"); if (!(ONBOARDING_STEPS as readonly string[]).includes(step_id)) p.fail("step_id", "invalid_input"); return p.result({ tenant_id: p.uuid(row.tenant_id, "tenant_id"), request_id: p.uuid(row.request_id, "request_id"), expected_version: p.number(row.expected_version, 0, MAX_ONBOARDING_VERSION, "expected_version"), step_id } as ResumeInput); }

function historyDefaultState(kind: string): "disabled" | "inactive" { return kind === "date_exceptions" ? "inactive" : "disabled"; }
function historyDefaultSort(kind: string): "position" | "local_date" { return kind === "date_exceptions" ? "local_date" : "position"; }
function readEnum<T extends string>(p: Parser, value: unknown, values: readonly T[], field: string): T {
  if (typeof value !== "string" || !values.includes(value as T)) p.fail(field, "invalid_input");
  return value as T;
}
export function validateOnboardingHistoryList(input: unknown): ValidationResult<OnboardingHistoryListInput> {
  const p = new Parser(); p.body(input);
  const row = p.partialObject(input, ["tenant_id", "kind", "state", "limit", "cursor", "search", "sort", "direction"], ["tenant_id", "kind"], "input");
  const kind = readEnum(p, row.kind, ONBOARDING_HISTORY_KINDS, "kind");
  const stateRaw = Object.hasOwn(row, "state") ? row.state : historyDefaultState(kind);
  const state = readEnum(p, stateRaw, ONBOARDING_HISTORY_STATES, "state");
  if ((kind === "date_exceptions" && state === "disabled") || (kind !== "date_exceptions" && state === "inactive")) p.fail("state", "invalid_input");
  const sortRaw = Object.hasOwn(row, "sort") ? row.sort : historyDefaultSort(kind);
  const sort = readEnum(p, sortRaw, ONBOARDING_HISTORY_SORTS, "sort");
  if ((kind === "date_exceptions" && sort === "position") || (kind !== "date_exceptions" && sort === "local_date")) p.fail("sort", "invalid_input");
  const direction = readEnum(p, Object.hasOwn(row, "direction") ? row.direction : "asc", ONBOARDING_HISTORY_DIRECTIONS, "direction");
  const limit = Object.hasOwn(row, "limit") ? p.number(row.limit, 1, 50, "limit") : 25;
  const cursor = !Object.hasOwn(row, "cursor") || row.cursor === null ? null : p.text(row.cursor, 1, 512, "cursor");
  const search = !Object.hasOwn(row, "search") || row.search === null ? null : p.text(row.search, 0, 120, "search");
  if (kind === "date_exceptions" && search) p.fail("search", "invalid_input");
  return p.result({ tenant_id: p.uuid(row.tenant_id, "tenant_id"), kind, state, limit, cursor, search: search || null, sort, direction });
}
export function validateOnboardingHistoryReenable(input: unknown): ValidationResult<OnboardingHistoryReenableInput> {
  const p = new Parser(); p.body(input);
  const row = p.object(input, ["tenant_id", "request_id", "expected_config_revision", "kind", "row_id", "payload"], "input");
  const kind = readEnum(p, row.kind, ONBOARDING_HISTORY_KINDS, "kind");
  const base = { tenant_id: p.uuid(row.tenant_id, "tenant_id"), request_id: p.uuid(row.request_id, "request_id"), expected_config_revision: p.number(row.expected_config_revision, 0, MAX_ONBOARDING_VERSION, "expected_config_revision"), kind, row_id: p.uuid(row.row_id, "row_id") };
  let payload: unknown;
  if (kind === "services") {
    const item = p.object(row.payload, ["name", "description", "position"], "payload");
    payload = { name: p.text(item.name, 0, 120, "name"), description: p.text(item.description, 0, 2000, "description"), position: p.number(item.position, 0, 9999, "position") };
  } else if (kind === "escalation_contacts") {
    const item = p.object(row.payload, ["label", "contact_name", "email", "phone", "position"], "payload");
    payload = { label: p.text(item.label, 0, 120, "label"), contact_name: p.text(item.contact_name, 0, 160, "contact_name"), email: p.contact(item.email, "email", "email"), phone: p.contact(item.phone, "phone", "phone"), position: p.number(item.position, 0, 9999, "position") };
  } else {
    const item = p.object(row.payload, ["date", "closed", "intervals"], "payload"), closed = p.boolean(item.closed, "closed");
    payload = { date: p.date(item.date, "date"), closed, intervals: p.intervals(item.intervals, closed, "intervals") };
  }
  return p.result({ ...base, payload } as OnboardingHistoryReenableInput);
}
export function validateInvitationAcceptance(input: unknown): ValidationResult<InvitationAcceptanceInput> { const p = new Parser(); p.body(input); const row = p.object(input, ["request_id", "token"], "input"); if (!isCanonicalInvitationToken(row.token)) p.fail("token", "invalid_input"); return p.result({ request_id: p.uuid(row.request_id, "request_id"), token: typeof row.token === "string" ? row.token : "" }); }
// Canonical UTF-8 bytes for a later server SHA256; contains no actor supplied by clients.
// This version uses sorted-key JSON, not PostgreSQL jsonb::text (whose spacing differs).
export function canonicalOnboardingJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string" || (typeof value === "number" && Number.isSafeInteger(value))) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalOnboardingJson).join(",")}]`;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) { const obj = value as Record<string, unknown>; if (Object.keys(obj).some(key => !/^[a-z_]+$/.test(key))) throw new TypeError("Unsupported canonical key"); return `{${Object.keys(obj).sort().map(key => `${JSON.stringify(key)}:${canonicalOnboardingJson(obj[key])}`).join(",")}}`; }
  throw new TypeError("Unsupported canonical input");
}
// SHA256 the UTF-8 string returned here. Actor comes from verified server identity.
// SQL constructs this same envelope from independently normalized input, then canonical_json.
export function configurationDigestDocument<C extends ConfigurationCommand>(command: C, actorUserId: string, normalized: ConfigurationInput<C>): string { return canonicalOnboardingJson({ contract_version: ONBOARDING_VERSION, command, actor_user_id: actorUserId, input: normalized }); }
export function resumeDigestDocument(actorUserId: string, normalized: ResumeInput): string { return canonicalOnboardingJson({ contract_version: ONBOARDING_VERSION, command: "save_resume_step", actor_user_id: actorUserId, input: normalized }); }
export function invitationDigestDocument(tenantId: string, actorUserId: string, requestId: string, tokenDigestHex: string): string {
  if (!/^[0-9a-f]{64}$/.test(tokenDigestHex)) throw new TypeError("Invalid token digest");
  return canonicalOnboardingJson({ contract_version: ONBOARDING_VERSION, command: "invite_accept", tenant_id: tenantId, actor_user_id: actorUserId, request_id: requestId, token_digest_hex: tokenDigestHex });
}
