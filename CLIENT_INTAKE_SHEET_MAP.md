# Cevanta Client Intake Sheet Map

The Google Sheet **Cevanta Client Intake Responses** is the response register for client onboarding.

Use one row per client submission. Keep the first row as headers. The columns are ordered to match `CLIENT_INTAKE_FORM.md`:

1. Submitted At
2. Client Business
3. Trade
4. Contact Name
5. Contact Email
6. Contact Phone
7. Time Zone
8. Service Area
9. Services
10. Business Hours
11. Emergency Rules
12. Escalation Contacts
13. Call Handling Rules
14. Never Promise Rules
15. Retell Agent
16. Make Scenario
17. Setup Status
18. Notes

Recommended Setup Status values are `Received`, `Entered in workspace`, `Test call pending`, `Ready for review`, and `Live pilot approved`.

This sheet is a controlled response register. It does not itself send email, SMS, book appointments, write calendars, collect payments, or dispatch technicians.

## Automatic sync

The owner Setup page can send one completed snapshot to the private Make webhook after the client reviews all sections. Configure the webhook URL only as the server-side `CEVANTA_CLIENT_INTAKE_WEBHOOK_URL` environment variable. Keep the Make scenario inactive until a fictional test row is confirmed in this sheet.

Sync is an explicit final action rather than a save hook, so editing individual sections does not create partial rows.
