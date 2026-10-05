import { describe, expect, it } from "vitest";
import { createHash, randomBytes } from "node:crypto";
import { PENDING_ONBOARDING_READINESS } from "@/lib/onboarding-contracts";
import { configurationDigestDocument, invitationDigestDocument, isCanonicalInvitationToken, isOnboardingDate, validateConfiguration, validateInvitationAcceptance, validateResume } from "@/lib/onboarding-validation";

const tenant = "45000000-0000-4000-8000-000000000001";
const request = "45000000-0000-4000-8000-000000000002";
const profile = { name: "Fictional business", trade: "HVAC", timezone: "America/New_York", business_contact_name: "", business_email: null, business_phone: null };
const envelope = (payload: unknown) => ({ tenant_id: tenant, request_id: request, expected_config_revision: 0, payload });
const parseProfile = (fields: Record<string, unknown>) => validateConfiguration("save_business_profile", envelope({ ...profile, ...fields }));

describe("onboarding authority and strict inputs", () => {
  it("saves incomplete contacts with valid tenant authority and normalizes ASCII edges", () => {
    const result = parseProfile({ name: "\t Fictional business \r", business_email: "  ", business_phone: "" });
    expect(result).toEqual({ ok: true, value: envelope(profile) });
  });
  it.each([{ name: "" }, { name: " \t" }, { trade: null }, { timezone: null }, { timezone: "GMT+5" }, { business_email: "bad" }, { business_email: "a..b@example.invalid" }, { business_phone: "5551234" }, { business_contact_name: "x\u0000y" }, { business_contact_name: "\ud800" }, { role: "owner" }])("rejects invalid or injected profile fields %j", fields => {
    expect(parseProfile(fields).ok).toBe(false);
  });
  it("counts Unicode code points without widening whitespace rules", () => {
    expect(parseProfile({ name: "😀".repeat(160) }).ok).toBe(true);
    expect(parseProfile({ name: "😀".repeat(161) }).ok).toBe(false);
    const result = parseProfile({ name: "\u00a0Demo\u00a0" });
    expect(result.ok && result.value.payload.name).toBe("\u00a0Demo\u00a0");
  });
  it.each(["0", -1, 0.5, 2147483648, true])("rejects non-integer/out-of-range revisions %j", value => {
    expect(validateConfiguration("save_business_profile", { ...envelope(profile), expected_config_revision: value }).ok).toBe(false);
  });
  it("rejects forged actor, malformed tenant and omitted fields", () => {
    expect(validateConfiguration("save_business_profile", { ...envelope(profile), actor_user_id: tenant }).ok).toBe(false);
    expect(validateConfiguration("save_business_profile", { ...envelope(profile), tenant_id: "bad" }).ok).toBe(false);
    const { trade: omitted, ...missing } = profile;
    expect(omitted).toBe("HVAC");
    expect(validateConfiguration("save_business_profile", envelope(missing)).ok).toBe(false);
  });
  it("bounds payload size without claiming raw transport enforcement", () => {
    const result = parseProfile({ business_contact_name: "x".repeat(131073) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues).toContainEqual({ field: "input", code: "too_large" });
  });
});

describe("dates, schedules and replacement identity", () => {
  it.each(["0000-01-01", "2026-02-29", "2028-02-30", "2026-13-01", "2026-01-00", "2026-1-01", "10000-01-01"])("rejects impossible/out-of-format date %s", date => expect(isOnboardingDate(date)).toBe(false));
  it.each(["0001-01-01", "2000-02-29", "2028-02-29", "9999-12-31"])("accepts real bounded date %s", date => expect(isOnboardingDate(date)).toBe(true));
  const days = () => Array.from({ length: 7 }, (_, weekday) => ({ weekday, closed: true, intervals: [] as { start_minute: number; end_minute: number }[] }));
  it("requires seven explicit unique days, with no automatic weekdays", () => {
    expect(validateConfiguration("replace_weekly_hours", envelope({ days: days() })).ok).toBe(true);
    expect(validateConfiguration("replace_weekly_hours", envelope({ days: days().slice(1) })).ok).toBe(false);
    expect(validateConfiguration("replace_weekly_hours", envelope({ days: days().map(row => ({ ...row, weekday: 0 })) })).ok).toBe(false);
  });
  it("accepts adjacency and open incomplete days, rejects overlap and closed intervals", () => {
    const input = (closed: unknown, intervals: unknown) => envelope({ date: "2028-02-29", closed, intervals });
    const rows = [{ start_minute: 600, end_minute: 660 }, { start_minute: 540, end_minute: 600 }];
    expect(validateConfiguration("upsert_hours_exception", input(false, rows)).ok).toBe(true);
    expect(validateConfiguration("upsert_hours_exception", input(false, [])).ok).toBe(true);
    expect(validateConfiguration("upsert_hours_exception", input(true, rows)).ok).toBe(false);
    expect(validateConfiguration("upsert_hours_exception", input(false, [{ start_minute: 540, end_minute: 601 }, rows[0]])).ok).toBe(false);
  });
  it.each([{ start_minute: "0", end_minute: 10 }, { start_minute: 0.5, end_minute: 10 }, { start_minute: 0, end_minute: 1441 }, { start_minute: 10, end_minute: 10 }, { start_minute: 0, end_minute: 10, actor: tenant }])("rejects invalid interval %j", row => {
    expect(validateConfiguration("upsert_hours_exception", envelope({ date: "2028-02-29", closed: false, intervals: [row] })).ok).toBe(false);
  });
  it("rejects coerced booleans, duplicate IDs and oversized replacements", () => {
    const service = { id: tenant, name: "", description: "", enabled: true, position: 0 };
    expect(validateConfiguration("replace_services", envelope({ items: [service] })).ok).toBe(true);
    expect(validateConfiguration("replace_services", envelope({ items: [service, service] })).ok).toBe(false);
    expect(validateConfiguration("replace_services", envelope({ items: [{ ...service, enabled: "true" }] })).ok).toBe(false);
    expect(validateConfiguration("replace_services", envelope({ items: Array.from({ length: 101 }, () => ({ ...service, id: null })) })).ok).toBe(false);
    expect(validateConfiguration("replace_escalation_contacts", envelope({ items: [{ id: null, label: "", contact_name: "", email: null, phone: null, enabled: false, position: 0 }] })).ok).toBe(true);
  });
});

describe("invitation privacy, digest identity and readiness", () => {
  it("accepts canonical 32-byte tokens and rejects padding/noncanonical bits", () => {
    for (let i = 0; i < 32; i++) expect(isCanonicalInvitationToken(randomBytes(32).toString("base64url"))).toBe(true);
    expect(isCanonicalInvitationToken("A".repeat(42) + "B")).toBe(false);
    expect(isCanonicalInvitationToken("A".repeat(43) + "=")).toBe(false);
    expect(isCanonicalInvitationToken("A".repeat(42))).toBe(false);
  });
  it("rejects client-supplied invitation authority and another resume actor", () => {
    const input = { request_id: request, token: "A".repeat(43) };
    expect(validateInvitationAcceptance(input).ok).toBe(true);
    expect(validateInvitationAcceptance({ ...input, role: "owner" }).ok).toBe(false);
    expect(validateInvitationAcceptance({ ...input, tenant_id: tenant }).ok).toBe(false);
    const resume = { tenant_id: tenant, request_id: request, expected_version: 0, step_id: "profile" };
    expect(validateResume(resume).ok).toBe(true);
    expect(validateResume({ ...resume, user_id: tenant }).ok).toBe(false);
  });
  it("binds request/actor/content and canonicalizes normalized envelopes deterministically", () => {
    const parsed = parseProfile({});
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("Fixture invalid");
    const digest = configurationDigestDocument("save_business_profile", tenant, parsed.value);
    expect(configurationDigestDocument("save_business_profile", tenant, { ...parsed.value, payload: { ...profile } })).toBe(digest);
    expect(configurationDigestDocument("save_business_profile", request, parsed.value)).not.toBe(digest);
    expect(configurationDigestDocument("save_business_profile", tenant, { ...parsed.value, request_id: tenant })).not.toBe(digest);
    expect(configurationDigestDocument("save_business_profile", tenant, { ...parsed.value, payload: { ...profile, name: "Changed" } })).not.toBe(digest);
  });
  it("invitation digest document contains hashed token identity, not plaintext token", () => {
    const token = "A".repeat(43);
    const hash = createHash("sha256").update(Buffer.from(token, "base64url")).digest("hex");
    const document = invitationDigestDocument(tenant, tenant, request, hash);
    expect(document).not.toContain(token);
    expect(JSON.parse(document).token_digest_hex).toBe(hash);
    expect(() => invitationDigestDocument(tenant, tenant, request, token)).toThrow();
  });
  it("saved configuration cannot assert provider, booking or production readiness", () => {
    expect(PENDING_ONBOARDING_READINESS).toMatchObject({ configuration_state: "not_evaluated", manual_workspace_state: "not_evaluated", reason: "setup_policy_pending", booking_state: "blocked", release_state: "not_evaluated", hostedReady: false, providerConnectionAuthorized: false });
    expect(Object.isFrozen(PENDING_ONBOARDING_READINESS)).toBe(true);
  });
});
