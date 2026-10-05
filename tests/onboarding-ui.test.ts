import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import type { OnboardingSnapshotResult, OwnerOnboardingSnapshot } from '@/lib/onboarding-contracts';
import { PENDING_ONBOARDING_READINESS } from '@/lib/onboarding-contracts';

const harness = vi.hoisted(() => ({ snapshot: vi.fn(), save: vi.fn(), progress: vi.fn(), refresh: vi.fn() }));
vi.mock('@/lib/server/onboarding-rpc', () => ({ getOnboardingSnapshot: harness.snapshot }));
vi.mock('@/app/actions/onboarding', () => ({ saveOnboardingConfiguration: harness.save, saveOnboardingProgress: harness.progress }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: harness.refresh }) }));
import Page from '@/app/workspaces/[tenantId]/onboarding/page';
import { BusinessProfileForm, ServicesForm, WeeklyHoursForm, HoursExceptionsForm, BookingPreferencesForm, EscalationContactsForm, ResumeStepForm, profileFeedback, resumeFeedback, resumeRequiresReview, submitBusinessProfile, submitResumeStep, submitSetupEditor, submitHoursException, setupEditorFeedback, exceptionFeedback, parseHoursTime } from '@/app/workspaces/[tenantId]/onboarding/onboarding-form';

const tenant = '10000000-0000-4000-8000-000000000001';
const values = { name: 'Fictional Service', trade: 'HVAC', timezone: 'America/New_York', business_contact_name: 'Fictional Operator', business_email: 'fictional@example.invalid', business_phone: null };
const owner: OwnerOnboardingSnapshot = { projection: 'owner_setup', workspace: { id: tenant, name: values.name, trade: values.trade, timezone: values.timezone }, flow_version: 'onboarding-v1', config_revision: 0, profile: values, services: [], weekly_hours: [], exceptions: [], booking: null, escalation: [], resume_step: 'profile', resume_version: 0, readiness: PENDING_ONBOARDING_READINESS };
async function render(result: OnboardingSnapshotResult) { harness.snapshot.mockResolvedValue(result); return renderToStaticMarkup(await Page({ params: Promise.resolve({ tenantId: tenant }) })); }
beforeEach(() => { vi.clearAllMocks(); });

describe('persisted resume marker without readiness changes', () => {
  const resume = { tenant_id: tenant, request_id: '40000000-0000-4000-8000-000000000001', expected_version: 3, step_id: 'hours' as const };
  it('renders owner/admin resume controls as progress-only copy without internal fields', async () => {
    const html = await render({ status: 'available', snapshot: { ...owner, resume_step: 'services', resume_version: 3 } });
    expect(html).toContain('Resume setup later');
    expect(html).toContain('Save resume point');
    expect(html).toContain('This saves only your own progress marker');
    expect(html).toContain('does not complete setup, change readiness, connect providers, issue invitations, create accounts or affect other users');
    expect(html).not.toMatch(/request_id|expected_version|resume_version|receipt|token|config_revision|Setup complete|Ready to launch|Provider connected|Production ready|Live booking enabled|100%/i);
  });
  it('saves the exact resume input shape and retries the same frozen request', async () => {
    harness.progress.mockResolvedValue({ result: { status: 'retryable_failure' }, refreshRequired: false });
    await submitResumeStep(resume); await submitResumeStep(resume);
    expect(harness.progress.mock.calls).toEqual([[resume], [resume]]);
    expect(harness.progress.mock.calls[0][0]).toBe(resume);
  });
  it('rejects invalid resume steps before transport', async () => {
    expect((await submitResumeStep({ ...resume, step_id: 'private' as never })).result.status).toBe('validation_error');
    expect(harness.progress).not.toHaveBeenCalled();
  });
  it('shows conflict and retryable copy as progress-only guidance', () => {
    expect(resumeFeedback({ status: 'conflict', reason: 'revision' })).toContain('Your selection is still shown');
    expect(resumeFeedback({ status: 'retryable_failure' })).toContain('Retry this same save');
    expect(resumeRequiresReview({ status: 'unavailable' })).toBe(true);
    expect(resumeFeedback({ status: 'saved', entity: 'resume', id: tenant, version: 4, config_revision: 0 })).toContain('only a progress marker');
    expect(resumeFeedback({ status: 'saved', entity: 'resume', id: tenant, version: 4, config_revision: 0 })).not.toMatch(/Setup complete|Ready to launch|Provider connected|Production ready|Live booking enabled|100%/i);
  });
  it('renders the resume form without request identity, versions or private contacts', () => {
    const html = renderToStaticMarkup(createElement(ResumeStepForm, { tenantId: tenant, version: 3, step: 'booking' }));
    expect(html).toContain('Request preferences');
    expect(html).toContain('Save resume point');
    expect(html).not.toMatch(/request_id|expected_version|version=|receipt|token|business_email|fictional@example.invalid|Fictional Operator/);
  });
  it.each(['dispatcher', 'technician', 'viewer'] as const)('keeps resume controls private for %s', async role => {
    const snapshot = role === 'dispatcher' ? { projection: 'dispatcher_operations' as const, workspace: owner.workspace, config_revision: 0, services: [], weekly_hours: [], exceptions: [], booking: null } : { projection: 'workspace' as const, workspace: { id: tenant, name: values.name }, role };
    const html = await render({ status: 'available', snapshot });
    expect(html).not.toMatch(/Resume setup later|Save resume point|This saves only your own progress marker|request_id|expected_version|resume_version|business_email|Fictional Operator/);
  });
});

describe('storage summary without readiness completion', () => {
  it('shows missing stored sections and links to every available editor', async () => {
    const html = await render({ status: 'available', snapshot: { ...owner, profile: null } });
    for (const missing of ['Business contact information not saved yet', 'No services saved', '0 of 7 days saved', 'No date-specific hours saved', 'Request preferences not saved yet', 'No escalation contacts saved']) expect(html).toContain(missing);
    for (const target of ['business-details', 'setup-services', 'setup-hours', 'setup-exceptions', 'setup-requests', 'setup-contacts']) {
      expect(html).toContain(`href="#${target}"`); expect(html).toContain(`id="${target}"`);
    }
    expect(html).toContain('Your next step:');
    expect(html).toContain('Required setup checks are awaiting review');
  });
  it('shows saved entries and incomplete fields without treating enabled blank entries as ready', async () => {
    const booking = { mode: 'request_only' as const, lead_time_minutes: 0, buffer_before_minutes: 0, buffer_after_minutes: null, horizon_days: null, notes: '', acknowledged: false };
    const snapshot = { ...owner, services: [{ id: tenant, version: 1, name: '', description: '', position: 0, enabled: true }], weekly_hours: Array.from({ length: 7 }, (_, weekday) => ({ weekday, closed: weekday !== 0, intervals: [] })), booking, escalation: [{ id: tenant, version: 1, label: '', contact_name: '', email: null, phone: null, position: 0, enabled: true }] };
    const html = await render({ status: 'available', snapshot });
    for (const text of ['1 services saved; 1 enabled', '1 services have no name', '7 of 7 days saved', '1 open days have no intervals', 'Request preferences saved', '2 optional timing preferences not set', '1 contacts saved; 1 enabled', '1 contacts are missing a name or both email and phone']) expect(html).toContain(text);
    expect(html).toContain('Blank optional fields and enabled items are stored choices, not readiness checks');
    expect(html).not.toMatch(/Setup complete|Ready to launch|Provider connected|Production ready|Live booking enabled|100%/i);
  });
  it('keeps fully populated saved information pending and blocked through Setup', async () => {
    const snapshot = { ...owner, services: [{ id: tenant, version: 1, name: 'Fictional service', description: '', position: 0, enabled: false }], weekly_hours: Array.from({ length: 7 }, (_, weekday) => ({ weekday, closed: true, intervals: [] })), booking: { mode: 'request_only' as const, lead_time_minutes: 0, buffer_before_minutes: 0, buffer_after_minutes: 0, horizon_days: 1, notes: '', acknowledged: true }, escalation: [{ id: tenant, version: 1, label: 'Synthetic office', contact_name: 'Fictional Operator', email: 'fictional@example.invalid', phone: null, position: 0, enabled: false }] };
    const html = await render({ status: 'available', snapshot });
    expect(html).toContain('All seven days have stored entries');
    expect(html).toContain('1 services saved; 0 enabled'); expect(html).toContain('1 contacts saved; 0 enabled');
    expect(html).toContain('0 optional timing preferences not set');
    expect(html).toContain('Readiness review is pending'); expect(html).toContain('Connection and verification are blocked through Setup');
    expect(html).toContain('Booking remains request-only'); expect(html).toContain('Production release:');
    expect(html).toContain('Separate verification and owner approval are required');
    expect(html).not.toMatch(/Setup complete|Ready to launch|Provider connected|Production ready|Live booking enabled|100%/i);
  });
  it.each(['technician', 'viewer'] as const)('keeps owner status and editor links private for %s', async role => {
    const html = await render({ status: 'available', snapshot: { projection: 'workspace', workspace: { id: tenant, name: values.name }, role } });
    expect(html).not.toMatch(/setup-section-status|setup-services|setup-contacts|contacts saved|business_email|<form/);
  });
  it('does not echo unexpected readiness diagnostics or raw internal fields', async () => {
    const snapshot = { ...owner, readiness: { ...PENDING_ONBOARDING_READINESS, diagnostic: 'private-readiness-sentinel' }, receipt: 'private-status-receipt-sentinel', token: 'private-status-token-sentinel' };
    const html = await render({ status: 'available', snapshot });
    expect(html).not.toMatch(/private-readiness-sentinel|private-status-receipt-sentinel|private-status-token-sentinel|setup_policy_pending|platform_operator|config_revision/);
  });
});

describe('role-safe rendered setup', () => {
  it('renders the owner/admin projection with labelled profile controls and pending-only readiness', async () => {
    const html = await render({ status: 'available', snapshot: owner });
    expect(harness.snapshot).toHaveBeenCalledWith(tenant);
    expect(html).toContain('Save business details');
    expect(html).toContain('Save services');
    expect(html).toContain('Save weekly hours');
    expect(html).toContain('Save date override');
    expect(html).toContain('Save request preferences');
    expect(html).toContain('Save escalation contacts');
    expect(html).toContain('Booking remains request-only');
    expect(html).toContain('Monday closed');
    expect(html).toContain('Sunday closed');
    expect(html).toContain('Business name');
    expect(html).toContain('Readiness review is pending');
    expect(html).toContain('Provider verification is pending');
    expect(html).toContain('0 of 7 days saved');
    expect(html).toContain('Return to dashboard');
    expect(html).not.toMatch(/Go live|Send invitation|Create account|Booking confirmed|Setup complete/);
    expect(html).not.toMatch(/receipt|request_id|token|hostedReady|config_revision|providerConnectionAuthorized/);
  });
  it('shows dispatcher operational information without private contact fields or mutation controls', async () => {
    const html = await render({ status: 'available', snapshot: { projection: 'dispatcher_operations', workspace: owner.workspace, config_revision: 0, services: [], weekly_hours: [], exceptions: [], booking: null } });
    expect(html).toContain('Office setup information');
    expect(html).toContain('No services have been saved');
    expect(html).not.toContain('<form');
    expect(html).not.toMatch(/Fictional Operator|fictional@example|Business email|Escalation contacts/);
  });
  it('does not spread unexpected private snapshot properties into markup', async () => {
    const snapshot = { ...owner, receipt: 'private-receipt-sentinel', token: 'private-token-sentinel', providerSecret: 'private-provider-sentinel' };
    const html = await render({ status: 'available', snapshot });
    expect(html).not.toMatch(/private-receipt-sentinel|private-token-sentinel|private-provider-sentinel/);
  });
  it.each(['technician', 'viewer'] as const)('keeps %s access minimal', async role => {
    const html = await render({ status: 'available', snapshot: { projection: 'workspace', workspace: { id: tenant, name: values.name }, role } });
    expect(html).toContain(`Your ${role} access`);
    expect(html).not.toMatch(/<form|business_email|Business hours|Contact name/);
    expect(html).toContain('Return to dashboard');
  });
  it.each(['unavailable', 'retryable_failure'] as const)('renders %s as a safe error, never an empty ready workspace', async status => {
    const html = await render({ status });
    expect(html).toContain('Setup is unavailable');
    expect(html).toContain('role="alert"');
    expect(html).toContain('Try again');
    expect(html).not.toContain('Save business details');
  });
  it('binds initial profile values to semantic form labels without serializing action metadata', () => {
    const html = renderToStaticMarkup(createElement(BusinessProfileForm, { tenantId: tenant, revision: 3, values }));
    expect(html).toContain('name="business_email"');
    expect(html).toContain('value="fictional@example.invalid"');
    expect(html).toContain('legend');
    expect(html).toContain('for=');
    expect(html).not.toMatch(/request_id|expected_config_revision|receipt|token/);
  });
});


describe('date-specific hours exception editor', () => {
  const request = { tenant_id: tenant, request_id: '50000000-0000-4000-8000-000000000001', expected_config_revision: 7 };
  const exception = { id: '50000000-0000-4000-8000-000000000010', date: '2026-12-24', closed: false, intervals: [{ start_minute: 540, end_minute: 720 }], active: true, version: 2 };
  it('renders owner/admin exception controls as local-date overrides without internal fields or readiness claims', async () => {
    const html = await render({ status: 'available', snapshot: { ...owner, config_revision: 7, exceptions: [{ ...exception, receipt: 'private-exception-receipt-sentinel' } as typeof exception] } });
    expect(html).toContain('Date-specific hours');
    expect(html).toContain('Save date override');
    expect(html).toContain('Remove date override');
    expect(html).toContain('Saved date overrides');
    expect(html).toContain('2026-12-24');
    expect(html).toContain('09:00–12:00');
    expect(html).toContain('America/New_York');
    expect(html).toContain('do not change weekly hours');
    expect(html).toContain('Removing a date with no saved override is safe');
    expect(html).not.toMatch(/private-exception-receipt-sentinel|request_id|expected_config_revision|config_revision|receipt|token|Booking confirmed|Calendar synced|Provider connected|Production ready|Live booking enabled/i);
  });
  it('submits upsert and remove with exact command payloads and preserves retry identity', async () => {
    harness.save.mockResolvedValue({ result: { status: 'retryable_failure' }, refreshRequired: false });
    const upsert = { ...request, payload: { date: '2026-12-24', closed: false, intervals: [{ start_minute: 540, end_minute: 720 }] } };
    const remove = { ...request, payload: { date: '2026-12-24' } };
    await submitHoursException('upsert_hours_exception', upsert); await submitHoursException('upsert_hours_exception', upsert);
    expect(harness.save.mock.calls).toEqual([['upsert_hours_exception', upsert], ['upsert_hours_exception', upsert]]);
    expect(harness.save.mock.calls[0][1]).toBe(upsert);
    harness.save.mockClear();
    await submitHoursException('remove_hours_exception', remove); await submitHoursException('remove_hours_exception', remove);
    expect(harness.save.mock.calls).toEqual([['remove_hours_exception', remove], ['remove_hours_exception', remove]]);
    expect(harness.save.mock.calls[0][1]).toBe(remove);
  });
  it.each([
    { date: '2026-02-30', closed: true, intervals: [] },
    { date: '2026-12-24', closed: true, intervals: [{ start_minute: 540, end_minute: 720 }] },
    { date: '2026-12-24', closed: false, intervals: [{ start_minute: 600, end_minute: 540 }] },
    { date: '2026-12-24', closed: false, intervals: [{ start_minute: 540, end_minute: 600 }, { start_minute: 599, end_minute: 660 }] },
    { date: '2026-12-24', closed: false, intervals: [{ start_minute: NaN, end_minute: 660 }] },
  ])('rejects invalid date or intervals before transport', async payload => {
    expect((await submitHoursException('upsert_hours_exception', { ...request, payload })).result.status).toBe('validation_error');
    expect(harness.save).not.toHaveBeenCalled();
  });
  it('rejects invalid remove dates before transport', async () => {
    expect((await submitHoursException('remove_hours_exception', { ...request, payload: { date: '2026-13-01' } })).result.status).toBe('validation_error');
    expect(harness.save).not.toHaveBeenCalled();
  });
  it('uses truthful conflict, retry and removal copy without booking/provider promises', () => {
    expect(exceptionFeedback({ status: 'conflict', reason: 'revision' })).toContain('Your edits are still shown');
    expect(exceptionFeedback({ status: 'retryable_failure' }, 'upsert_hours_exception')).toContain('Retry this same date override save');
    expect(exceptionFeedback({ status: 'retryable_failure' }, 'remove_hours_exception')).toContain('Retry this same date override removal');
    expect(exceptionFeedback({ status: 'saved', entity: 'exception', id: tenant, version: 1, config_revision: 8 }, 'remove_hours_exception')).toContain('no appointment effect');
    expect(exceptionFeedback({ status: 'saved', entity: 'exception', id: tenant, version: 1, config_revision: 8 })).not.toMatch(/Booking confirmed|Calendar synced|Provider connected|Production ready|Live booking enabled/i);
  });
  it('renders the form without leaking request identity, revisions, receipts or private contact details', () => {
    const html = renderToStaticMarkup(createElement(HoursExceptionsForm, { tenantId: tenant, revision: 7, timezone: 'America/New_York', values: { items: [exception] } }));
    expect(html).toContain('Edit 2026-12-24');
    expect(html).toContain('Save date override');
    expect(html).toContain('Remove date override');
    expect(html).not.toMatch(/request_id|expected_config_revision|config_revision|version=|receipt|token|business_email|fictional@example.invalid|Fictional Operator|Booking confirmed|Calendar synced|Provider connected|Production ready|Live booking enabled/i);
  });
  it.each(['dispatcher', 'technician', 'viewer'] as const)('keeps exception controls private for %s', async role => {
    const snapshot = role === 'dispatcher' ? { projection: 'dispatcher_operations' as const, workspace: owner.workspace, config_revision: 7, services: [], weekly_hours: [], exceptions: [exception], booking: null } : { projection: 'workspace' as const, workspace: { id: tenant, name: values.name }, role };
    const html = await render({ status: 'available', snapshot });
    expect(html).not.toMatch(/Save date override|Remove date override|Saved date overrides|request_id|expected_config_revision|private-exception|business_email|Fictional Operator/);
  });
});

describe('services and seven-day hours editors', () => {
  const request = { tenant_id: tenant, request_id: '20000000-0000-4000-8000-000000000002', expected_config_revision: 4 };
  const service = { id: null, name: 'Fictional heating maintenance', description: 'Synthetic service only', enabled: true, position: 0 };
  const days = Array.from({ length: 7 }, (_, weekday) => ({ weekday, closed: weekday !== 0, intervals: weekday === 0 ? [{ start_minute: 540, end_minute: 1020 }] : [] }));
  it.each(['replace_services', 'replace_weekly_hours'] as const)('wires %s to the exact accepted action and unchanged retry input', async command => {
    harness.save.mockResolvedValue({ result: { status: 'retryable_failure' }, refreshRequired: false });
    const input = command === 'replace_services' ? { ...request, payload: { items: [service] } } : { ...request, payload: { days } };
    await submitSetupEditor(command, input); await submitSetupEditor(command, input);
    expect(harness.save.mock.calls).toEqual([[command, input], [command, input]]);
    expect(harness.save.mock.calls[0][1]).toBe(input);
  });
  it('renders service name, description, enabled and bounded position controls without private fields', () => {
    const html = renderToStaticMarkup(createElement(ServicesForm, { tenantId: tenant, revision: 4, values: { items: [service] } }));
    expect(html).toContain('Service 1 name'); expect(html).toContain('Service 1 description');
    expect(html).toContain('Enable service 1'); expect(html).toContain('position (0–9999)');
    expect(html).toContain('Remove service 1'); expect(html).toContain('Add service');
    expect(html).toContain('Synthetic service only'); expect(html).toContain('type="checkbox"');
    expect(html).not.toMatch(/request_id|receipt|token|expected_config_revision/);
  });
  it('renders seven labelled days, multiple intervals, end-of-day time and timezone', () => {
    const html = renderToStaticMarkup(createElement(WeeklyHoursForm, { tenantId: tenant, revision: 4, timezone: 'America/New_York', values: { days: days.map(day => day.weekday === 0 ? { ...day, intervals: [{ start_minute: 0, end_minute: 600 }, { start_minute: 660, end_minute: 1440 }] } : day) } }));
    for (const name of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) expect(html).toContain(`${name} closed`);
    expect(html).toContain('Monday interval 2 end'); expect(html).toContain('value="24:00"');
    expect(html).toContain('America/New_York'); expect(html).toContain('does not reserve appointments');
    expect(html).toContain('for='); expect(html).toContain('legend');
  });
  it('strips unexpected nested service/hour properties before passing page props', async () => {
    const html = await render({ status: 'available', snapshot: { ...owner, services: [{ ...service, id: tenant, version: 1, receipt: 'private-service-sentinel' }], weekly_hours: [{ weekday: 0, closed: false, intervals: [{ start_minute: 540, end_minute: 1020, secret: 'private-hours-sentinel' }] }] } } as unknown as OnboardingSnapshotResult);
    expect(html).not.toMatch(/private-service-sentinel|private-hours-sentinel/);
    expect(html).toContain('Fictional heating maintenance');
    expect(html).toContain('Sunday closed');
  });
  it.each([
    { ...service, name: '😀'.repeat(121) },
    { ...service, description: 'x'.repeat(2001) },
    { ...service, position: -1 },
    { ...service, position: 1.5 },
  ])('rejects invalid service input before transport', async invalid => {
    expect((await submitSetupEditor('replace_services', { ...request, payload: { items: [invalid] } })).result.status).toBe('validation_error');
    expect(harness.save).not.toHaveBeenCalled();
  });
  it('permits intentionally empty service lists', async () => {
    harness.save.mockResolvedValue({ result: { status: 'saved', entity: 'setup', id: tenant, version: 1, config_revision: 5 }, refreshRequired: false });
    await submitSetupEditor('replace_services', { ...request, payload: { items: [] } });
    expect(harness.save).toHaveBeenCalledOnce();
  });
  it.each([
    days.slice(0, 6),
    days.map(day => ({ ...day, weekday: 0 })),
    days.map(day => day.weekday === 0 ? { ...day, intervals: [{ start_minute: 540, end_minute: 600 }, { start_minute: 599, end_minute: 660 }] } : day),
    days.map(day => day.weekday === 0 ? { ...day, closed: true } : day),
    days.map(day => day.weekday === 0 ? { ...day, intervals: [{ start_minute: 1440, end_minute: 540 }] } : day),
    days.map(day => day.weekday === 0 ? { ...day, intervals: [{ start_minute: NaN, end_minute: 540 }] } : day),
  ].map(invalid => [invalid]))('rejects missing/duplicate days and invalid intervals before transport', async invalid => {
    expect((await submitSetupEditor('replace_weekly_hours', { ...request, payload: { days: invalid } })).result.status).toBe('validation_error');
    expect(harness.save).not.toHaveBeenCalled();
  });
  it('supports adjacent intervals and end-of-day midnight', async () => {
    harness.save.mockResolvedValue({ result: { status: 'saved', entity: 'setup', id: tenant, version: 1, config_revision: 5 }, refreshRequired: false });
    await submitSetupEditor('replace_weekly_hours', { ...request, payload: { days: days.map(day => day.weekday === 0 ? { ...day, intervals: [{ start_minute: 0, end_minute: 600 }, { start_minute: 600, end_minute: 1440 }] } : day) } });
    expect(harness.save).toHaveBeenCalledOnce();
  });
  it('parses strict time entry without accepting partial or normalized invalid times', () => {
    expect(parseHoursTime('00:00')).toBe(0); expect(parseHoursTime('24:00')).toBe(1440);
    for (const invalid of ['', '9:00', '12:60', '24:01', '09:', ' 09:00']) expect(parseHoursTime(invalid)).toBeNaN();
  });
  it('uses retained-input and pending-readiness copy for editor outcomes', () => {
    expect(setupEditorFeedback({ status: 'retryable_failure' })).toContain('Retry this save');
    expect(setupEditorFeedback({ status: 'conflict', reason: 'revision' })).toContain('Your edits are still shown');
    expect(setupEditorFeedback({ status: 'saved', entity: 'setup', id: tenant, version: 1, config_revision: 5 })).toContain('does not enable live bookings');
  });
});

describe('accepted action wiring and truthful feedback', () => {
  const input = { tenant_id: tenant, request_id: '20000000-0000-4000-8000-000000000001', expected_config_revision: 0, payload: values };
  it('calls only business-profile configuration and preserves exact retry identity/precondition', async () => {
    harness.save.mockResolvedValue({ result: { status: 'saved', entity: 'setup', id: tenant, version: 1, config_revision: 1 }, refreshRequired: false });
    await submitBusinessProfile(input); await submitBusinessProfile(input);
    expect(harness.save.mock.calls).toEqual([['save_business_profile', input], ['save_business_profile', input]]);
  });
  it('rejects invalid authority without making a Server Action call', async () => {
    const result = await submitBusinessProfile({ ...input, payload: { ...values, name: '' } });
    expect(result.result.status).toBe('validation_error');
    expect(harness.save).not.toHaveBeenCalled();
  });
  it('allows blank optional contacts while retaining required business authority', async () => {
    harness.save.mockResolvedValue({ result: { status: 'retryable_failure' }, refreshRequired: false });
    await submitBusinessProfile({ ...input, payload: { ...values, business_contact_name: '', business_email: null } });
    expect(harness.save).toHaveBeenCalledOnce();
  });
  it('rejects Unicode code-point overflow before transport', async () => {
    expect((await submitBusinessProfile({ ...input, payload: { ...values, name: '😀'.repeat(161) } })).result.status).toBe('validation_error');
    expect(harness.save).not.toHaveBeenCalled();
  });
  it('differentiates replay/conflict/uncertain results without false ready/success copy', () => {
    expect(profileFeedback({ status: 'retryable_failure' })).toContain('Retry this save');
    expect(profileFeedback({ status: 'conflict', reason: 'revision' })).toContain('Your edits are still shown');
    expect(profileFeedback({ status: 'replayed', entity: 'setup', id: tenant, version: 1, config_revision: 1 })).toContain('earlier save');
    expect(profileFeedback({ status: 'saved', entity: 'setup', id: tenant, version: 1, config_revision: 1 })).toContain('Readiness review remains pending');
  });
});

describe('request preferences and owner-only escalation contacts', () => {
  const request = { tenant_id: tenant, request_id: '30000000-0000-4000-8000-000000000001', expected_config_revision: 4 };
  const booking = { lead_time_minutes: null, buffer_before_minutes: 0, buffer_after_minutes: 30, horizon_days: 7, notes: 'Fictional office review instructions', acknowledged: false };
  const contact = { id: null, label: 'Fictional office', contact_name: 'Synthetic Operator', email: 'fictional@example.invalid', phone: null, enabled: true, position: 0 };
  it.each(['save_booking_preferences', 'replace_escalation_contacts'] as const)('dispatches %s with the unchanged accepted request for retry', async command => {
    harness.save.mockResolvedValue({ result: { status: 'retryable_failure' }, refreshRequired: false });
    const input = command === 'save_booking_preferences' ? { ...request, payload: booking } : { ...request, payload: { items: [contact] } };
    await submitSetupEditor(command, input); await submitSetupEditor(command, input);
    expect(harness.save.mock.calls).toEqual([[command, input], [command, input]]);
    expect(harness.save.mock.calls[0][1]).toBe(input);
  });
  it('renders all preference controls, optional blank numbers and truthful request-only copy', () => {
    const html = renderToStaticMarkup(createElement(BookingPreferencesForm, { tenantId: tenant, revision: 4, values: booking, saved: false }));
    for (const label of ['Advance notice', 'Time before an appointment', 'Time after an appointment', 'How far ahead', 'Request review notes', 'Save request preferences']) expect(html).toContain(label);
    expect(html).toContain('No request preferences saved yet');
    expect(html).toContain('Booking remains request-only'); expect(html).toContain('live booking readiness remain pending');
    expect(html).toContain('does not check availability'); expect(html).toContain('send reminders');
    expect(html).toContain('type="checkbox"'); expect(html).toContain('Fictional office review instructions');
    expect(html).not.toMatch(/expected_config_revision|request_id|mode=|receipt|token|Go live|Booking confirmed/);
  });
  it('renders contact labels, optional details and enable/order controls without handoff promises', () => {
    const html = renderToStaticMarkup(createElement(EscalationContactsForm, { tenantId: tenant, revision: 4, values: { items: [contact] } }));
    for (const label of ['Contact 1 purpose or team', 'Contact 1 contact name', 'Contact 1 email', 'Contact 1 phone', 'Contact 1 position', 'Enable escalation contact 1', 'Remove escalation contact 1']) expect(html).toContain(label);
    expect(html).toContain('fictional@example.invalid'); expect(html).toContain('does not send a message');
    expect(html).toContain('Provider verification remains pending'); expect(html).toContain('for='); expect(html).toContain('legend');
    expect(html).not.toMatch(/expected_config_revision|request_id|receipt|token/);
  });
  it('does not expose owner contact sentinels or mutation controls to a dispatcher even with unexpected private properties', async () => {
    const snapshot = { projection: 'dispatcher_operations' as const, workspace: owner.workspace, config_revision: 4, services: [], weekly_hours: [], exceptions: [], booking: { ...booking, mode: 'request_only' as const }, escalation: [{ ...contact, contact_name: 'private-owner-contact-sentinel', email: 'private-email-sentinel' }] };
    const html = await render({ status: 'available', snapshot });
    expect(html).toContain('Office setup information');
    expect(html).not.toMatch(/private-owner-contact-sentinel|private-email-sentinel|Escalation contacts|Save request preferences|Save escalation contacts|<form/);
  });
  it('projects owner booking/contact values without unexpected private sentinels', async () => {
    const snapshot = { ...owner, booking: { ...booking, mode: 'request_only' as const, receipt: 'private-booking-receipt-sentinel' }, escalation: [{ ...contact, id: tenant, version: 1, token: 'private-contact-token-sentinel' }] };
    const html = await render({ status: 'available', snapshot });
    expect(html).toContain('Synthetic Operator');
    expect(html).not.toMatch(/private-booking-receipt-sentinel|private-contact-token-sentinel/);
  });
  it.each([
    { ...booking, lead_time_minutes: -1 }, { ...booking, lead_time_minutes: 525601 },
    { ...booking, buffer_before_minutes: 1441 }, { ...booking, buffer_after_minutes: 0.5 },
    { ...booking, horizon_days: 0 }, { ...booking, horizon_days: 731 },
    { ...booking, notes: '😀'.repeat(2001) },
  ])('rejects invalid request preferences before action dispatch', async invalid => {
    expect((await submitSetupEditor('save_booking_preferences', { ...request, payload: invalid })).result.status).toBe('validation_error');
    expect(harness.save).not.toHaveBeenCalled();
  });
  it.each([
    { ...contact, email: 'invalid email' }, { ...contact, phone: '555-0100' },
    { ...contact, label: '😀'.repeat(121) }, { ...contact, contact_name: 'x'.repeat(161) },
    { ...contact, position: -1 },
  ])('rejects invalid escalation details before action dispatch', async invalid => {
    expect((await submitSetupEditor('replace_escalation_contacts', { ...request, payload: { items: [invalid] } })).result.status).toBe('validation_error');
    expect(harness.save).not.toHaveBeenCalled();
  });
  it('rejects oversized and duplicate-ID contact lists before dispatch', async () => {
    expect((await submitSetupEditor('replace_escalation_contacts', { ...request, payload: { items: Array.from({ length: 21 }, () => contact) } })).result.status).toBe('validation_error');
    expect((await submitSetupEditor('replace_escalation_contacts', { ...request, payload: { items: [{ ...contact, id: tenant }, { ...contact, id: tenant }] } })).result.status).toBe('validation_error');
    expect(harness.save).not.toHaveBeenCalled();
  });
  it('accepts blank optional preferences/contacts and intentional empty-list replacement', async () => {
    harness.save.mockResolvedValue({ result: { status: 'saved', entity: 'setup', id: tenant, version: 1, config_revision: 5 }, refreshRequired: false });
    await submitSetupEditor('save_booking_preferences', { ...request, payload: { lead_time_minutes: null, buffer_before_minutes: null, buffer_after_minutes: null, horizon_days: null, notes: '', acknowledged: false } });
    await submitSetupEditor('replace_escalation_contacts', { ...request, payload: { items: [{ ...contact, email: null, phone: null, enabled: false, label: '', contact_name: '' }] } });
    await submitSetupEditor('replace_escalation_contacts', { ...request, payload: { items: [] } });
    expect(harness.save).toHaveBeenCalledTimes(3);
  });
});


