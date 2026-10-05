# Secure foundation

Next.js server code verifies the user with Supabase Auth and selects a membership before protected operations. Ordinary queries use the user's session and publishable key. PostgreSQL RLS independently restricts reads and writes using the verified JWT subject.

Tenant settings live on tenants. Memberships are created only by a trusted database administrator after an Auth user is created and verified. No application endpoint can create tenants, promote roles, or join a tenant. Membership SELECT returns only the current user's memberships. A narrowly scoped SECURITY DEFINER predicate avoids recursive membership RLS; its search path is fixed and it only returns a boolean for the current subject.

All five roles can read their tenant's customer records. Owner, admin, and dispatcher can insert and update customers, contacts, locations, and equipment. Owner/admin can change name, trade, and time zone. Technician and viewer are read only; assignment-based field access is deferred until jobs exist. Deletes are deferred. Owner/admin alone read audits.

Composite foreign keys enforce that contacts and locations belong to customers in the same tenant, and equipment belongs to locations in the same tenant. Database checks bound text lengths. Server Zod schemas validate forms. Audit triggers commit atomically with business writes, storing entity identifiers and operation only, never copied customer payloads. Audit entries cannot be modified by ordinary users.

The seed contains two fictional businesses and records, without user passwords or sign-in bypass. Create a verified Auth user with the local dashboard or hosted admin interface, then provision its membership through trusted SQL. No private storage bucket or storage policy is shipped because file uploads are outside this milestone; do not create public customer-data buckets.

The actual migration, seed and security assertions passed in embedded PostgreSQL with a minimal Auth compatibility fixture; see docs/project/VERIFICATION.md. Quality and final Architect source reviews approved the foundation. This does not establish live Supabase JWT/Auth/PostgREST behavior. Live acceptance requires a disposable local stack plus verified synthetic users and authenticated browser checks. Never run fixture SQL on a hosted customer database.

## Architecture review CEV-M1-02-F1

Architect review approves the M1 shared record and role contracts by source inspection: SQL columns match TypeScript interfaces, Zod parses only business fields, server operations verify the Auth user and tenant membership, parent queries include tenant ownership, and frontend forms pass the parent identifiers expected by server actions. Read access is available to all five tenant roles; office writes and owner/admin settings rules match database policy. Ordinary clients use the publishable key and user session.

Entity UPDATE privileges are limited to business fields. Ordinary sessions cannot update id, tenant_id, parent foreign keys, created_at, or updated_at, even when they have office roles in multiple tenants. The timestamp trigger supplies updated_at. Composite foreign keys still enforce tenant-consistent parent ownership on INSERT. Transfer/reparent workflows require a future reviewed design rather than direct field updates.

The foundation migration has been corrected before initial acceptance. Apply it through a local reset in this unborn, undeployed project. An existing installation that already ran the old migration would need a forward revoke/grant migration; editing a historical migration alone cannot repair an existing database.

Review is source-level approval, not database acceptance. SQL regression coverage now includes identity/tenant/parent privileges, the multi-tenant bare-customer transfer attempt, allowed office business updates, owner/admin settings, technician/viewer write denial and anonymous denial. PostgreSQL execution and authenticated browser/API flows remain required. Database timezone validation is weaker than the server's IANA validation; a direct office settings write can store an invalid timezone. This is a data-quality limitation and should be tightened before time-sensitive scheduling is added.
