# CEV-FREE-USERS-177

Morgan owns integration. Atlas owns the migration and its embedded database test. Quinn owns the independent security review. Depends on the existing free plan, self-service provisioning receipts, audit events, and verified authentication. Local checks passed and hosted release is pending approval.

Show verified owners who created a free workspace, signup date, most recent dashboard open, recorded tool use, and current plan. Keep the projection read-only and restricted to verified internal workspace owners/admins. Count recorded business actions and observe actual signed-in dashboard opens. Include upgraded workspaces that originated on free. Track minimal timestamps and aggregate tool names only. No client record contents or outbound messages.

Allowed files: one new migration under supabase/migrations, one new embedded test under scripts, src/lib/server/free-tool-users.ts, src/app/actions/free-tool-activity.ts, src/components/free-tool-activity.tsx, src/app/workspaces/[tenantId]/layout.tsx, src/app/workspaces/[tenantId]/clients/page.tsx, src/app/free-tools/page.tsx, tests/managed-clients.test.ts, this task and matching handoffs. Required evidence includes positive and negative SQL access tests, page integration, typecheck, lint, tests and build. Production release is separate.
