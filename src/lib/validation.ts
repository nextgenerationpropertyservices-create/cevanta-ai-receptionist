import { z } from "zod";

const required = (max: number) => z.string().trim().min(1, "This field is required.").max(max);
const optional = (max: number) => z.string().trim().max(max).optional().transform(value => value || null);
const email = z.union([z.email().max(254), z.literal("")]).optional().transform(value => value || null);
export const signInSchema = z.object({ email: z.email(), password: z.string().min(1).max(256) });
export const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Use at least 8 characters.").max(256),
  confirmPassword: z.string().min(1).max(256),
}).refine(value => value.password === value.confirmPassword, {
  message: "Passwords must match.",
  path: ["confirmPassword"],
});
export const workspaceProvisionSchema = z.object({
  request_id: z.uuid(),
  name: required(160),
  trade: required(80),
  timezone: required(80).refine(value => { try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }, "Enter a valid IANA time zone."),
});
export const tenantSettingsSchema = z.object({ name: required(160), trade: required(80), timezone: required(80).refine(value => { try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }, "Enter a valid IANA time zone.") });
export const customerSchema = z.object({ name: required(160), email, phone: optional(40), notes: optional(4000) });
export const contactSchema = z.object({ name: required(160), email, phone: optional(40), job_title: optional(100) });
export const serviceLocationSchema = z.object({ label: required(100), address_line1: required(200), city: required(100), state: required(80), postal_code: required(24) });
export const equipmentSchema = z.object({ name: required(120), type: required(80), manufacturer: optional(100), model: optional(100), serial_number: optional(100) });
