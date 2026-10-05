# First-client demo script

Date: 2026-10-05
Use: present Cevanta as a managed AI receptionist pilot.

This script is for a demo with fictional data. Do not show real customer records, real phone numbers, private webhook URLs, API keys, or production provider settings.

## Demo promise

Say this first:

"This first version is a managed pilot. Cevanta helps answer calls, capture service requests, organize the work, and give the office a clear review flow. During the pilot, the office still confirms appointments, customer messages, and calendar changes."

Do not say:

- "The system fully books jobs automatically."
- "SMS and calendar automation are production-ready."
- "Retell and Make are already proven end to end for your business."
- "No office review is needed."

## Fictional demo company

Use this company if you need demo content:

- Company: Northstar HVAC Demo
- Trade: HVAC
- Time zone: America/New_York
- Main phone: +15550000002
- Main email: office@example.invalid
- Service area: Example County, Demo City, Sampletown
- Owner: Jordan Demo

## Fictional caller

- Name: Test Customer
- Phone: +15550000001
- Address: 123 Fictional Street
- Service needed: AC repair
- Preferred time: Tomorrow at 2 PM
- Urgency: No cooling, but no medical emergency
- Note: This is only a test.

## 10-minute demo flow

### 1. Start with the business problem

Say:

"Small service businesses miss calls, lose details, and spend too much time turning calls into organized work. Cevanta is being built to capture the call, structure the request, and keep the office in control."

### 2. Show the workspace

Show the signed-in workspace and explain:

- each business gets its own workspace
- roles control what each person can see or edit
- the office can manage customers, leads, jobs and setup from one place

Do not claim hosted tenant isolation is fully accepted until live Supabase verification is complete.

### 3. Show Setup / Onboarding

Show these sections if available:

- business profile
- services
- weekly hours
- date-specific hours
- request preferences
- escalation contacts
- resume setup later

Say:

"This is where we configure what the AI and office workflow should know before live calls. The goal is to capture requests safely, not promise confirmed bookings before the office approves."

### 4. Show customer and service records

Show customer/location/equipment areas using fictional data.

Say:

"This gives the office a shared record, so a caller's request can connect to the customer, location and equipment over time."

### 5. Show leads or service requests

Use a fictional lead/request.

Say:

"The first sellable pilot should create a request for office review. The office checks the details, then decides the next step."

### 6. Show jobs and dispatch foundation

Show jobs/dispatch if available.

Say:

"After review, the office can move work toward scheduling and assignment. In the first pilot, dispatch remains under human control."

### 7. Show internal calendar foundation

Show the calendar/appointment area if available.

Say:

"Calendar support exists in the app foundation, but live Google Calendar writes should remain off until the dry-run evidence and owner approval are complete."

### 8. Show Launch and Integrations readiness

Open the Launch page and Integrations page.

Say:

"This is where we separate what is ready from what still needs approval. Retell phone answering has passed a live inbound test. Make safe intake has passed fictional duplicate-handling tests. SMS, external calendar writes, billing and production deployment are still off."

### 9. Explain the voice path honestly

Say:

"The target voice flow is Retell receives the call, Make processes the final analyzed call event, and Cevanta receives a safe lead or request for office review. Retell phone answering and Make safe intake have proof now, but live production writes and confirmed booking still need approval and hosted verification."

### 10. Close with the pilot offer

Say:

"The first pilot is about capturing calls and organizing follow-up, with your office approving the outcome. Once that is stable, we can add controlled automation like SMS, calendar holds, or confirmed bookings in later phases."

## Questions to ask after the demo

- Would this help your office catch missed calls?
- Who should review new AI-created requests?
- Which services should the AI recognize first?
- What should the AI never promise?
- Do you want the first pilot to create leads only, or draft appointment requests for review?
- Who should be alerted for urgent calls?

## Demo stop rules

Stop or pause the demo if:

- real customer data appears
- credentials or webhook URLs are visible
- a live SMS/email/calendar action might be triggered
- the prospect asks for production automation that has not been proven
- the app behavior does not match the current accepted limitations

