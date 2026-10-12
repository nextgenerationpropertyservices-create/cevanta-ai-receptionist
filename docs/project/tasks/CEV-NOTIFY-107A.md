# CEV-NOTIFY-107A — Office email notification outbox preparation

Date: 2026-10-12 (America/New_York)
Coordinator: Morgan — Product Manager and Orchestrator
Owner: Morgan (`product_manager`)

## Scope

Prepare the first office-only email notification layer for new AI receptionist leads without sending email. When the existing Retell/Make lead writer creates a new lead and the client email automation control is requested, owner-approved, and ready/active with test evidence and rollback notes, Cevanta records a private office-email notification outbox item for that lead. Duplicate provider retries must not create duplicate notification records.

This task does not send email to customers or office users. It does not add a provider package, SMTP/SendGrid/Gmail credential, customer email automation, SMS, calendar write, booking, payment, subscription, or dispatch side effect.

## Dependencies

- CEV-AUTOMATION-105A workspace automation controls.
- Existing Retell/Make lead ingestion RPC and duplicate receipt behavior.
- Existing embedded database test harness.

## Allowed files

- `supabase/migrations/202610120004_office_email_notification_outbox.sql`
- `supabase/tests/retell_lead_ingestion.sql`
- `.env.example`
- `docs/project/tasks/CEV-NOTIFY-107A.md`
- `docs/project/handoffs/CEV-NOTIFY-107A-morgan.md`
- `docs/project/PROJECT_STATUS.md`

## Acceptance criteria

- A private office-notification outbox table exists for office email preparation records.
- Ordinary `anon` and `authenticated` roles cannot read or write the private outbox table.
- Retell/Make lead ingestion creates no email outbox record when the workspace email automation control is off.
- Retell/Make lead ingestion creates exactly one office-email outbox record when the workspace email automation control is requested, owner-approved, and `ready` or `active` with evidence and rollback plan.
- Duplicate provider event or duplicate call replay does not create an extra email outbox record.
- The outbox record links to the tenant and lead, uses an office-only reason, and stores no customer email body, transcript, recording URL, webhook URL, API key, or provider secret.
- No live email provider is called and no customer-facing email is sent.

## Required evidence

- Embedded Retell lead-ingestion database suite passes with new outbox assertions.
- Full `pnpm check` or equivalent typecheck/lint/tests/build evidence.
- Handoff and project status update with limitations.
