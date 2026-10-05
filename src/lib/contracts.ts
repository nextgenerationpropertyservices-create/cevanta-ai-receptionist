export const ROLES = ["owner", "admin", "dispatcher", "technician", "viewer"] as const;
export type Role = (typeof ROLES)[number];
export const OFFICE_ROLES: readonly Role[] = ["owner", "admin", "dispatcher"];
export const SETTINGS_ROLES: readonly Role[] = ["owner", "admin"];
export const canManageCustomers = (role: Role) => OFFICE_ROLES.includes(role);
export const canManageSettings = (role: Role) => SETTINGS_ROLES.includes(role);
export interface Tenant { id: string; name: string; trade: string; timezone: string; created_at: string; updated_at: string }
export interface Membership { tenant_id: string; user_id: string; role: Role; created_at: string }
export interface Customer { id: string; tenant_id: string; name: string; email: string | null; phone: string | null; notes: string | null; created_at: string; updated_at: string }
export interface Contact { id: string; tenant_id: string; customer_id: string; name: string; email: string | null; phone: string | null; job_title: string | null; created_at: string; updated_at: string }
export interface ServiceLocation { id: string; tenant_id: string; customer_id: string; label: string; address_line1: string; city: string; state: string; postal_code: string; created_at: string; updated_at: string }
export interface Equipment { id: string; tenant_id: string; service_location_id: string; name: string; type: string; manufacturer: string | null; model: string | null; serial_number: string | null; created_at: string; updated_at: string }
export interface AuditEvent { id: string; tenant_id: string; actor_user_id: string | null; entity_type: string; entity_id: string; action: "INSERT" | "UPDATE" | "DELETE"; created_at: string }
