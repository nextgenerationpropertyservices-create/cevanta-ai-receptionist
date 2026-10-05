# CEV-AUTH-03 sign-in review

Quality source review: approved for safe diagnostics. The sign-in action uses fixed categories and messages, logs only category and optional integer HTTP error status (400–599), preserves the successful redirect outside its catch, and retains the ordinary Supabase client. No credentials, account identifiers, session, raw code or provider message are logged. No schema or authorization changes.

Verification: `node node_modules/vitest/vitest.mjs run tests/security.test.ts` passed all 54 tests, exit 0. Initial sandbox execution failed during esbuild configuration resolution (parent-directory access denied); approved escalated execution passed. Tests invoke the actual action with synthetic inputs and a mocked provider. Added cases cover input/configuration failures, all mapped error categories, unknown code/status sanitization, transport failure, and success without logging.

Reproduction of the original limitation: return a provider `email_not_confirmed` or rate-limit error from `signInWithPassword`, then submit valid-shaped synthetic input. Previously the action returned the same credential message for every returned provider error. Severity: low usability/diagnostic defect; this review found no authorization bypass or information disclosure in the change.

Live sign-in remains unverified. The coordinator observed an `unknown` category without status on a private browser retry; this does not establish a credentials failure or prove hosted authentication works. Network restrictions and owner terminal startup are being investigated separately. Full type checking, lint and build are coordinator acceptance checks.
