# CEV-OWNER-04 coordinator handoff
- Task ID: CEV-OWNER-04
- Work completed: Prepared exact email-targeted trusted development SQL; placeholder stays in source. Prior sole-user script failed safely. Browser confirmed no memberships, while sign-in now works after network-enabled server restart.
- Files changed: supabase/setup-development-owner-targeted.sql, task and this handoff.
- Database changes: None executed by agent. Owner-only script grants one confirmed selected account owner membership in fictional demo HVAC workspace; no schema/RLS changes. Tenant row lock serializes this helper's membership checks.
- API or contract changes: None.
- Verification: Architect and Quality reviews in separate handoffs; Quality actual schema/seed nine isolated scenarios PASS exit 0; Architect final source review approved.
- Known limitations: Hosted SQL execution and authenticated dashboard access require owner follow-up. Refuses another owner; no automatic replacement.
- Risks: Filled SQL must remain private in Supabase SQL Editor. Never save actual email in repository.
- Rollback: Failed transaction creates no membership. Successful removal requires targeted trusted admin operation; do not delete unrelated memberships.
- Exact next action: After reviews pass, owner replaces placeholder privately and runs new SQL in Cevanta Development, then refreshes workspace picker.

