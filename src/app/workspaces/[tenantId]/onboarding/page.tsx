import Link from 'next/link';
import { SELF_SERVICE_ONBOARDING_STEPS, STANDARD_INTAKE_FIELDS, templateForTrade } from '@/lib/client-onboarding-blueprint';
import { getOnboardingSnapshot } from '@/lib/server/onboarding-rpc';
import type { OwnerOnboardingSnapshot } from '@/lib/onboarding-contracts';
import { BusinessProfileForm, RefreshSetupButton, ServicesForm, WeeklyHoursForm, HoursExceptionsForm, BookingPreferencesForm, EscalationContactsForm, ResumeStepForm } from './onboarding-form';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const clock = (minute: number) => minute === 1440 ? '24:00' : `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

function SetupProgress({ snapshot }: { snapshot: OwnerOnboardingSnapshot }) {
  const blank = (value: string | null | undefined) => !value?.trim();
  const missingBusiness = [snapshot.workspace.name, snapshot.workspace.trade, snapshot.workspace.timezone].filter(blank).length;
  const unnamedServices = snapshot.services.filter(item => blank(item.name)).length;
  const missingHours = snapshot.weekly_hours.filter(day => !day.closed && !day.intervals.length).length;
  const contactGaps = snapshot.escalation.filter(item => blank(item.contact_name) || (blank(item.email) && blank(item.phone))).length;
  const activeExceptions = snapshot.exceptions.filter(item => item.active).length;
  const unsetPreferences = snapshot.booking ? [snapshot.booking.lead_time_minutes, snapshot.booking.buffer_before_minutes, snapshot.booking.buffer_after_minutes, snapshot.booking.horizon_days].filter(value => value === null).length : 0;
  const steps = [
    { label: 'Business details', target: 'business-details', state: missingBusiness ? `${missingBusiness} business fields missing` : 'Business name, trade and time zone saved', detail: snapshot.profile ? 'Contact information saved. Blank contact fields can be added later.' : 'Business contact information not saved yet.' },
    { label: 'Services', target: 'setup-services', state: snapshot.services.length ? `${snapshot.services.length} services saved; ${snapshot.services.filter(item => item.enabled).length} enabled` : 'No services saved', detail: unnamedServices ? `${unnamedServices} services have no name. Review them in the editor.` : 'Add or review the services your business offers.' },
    { label: 'Weekly hours', target: 'setup-hours', state: `${snapshot.weekly_hours.length} of 7 days saved`, detail: missingHours ? `${missingHours} open days have no intervals. Review the hours below.` : snapshot.weekly_hours.length < 7 ? 'Review and save all seven days. Missing days start closed in the editor.' : 'All seven days have stored entries. Review open and closed days before use.' },
    { label: 'Date-specific hours', target: 'setup-exceptions', state: activeExceptions ? `${activeExceptions} active date overrides saved` : 'No date-specific hours saved', detail: 'Overrides are local-date office hours only. They do not book appointments or sync calendars.' },
    { label: 'Request preferences', target: 'setup-requests', state: snapshot.booking ? 'Request preferences saved' : 'Request preferences not saved yet', detail: snapshot.booking ? `${unsetPreferences} optional timing preferences not set. Booking remains request-only.` : 'Describe how your office reviews requests. This does not enable live booking.' },
    { label: 'Escalation contacts', target: 'setup-contacts', state: snapshot.escalation.length ? `${snapshot.escalation.length} contacts saved; ${snapshot.escalation.filter(item => item.enabled).length} enabled` : 'No escalation contacts saved', detail: contactGaps ? `${contactGaps} contacts are missing a name or both email and phone. Review their details.` : 'Add or review contacts for requests that need a person’s attention.' },
  ];
  return <section className="panel setup-progress" aria-labelledby="setup-progress-title">
    <h2 id="setup-progress-title">Your setup information</h2>
    <p>This summary shows stored information and blank fields. It does not score your setup or confirm readiness. Required setup checks are awaiting review by the Cevanta team.</p>
    <ul className="setup-section-status">{steps.map(step => <li key={step.target}><h3>{step.label}</h3><p className="setup-storage-state">{step.state}</p><p className="small">{step.detail}</p><a className="card-link" href={`#${step.target}`}>Review {step.label.toLowerCase()} →</a></li>)}</ul>
    <p className="small">Blank optional fields and enabled items are stored choices, not readiness checks. Save one section at a time and review refreshed information before saving another.</p>
    <p><strong>Your next step:</strong> Review the sections with missing information using the links above. You can return to your dashboard while readiness review is pending.</p>
  </section>;
}

function OnboardingBlueprint({ snapshot }: { snapshot: OwnerOnboardingSnapshot }) {
  const template = templateForTrade(snapshot.workspace.trade);
  return <section className="panel setup-readiness" aria-labelledby="onboarding-blueprint-title">
    <div className="section-heading">
      <div><span className="eyebrow">CLIENT ONBOARDING BLUEPRINT</span><h2 id="onboarding-blueprint-title">Template and intake plan</h2></div>
      <span className="pill">{template.label}</span>
    </div>
    <p>Cevanta will use this saved setup to draft the AI receptionist and route office-review leads. This is a control plan only; it does not create provider accounts, publish a Retell agent, activate Make, send messages, write calendars, collect payment, or dispatch technicians.</p>
    <div className="dispatch-summary">
      <article><span>Starter services</span><strong>{template.defaultServices.slice(0, 3).join(', ')}</strong><p className="small muted">Edit the saved services below so the client’s actual work wins over defaults.</p></article>
      <article><span>Ask during calls</span><strong>{template.intakeFocus.slice(0, 3).join(', ')}</strong><p className="small muted">The receptionist should collect only enough detail for office review.</p></article>
      <article><span>Escalate for review</span><strong>{template.escalationFocus.slice(0, 2).join(', ')}</strong><p className="small muted">Urgent issues are flagged for humans; dispatch is not promised.</p></article>
      <article><span>Never promise</span><strong>{template.neverPromise.slice(0, 3).join(', ')}</strong><p className="small muted">Add client-specific never-promise rules in request preferences.</p></article>
    </div>
    <h3>Standard intake fields</h3>
    <ul className="setup-readiness-list">{STANDARD_INTAKE_FIELDS.map(field => <li key={field.label}><strong>{field.label}{field.required ? ' — required' : ' — optional'}:</strong> {field.officeUse}</li>)}</ul>
    <h3>Self-service setup path</h3>
    <ol className="setup-readiness-list">{SELF_SERVICE_ONBOARDING_STEPS.map(step => <li key={step.title}><strong>{step.title}:</strong> {step.ownerAction} <span className="small muted">{step.gate}</span></li>)}</ol>
  </section>;
}

export default async function OnboardingPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const response = await getOnboardingSnapshot(tenantId);
  if (response.status !== 'available') return <section className="panel" aria-labelledby="setup-error-title">
    <h1 id="setup-error-title">Setup is unavailable</h1>
    <p role="alert">{response.status === 'unavailable' ? 'Check that you are signed in to the right workspace. Your access may have changed.' : 'We could not load setup information. Try again in a moment. Your saved information has not been changed.'}</p>
    <div className="button-row"><RefreshSetupButton/><Link className="button secondary" href={`/workspaces/${tenantId}`}>Return to dashboard</Link></div>
  </section>;
  const snapshot = response.snapshot;
  return <>
    <div className="page-heading"><span className="eyebrow">WORKSPACE SETUP</span><h1>Set up your business.</h1><p>Fill this out like your front-office intake file. Cevanta uses it to understand your services, hours, emergency rules, service area, escalation contacts, call rules, and things the AI should never promise.</p><Link className="back-link" href={`/workspaces/${tenantId}`}>← Return to dashboard</Link></div>
    {snapshot.projection === 'owner_setup' ? <>
      <section className="panel setup-readiness" aria-labelledby="readiness-title"><h2 id="readiness-title">Readiness review is pending</h2><p>Setup requirements are awaiting review by the Cevanta team. Saving your details does not enable AI calls or live bookings.</p><p className="notice">Requests need office review. Provider verification is pending.</p><ul className="setup-readiness-list"><li><strong>Business details:</strong> Add the public name, trade, timezone, and the best office contact.</li><li><strong>Services and service area:</strong> List the work you want Cevanta to recognize. Put service area details in request preferences until a dedicated service-area editor is added.</li><li><strong>Hours and emergency rules:</strong> Save normal hours, date exceptions, urgent-call handling, and when a human should review first.</li><li><strong>Escalation contacts:</strong> Add who the office should contact for urgent or uncertain requests.</li><li><strong>Never-promise rules:</strong> Put anything the AI must not promise in request preferences, such as prices, appointment confirmations, parts availability, financing, warranties, or emergency dispatch.</li><li><strong>Controlled writes:</strong> SMS, email, and external calendar writes stay off until approved and tested. Automatic booking, payment collection, and dispatch automation remain disabled.</li></ul><p>The Cevanta team can see these saved answers in the internal owner dashboard. These editors do not send messages, write calendars, collect payment, dispatch technicians, or release production changes.</p></section>
      <OnboardingBlueprint snapshot={snapshot}/>
      <section className="panel setup-editor-panel" aria-labelledby="setup-resume-title"><h2 id="setup-resume-title">Resume setup later</h2><ResumeStepForm tenantId={snapshot.workspace.id} version={snapshot.resume_version} step={snapshot.resume_step}/></section>
      <div className="setup-workspace-grid"><SetupProgress snapshot={snapshot}/><section className="panel" id="business-details"><h2>Business details</h2><BusinessProfileForm tenantId={snapshot.workspace.id} revision={snapshot.config_revision} values={{ name: snapshot.workspace.name, trade: snapshot.workspace.trade, timezone: snapshot.workspace.timezone, business_contact_name: snapshot.profile?.business_contact_name ?? '', business_email: snapshot.profile?.business_email ?? null, business_phone: snapshot.profile?.business_phone ?? null }}/></section></div><section className="panel setup-editor-panel" id="setup-services" aria-labelledby="setup-services-title"><h2 id="setup-services-title">Services</h2><ServicesForm tenantId={snapshot.workspace.id} revision={snapshot.config_revision} values={{ items: snapshot.services.map(item => ({ id: item.id, name: item.name, description: item.description, enabled: item.enabled, position: item.position })) }}/></section><section className="panel setup-editor-panel" id="setup-hours" aria-labelledby="setup-hours-title"><h2 id="setup-hours-title">Weekly hours</h2><WeeklyHoursForm tenantId={snapshot.workspace.id} revision={snapshot.config_revision} timezone={snapshot.workspace.timezone} values={{ days: snapshot.weekly_hours.map(day => ({ weekday: day.weekday, closed: day.closed, intervals: day.intervals.map(interval => ({ start_minute: interval.start_minute, end_minute: interval.end_minute })) })) }}/></section>
      <section className="panel setup-editor-panel" id="setup-exceptions" aria-labelledby="setup-exceptions-title"><h2 id="setup-exceptions-title">Date-specific hours</h2><HoursExceptionsForm tenantId={snapshot.workspace.id} revision={snapshot.config_revision} timezone={snapshot.workspace.timezone} values={{ items: snapshot.exceptions.map(item => ({ id: item.id, date: item.date, closed: item.closed, intervals: item.intervals.map(interval => ({ start_minute: interval.start_minute, end_minute: interval.end_minute })), active: item.active, version: item.version })) }}/></section>
      <section className="panel setup-editor-panel" id="setup-requests" aria-labelledby="setup-requests-title"><h2 id="setup-requests-title">Request preferences</h2><BookingPreferencesForm tenantId={snapshot.workspace.id} revision={snapshot.config_revision} saved={snapshot.booking !== null} values={{ lead_time_minutes: snapshot.booking?.lead_time_minutes ?? null, buffer_before_minutes: snapshot.booking?.buffer_before_minutes ?? null, buffer_after_minutes: snapshot.booking?.buffer_after_minutes ?? null, horizon_days: snapshot.booking?.horizon_days ?? null, notes: snapshot.booking?.notes ?? '', acknowledged: snapshot.booking?.acknowledged ?? false }}/></section><section className="panel setup-editor-panel" id="setup-contacts" aria-labelledby="setup-contacts-title"><h2 id="setup-contacts-title">Escalation contacts</h2><EscalationContactsForm tenantId={snapshot.workspace.id} revision={snapshot.config_revision} values={{ items: snapshot.escalation.map(item => ({ id: item.id, label: item.label, contact_name: item.contact_name, email: item.email, phone: item.phone, enabled: item.enabled, position: item.position })) }}/></section>
    </> : snapshot.projection === 'dispatcher_operations' ? <section className="panel setup-operations"><h2>Office setup information</h2><p className="notice">Your access is read-only here. A workspace owner or admin manages business setup. Requests need office review; live booking readiness is pending.</p><p>Business time zone: <strong>{snapshot.workspace.timezone}</strong></p><h3>Services</h3>{snapshot.services.some(item => item.enabled) ? <ul>{snapshot.services.filter(item => item.enabled).map(item => <li key={item.id}>{item.name}</li>)}</ul> : <p>No services have been saved yet.</p>}<h3>Weekly hours</h3><p className="small">Hours use the business time zone. Saved hours do not reserve an appointment.</p>{snapshot.weekly_hours.length ? <ul>{snapshot.weekly_hours.map(day => <li key={day.weekday}><strong>{weekdays[day.weekday]}:</strong> {day.closed ? 'Closed' : day.intervals.length ? day.intervals.map(interval => `${clock(interval.start_minute)}–${clock(interval.end_minute)}`).join(', ') : 'Hours not set'}</li>)}</ul> : <p>Business hours have not been saved yet.</p>}<p>Request rules: {snapshot.booking ? 'Saved for office review' : 'Not saved yet'}.</p><p className="small">This is a weekly summary. Ask your owner or admin about date-specific changes before scheduling.</p></section> : <section className="panel"><h2>Your workspace access</h2><p className="notice">Your {snapshot.role} access does not include business setup. A workspace owner or admin manages these details.</p><p>You can continue using the dashboard and records available to your role. AI call and live booking readiness remain pending.</p></section>}
  </>;
}





