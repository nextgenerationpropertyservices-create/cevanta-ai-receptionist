'use client';

import { useId, useRef, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboardingConfiguration, saveOnboardingProgress } from '@/app/actions/onboarding';
import { ONBOARDING_STEPS, ONBOARDING_TIMEZONES } from '@/lib/onboarding-contracts';
import { validateConfiguration, validateResume } from '@/lib/onboarding-validation';
import type { ConfigurationInput, ConfigurationPayloads, ConfigurationResult, ServiceInput, HoursDay, EscalationInput, OnboardingStep, ResumeInput, SavedHoursException } from '@/lib/onboarding-contracts';

type Profile = ConfigurationPayloads['save_business_profile'];
type Attempt = ConfigurationInput<'save_business_profile'>;
const labels: Record<keyof Profile, string> = { name: 'Business name', trade: 'Trade', timezone: 'Business time zone', business_contact_name: 'Contact name', business_email: 'Business email', business_phone: 'Business phone' };

export function profileFeedback(result: ConfigurationResult): string {
  switch (result.status) {
    case 'saved': return 'Business details saved. Readiness review remains pending.';
    case 'replayed': return 'Your earlier save is confirmed. Review the latest saved details before editing again.';
    case 'validation_error': return 'Check the highlighted fields. Your edits are still shown.';
    case 'conflict': return result.reason === 'version_exhausted' ? 'These details cannot accept more changes. Ask your administrator for help.' : 'Setup information changed or this save request was already used. Review the latest saved details before trying again. Your edits are still shown.';
    case 'unavailable': return 'Your workspace access may have changed. Check your account before trying again.';
    default: return 'We could not confirm the save. Your edits are still shown. Retry this save before starting a different one.';
  }
}

export async function submitBusinessProfile(input: Attempt) {
  const checked = validateConfiguration('save_business_profile', input);
  if (!checked.ok) return { result: { status: 'validation_error' as const, issues: checked.issues }, refreshRequired: false };
  return saveOnboardingConfiguration('save_business_profile', input);
}

export function RefreshSetupButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button className="button secondary" type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? 'Loading setup…' : 'Try again'}</button>;
}

const resumeLabels: Record<OnboardingStep, string> = {
  access: 'Access',
  profile: 'Business details',
  services: 'Services',
  hours: 'Weekly hours',
  booking: 'Request preferences',
  escalation: 'Escalation contacts',
  integrations: 'Integrations',
  review: 'Readiness review',
};

export function resumeFeedback(result: ConfigurationResult): string {
  switch (result.status) {
    case 'saved': return 'Resume point saved. This is only a progress marker; setup readiness, providers, live booking and production release remain pending.';
    case 'replayed': return 'Your earlier resume point save is confirmed. Review the latest saved progress before changing it again.';
    case 'validation_error': return 'Choose a setup section and try again. Your selection is still shown.';
    case 'conflict': return result.reason === 'version_exhausted' ? 'Progress cannot accept more changes. Ask your administrator for help.' : 'Your saved progress changed or this save request was already used. Review the latest saved progress before trying again. Your selection is still shown.';
    case 'unavailable': return 'Your workspace access may have changed. Refresh and review Setup before trying again.';
    default: return 'We could not confirm this progress save. Retry this same save before choosing a different section.';
  }
}

export function resumeRequiresReview(result: ConfigurationResult | null): boolean {
  return !!result && ['saved', 'replayed', 'conflict', 'unavailable'].includes(result.status);
}

export async function submitResumeStep(input: ResumeInput) {
  const checked = validateResume(input);
  if (!checked.ok) return { result: { status: 'validation_error' as const, issues: checked.issues }, refreshRequired: false };
  return saveOnboardingProgress(input);
}

export function ResumeStepForm({ tenantId, version, step }: { tenantId: string; version: number; step: OnboardingStep }) {
  const router = useRouter();
  const id = useId();
  const [selected, setSelected] = useState<OnboardingStep>(step);
  const [baseline, setBaseline] = useState({ version, step });
  const [result, setResult] = useState<ConfigurationResult | null>(null);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const attempt = useRef<ResumeInput | null>(null);
  const uncertain = result?.status === 'retryable_failure';
  const stopped = resumeRequiresReview(result);
  const refreshed = version !== baseline.version || step !== baseline.step;
  const locked = pending || uncertain || stopped;

  function save() {
    if (busy.current || (stopped && !uncertain)) return;
    if (!uncertain && version !== baseline.version) {
      setResult({ status: 'conflict', reason: 'revision' });
      setMessage('Your saved progress changed. Review the latest saved progress before trying again. Your selection is still shown.');
      return;
    }
    busy.current = true;
    if (!attempt.current) attempt.current = { tenant_id: tenantId, request_id: crypto.randomUUID(), expected_version: baseline.version, step_id: selected };
    const original = attempt.current;
    startTransition(async () => {
      try {
        const response = await submitResumeStep(original);
        setResult(response.result);
        setMessage(resumeFeedback(response.result));
        if (response.result.status === 'validation_error') attempt.current = null;
        if (response.result.status === 'saved' || response.result.status === 'replayed') router.refresh();
      } catch {
        setResult({ status: 'retryable_failure' });
        setMessage(resumeFeedback({ status: 'retryable_failure' }));
      } finally {
        busy.current = false;
      }
    });
  }

  function reviewLatest(keepSelection: boolean) {
    if (!keepSelection) setSelected(step);
    setBaseline({ version, step });
    attempt.current = null;
    setResult(null);
    setMessage(keepSelection ? 'Latest saved progress reviewed. Your selection is still shown and has not been saved.' : 'Latest saved progress loaded. You can choose where to resume next.');
  }

  return <>
    <p>Choose where you want to pick up Setup next time. This saves only your own progress marker.</p>
    <p className="notice">Saved progress does not complete setup, change readiness, connect providers, issue invitations, create accounts or affect other users.</p>
    <form className="form setup-editor" aria-busy={pending} onSubmit={event => { event.preventDefault(); if (!locked) save(); }}>
      <fieldset disabled={locked}><legend className="visually-hidden">Resume setup later</legend>
        <label className="field" htmlFor={`${id}-resume-step`}><span>Resume from</span><select id={`${id}-resume-step`} value={selected} onChange={event => setSelected(event.target.value as OnboardingStep)}>{ONBOARDING_STEPS.map(item => <option key={item} value={item}>{resumeLabels[item]}</option>)}</select></label>
        <button className="button" type="submit">{pending ? 'Saving…' : 'Save resume point'}</button>
      </fieldset>
      <div aria-live="polite" role={result && !['saved', 'replayed'].includes(result.status) ? 'alert' : 'status'}>{message && <p className={result && !['saved', 'replayed'].includes(result.status) ? 'form-error' : 'notice'}>{message}</p>}</div>
    </form>
    {uncertain && <button className="button" type="button" disabled={pending} onClick={save}>{pending ? 'Retrying…' : 'Retry same progress save'}</button>}
    {stopped && <section className="onboarding-review" aria-labelledby={`${id}-review`}><h3 id={`${id}-review`}>Latest saved progress</h3><p>{result?.status === 'unavailable' ? 'Refresh and review Setup before trying again. Your selection is still shown above.' : 'Refresh and review your saved progress before saving another resume point.'}</p><button className="button secondary" type="button" onClick={() => router.refresh()}>Refresh saved progress</button><p>Current saved resume point: {resumeLabels[step]}.</p>{result?.status === 'conflict' && result.reason === 'version_exhausted' ? <p>Ask your administrator for help before making more progress changes.</p> : result?.status === 'unavailable' ? <p className="small">If this does not refresh, return to the dashboard and reopen Setup before trying again.</p> : refreshed ? <div className="button-row"><button className="button secondary" type="button" onClick={() => reviewLatest(false)}>Use saved progress</button>{result?.status === 'conflict' && <button className="button" type="button" onClick={() => reviewLatest(true)}>Keep my selection after review</button>}</div> : <p className="small">If this does not refresh, return to the dashboard and reopen Setup.</p>}</section>}
  </>;
}

export function BusinessProfileForm({ tenantId, revision, values }: { tenantId: string; revision: number; values: Profile }) {
  const router = useRouter();
  const id = useId();
  const [draft, setDraft] = useState(values);
  const [snapshotAtAttempt, setSnapshotAtAttempt] = useState(values);
  const [baseRevision, setBaseRevision] = useState(revision);
  const [result, setResult] = useState<ConfigurationResult | null>(null);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const attempt = useRef<Attempt | null>(null);
  const busy = useRef(false);
  const uncertain = result?.status === 'retryable_failure';
  const stopped = result?.status === 'saved' || result?.status === 'replayed' || result?.status === 'conflict' || result?.status === 'unavailable';
  const validationFields = result?.status === 'validation_error' ? new Set(result.issues.map(issue => issue.field.replace(/^payload\./, ''))) : new Set<string>();

  async function save() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      if (!attempt.current) attempt.current = { tenant_id: tenantId, request_id: crypto.randomUUID(), expected_config_revision: baseRevision, payload: { ...draft } };
      const response = await submitBusinessProfile(attempt.current);
      setResult(response.result);
      setMessage(profileFeedback(response.result));
      if (response.result.status === 'validation_error') attempt.current = null;
      if (response.result.status === 'saved' || response.result.status === 'replayed') router.refresh();
    } catch {
      setResult({ status: 'retryable_failure' });
      setMessage('We could not confirm the save. Retry this save before starting a different one. Your edits are still shown.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  function resumeEditing(keepEdits: boolean) {
    if (!keepEdits) setDraft(values);
    setBaseRevision(revision);
    setSnapshotAtAttempt(values);
    attempt.current = null;
    setResult(null);
    setMessage(keepEdits ? 'Latest saved details reviewed. Your edits are still shown and have not been saved.' : 'Latest saved details loaded. You can edit them now.');
  }

  return <>
    <p>Business name, trade and time zone are required. Contact information can be added later. For a phone number, include the country code starting with +, followed by digits only.</p>
    <form className="form onboarding-profile" onSubmit={event => { event.preventDefault(); if (!stopped && !uncertain) void save(); }} aria-busy={pending}>
      <fieldset disabled={pending || stopped || uncertain}><legend className="visually-hidden">Business profile</legend>
        {(Object.keys(labels) as (keyof Profile)[]).map(field => <label className="field" key={field} htmlFor={`${id}-${field}`}><span>{labels[field]}{['name', 'trade', 'timezone'].includes(field) ? ' *' : ' (optional)'}</span>{field === 'timezone' ? <select id={`${id}-${field}`} name={field} value={draft[field]} onChange={event => setDraft({ ...draft, [field]: event.target.value })} required aria-invalid={validationFields.has(field)} aria-describedby={`${id}-${field}-hint`}><option value="" disabled>Choose a time zone</option>{!ONBOARDING_TIMEZONES.includes(draft.timezone) && draft.timezone && <option value={draft.timezone} disabled>Current time zone needs correction</option>}{ONBOARDING_TIMEZONES.map(zone => <option key={zone} value={zone}>{zone.replaceAll('_', ' ')}</option>)}</select> : <input id={`${id}-${field}`} name={field} type={field === 'business_email' ? 'email' : field === 'business_phone' ? 'tel' : 'text'} value={draft[field] ?? ''} required={field === 'name' || field === 'trade'} onChange={event => setDraft({ ...draft, [field]: event.target.value })} aria-invalid={validationFields.has(field)} aria-describedby={validationFields.has(field) ? `${id}-${field}-hint` : undefined}/>} {(field === 'timezone' || validationFields.has(field)) && <small id={`${id}-${field}-hint`}>{validationFields.has(field) ? `Check ${labels[field].toLowerCase()}; this value could not be saved.` : 'Choose the time zone used by your business. This does not change the calendar’s UTC display.'}</small>}</label>)}
        <button className="button" type="submit">{pending ? 'Saving…' : 'Save business details'}</button>
      </fieldset>
      <div aria-live="polite" role={result && !['saved', 'replayed'].includes(result.status) ? 'alert' : 'status'}>{message && <p className={result && !['saved', 'replayed'].includes(result.status) ? 'form-error' : 'notice'}>{message}</p>}</div>
    </form>
    {uncertain && <button className="button" type="button" disabled={pending} onClick={() => void save()}>{pending ? 'Retrying…' : 'Retry this save'}</button>}
    {stopped && result?.status !== 'unavailable' && <section className="onboarding-review" aria-labelledby={`${id}-review`}><h3 id={`${id}-review`}>Latest saved details</h3><p>Refresh these details before continuing. Your unsaved edits remain in the form above.</p><button className="button secondary" type="button" onClick={() => router.refresh()}>Refresh saved details</button><dl>{(Object.keys(labels) as (keyof Profile)[]).map(field => <div key={field}><dt>{labels[field]}</dt><dd>{values[field] || 'Not added'}</dd></div>)}</dl>{revision !== baseRevision || values !== snapshotAtAttempt ? <div className="button-row"><button className="button secondary" type="button" onClick={() => resumeEditing(false)}>Use saved details</button>{result?.status === 'conflict' && result.reason !== 'version_exhausted' && <button className="button" type="button" onClick={() => resumeEditing(true)}>Keep my edits after review</button>}</div> : <p className="small">If these details do not refresh, return to the dashboard and reopen Setup. Keep a copy of any unsaved changes before leaving.</p>}</section>}
  </>;
}

type EditorCommand = 'replace_services' | 'replace_weekly_hours' | 'save_booking_preferences' | 'replace_escalation_contacts';
export async function submitSetupEditor<C extends EditorCommand>(command: C, input: ConfigurationInput<C>) {
  const checked = validateConfiguration(command, input);
  if (!checked.ok) return { result: { status: 'validation_error' as const, issues: checked.issues }, refreshRequired: false };
  return saveOnboardingConfiguration(command, input);
}

export function setupEditorFeedback(result: ConfigurationResult): string {
  if (result.status === 'saved') return 'Setup information saved. Readiness review remains pending. Saving does not enable live bookings.';
  return profileFeedback(result);
}

function useSetupEditor<C extends EditorCommand>(command: C, tenantId: string, revision: number, values: ConfigurationPayloads[C], prepare: (values: ConfigurationPayloads[C]) => ConfigurationPayloads[C] = value => value) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => prepare(values));
  const [baseline, setBaseline] = useState({ revision, values });
  const [result, setResult] = useState<ConfigurationResult | null>(null);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const attempt = useRef<ConfigurationInput<C> | null>(null);
  const busy = useRef(false);
  const uncertain = result?.status === 'retryable_failure';
  const stopped = !!result && ['saved', 'replayed', 'conflict', 'unavailable'].includes(result.status);
  function save() {
    if (busy.current || (stopped && !uncertain)) return;
    if (!uncertain && revision !== baseline.revision) {
      setResult({ status: 'conflict', reason: 'revision' });
      setMessage('Setup information changed. Review the latest saved information below. Your edits remain unsaved.');
      return;
    }
    busy.current = true;
    // Snapshot once: edits, array membership and revision cannot change during a retry.
    if (!attempt.current) attempt.current = { tenant_id: tenantId, request_id: crypto.randomUUID(), expected_config_revision: baseline.revision, payload: structuredClone(draft) };
    const original = attempt.current;
    startTransition(async () => {
      let confirmed = false;
      try {
        const response = await submitSetupEditor(command, original);
        confirmed = response.result.status === 'saved' || response.result.status === 'replayed';
        setResult(response.result);
        setMessage(setupEditorFeedback(response.result));
        if (response.result.status === 'validation_error') attempt.current = null;
        if (confirmed) router.refresh();
      } catch {
        if (confirmed) setMessage('Your save is confirmed. Refresh saved information before editing again. Readiness review remains pending.');
        else { setResult({ status: 'retryable_failure' }); setMessage(setupEditorFeedback({ status: 'retryable_failure' })); }
      } finally { busy.current = false; }
    });
  }
  function resume(keepEdits: boolean) {
    if (!keepEdits) setDraft(prepare(values));
    setBaseline({ revision, values });
    attempt.current = null;
    setResult(null);
    setMessage(keepEdits ? 'Latest saved information reviewed. Your edits remain unsaved.' : 'Latest saved information loaded. You can edit now.');
  }
  const invalid = (path: string) => result?.status === 'validation_error' && result.issues.some(issue => issue.field === path || issue.field.startsWith(`${path}.`));
  return { draft, setDraft, result, message, pending, uncertain, stopped, locked: pending || uncertain || stopped, save, resume, invalid, refresh: () => router.refresh(), refreshed: revision !== baseline.revision || values !== baseline.values };
}

function EditorOutcome({ editor, latest }: { editor: Pick<ReturnType<typeof useSetupEditor>, 'result' | 'message' | 'uncertain' | 'pending' | 'stopped' | 'save' | 'refresh' | 'refreshed' | 'resume'>; latest: ReactNode }) {
  const id = useId();
  return <>
    <div aria-live="polite" role={editor.result && !['saved', 'replayed'].includes(editor.result.status) ? 'alert' : 'status'}>{editor.message && <p className="notice">{editor.message}</p>}</div>
    {editor.uncertain && <button className="button" type="button" disabled={editor.pending} onClick={editor.save}>{editor.pending ? 'Retrying…' : 'Retry this save'}</button>}
    {editor.stopped && editor.result?.status !== 'unavailable' && <section className="onboarding-review" aria-labelledby={`${id}-review`}><h3 id={`${id}-review`}>Latest saved information</h3><p>Your edits remain above. Refresh and review the saved information before continuing.</p><button className="button secondary" type="button" onClick={editor.refresh}>Refresh saved information</button>{latest}{editor.result?.status === 'conflict' && editor.result.reason === 'version_exhausted' ? <p>Ask your administrator for help before making more changes.</p> : editor.refreshed ? <div className="button-row"><button className="button secondary" type="button" onClick={() => editor.resume(false)}>Use saved information</button>{editor.result?.status === 'conflict' && <button className="button" type="button" onClick={() => editor.resume(true)}>Keep my edits after review</button>}</div> : <p>Wait for refreshed information. Keep a copy of unsaved edits before leaving Setup.</p>}</section>}
  </>;
}

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
function prepareHours(values: { days: HoursDay[] }): { days: HoursDay[] } {
  return { days: dayNames.map((_, weekday) => {
    const day = values.days.find(item => item.weekday === weekday);
    return day ?? { weekday, closed: true, intervals: [] };
  }) };
}
const clockValue = (minute: number) => Number.isInteger(minute) ? `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}` : '';
export function parseHoursTime(value: string): number {
  if (!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(value) && value !== '24:00') return NaN;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function HoursTimeInput({ minute, onChange, ...props }: Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & { minute: number; onChange: (minute: number) => void }) {
  const [text, setText] = useState(clockValue(minute));
  const [previousMinute, setPreviousMinute] = useState(minute);
  // Retain partial/invalid typing, but accept explicit saved-value replacement.
  if (!Object.is(previousMinute, minute)) {
    setPreviousMinute(minute);
    setText(clockValue(minute));
  }
  return <input {...props} value={text} onChange={event => {
    const next = parseHoursTime(event.target.value);
    setText(event.target.value);
    setPreviousMinute(next);
    onChange(next);
  }}/>;
}


type HoursExceptionCommand = 'upsert_hours_exception' | 'remove_hours_exception';
type HoursExceptionInput = ConfigurationInput<'upsert_hours_exception'> | ConfigurationInput<'remove_hours_exception'>;
type HoursExceptionDraft = ConfigurationPayloads['upsert_hours_exception'];
type HoursExceptionValues = { items: SavedHoursException[] };

function prepareHoursException(item?: SavedHoursException): HoursExceptionDraft {
  return item ? { date: item.date, closed: item.closed, intervals: item.intervals.map(interval => ({ start_minute: interval.start_minute, end_minute: interval.end_minute })) } : { date: '', closed: true, intervals: [] };
}

export async function submitHoursException(command: HoursExceptionCommand, input: HoursExceptionInput) {
  if (command === 'upsert_hours_exception') {
    const checked = validateConfiguration('upsert_hours_exception', input as ConfigurationInput<'upsert_hours_exception'>);
    if (!checked.ok) return { result: { status: 'validation_error' as const, issues: checked.issues }, refreshRequired: false };
    return saveOnboardingConfiguration('upsert_hours_exception', input as ConfigurationInput<'upsert_hours_exception'>);
  }
  const checked = validateConfiguration('remove_hours_exception', input as ConfigurationInput<'remove_hours_exception'>);
  if (!checked.ok) return { result: { status: 'validation_error' as const, issues: checked.issues }, refreshRequired: false };
  return saveOnboardingConfiguration('remove_hours_exception', input as ConfigurationInput<'remove_hours_exception'>);
}

export function exceptionFeedback(result: ConfigurationResult, command: HoursExceptionCommand = 'upsert_hours_exception'): string {
  const change = command === 'remove_hours_exception' ? 'removal' : 'save';
  switch (result.status) {
    case 'saved': return command === 'remove_hours_exception' ? 'Date-specific hours removal saved. Removing a date override has no appointment effect.' : 'Date-specific hours saved. This records a local-date override only; it does not book appointments, sync calendars or enable live scheduling.';
    case 'replayed': return 'Your earlier date override ' + change + ' is confirmed. Review the latest saved exceptions before changing another date.';
    case 'validation_error': return 'Check the date and times. Your edits are still shown.';
    case 'conflict': return result.reason === 'version_exhausted' ? 'Date-specific hours cannot accept more changes right now. Ask your administrator for help.' : 'Saved setup information changed or this save request was already used. Review the latest date-specific hours before trying again. Your edits are still shown.';
    case 'unavailable': return 'Your workspace access may have changed. Refresh and review Setup before trying again.';
    default: return 'We could not confirm this date override ' + change + '. Retry this same date override ' + change + ' before starting a different one.';
  }
}

export function HoursExceptionsForm({ tenantId, revision, timezone, values }: { tenantId: string; revision: number; timezone: string; values: HoursExceptionValues }) {
  const router = useRouter();
  const id = useId();
  const active = values.items.filter(item => item.active).toSorted((a, b) => a.date.localeCompare(b.date));
  const [draft, setDraft] = useState<HoursExceptionDraft>(() => prepareHoursException(active[0]));
  const [baseline, setBaseline] = useState({ revision, values });
  const [result, setResult] = useState<ConfigurationResult | null>(null);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const attempt = useRef<{ command: HoursExceptionCommand; input: HoursExceptionInput } | null>(null);
  const busy = useRef(false);
  const uncertain = result?.status === 'retryable_failure';
  const stopped = !!result && ['saved', 'replayed', 'conflict', 'unavailable'].includes(result.status);
  const refreshed = revision !== baseline.revision || values !== baseline.values;
  const locked = pending || uncertain || stopped;
  const invalid = (path: string) => result?.status === 'validation_error' && result.issues.some(issue => issue.field === path || issue.field.startsWith(path + '.'));

  function changeInterval(index: number, field: 'start_minute' | 'end_minute', minute: number) {
    setDraft(previous => ({ ...previous, intervals: previous.intervals.map((interval, i) => i === index ? { ...interval, [field]: minute } : interval) }));
  }

  function latestSummary() {
    return active.length ? <ul>{active.map(item => <li key={item.date}><strong>{item.date}:</strong> {item.closed ? 'Closed all day' : item.intervals.length ? item.intervals.map(interval => clockValue(interval.start_minute) + '–' + clockValue(interval.end_minute)).join(', ') : 'No opening intervals'}</li>)}</ul> : <p>No active date-specific hours saved.</p>;
  }

  function save(command: HoursExceptionCommand) {
    if (busy.current || (stopped && !uncertain)) return;
    if (!uncertain && revision !== baseline.revision) {
      setResult({ status: 'conflict', reason: 'revision' });
      setMessage('Saved setup information changed. Review the latest date-specific hours below. Your edits remain unsaved.');
      return;
    }
    busy.current = true;
    if (!attempt.current) {
      attempt.current = command === 'remove_hours_exception'
        ? { command, input: { tenant_id: tenantId, request_id: crypto.randomUUID(), expected_config_revision: baseline.revision, payload: { date: draft.date } } }
        : { command, input: { tenant_id: tenantId, request_id: crypto.randomUUID(), expected_config_revision: baseline.revision, payload: { date: draft.date, closed: draft.closed, intervals: draft.closed ? [] : draft.intervals.map(interval => ({ start_minute: interval.start_minute, end_minute: interval.end_minute })) } } };
    }
    const original = attempt.current;
    startTransition(async () => {
      try {
        const response = await submitHoursException(original.command, original.input);
        setResult(response.result);
        setMessage(exceptionFeedback(response.result, original.command));
        if (response.result.status === 'validation_error') attempt.current = null;
        if (response.result.status === 'saved' || response.result.status === 'replayed') router.refresh();
      } catch {
        setResult({ status: 'retryable_failure' });
        setMessage(exceptionFeedback({ status: 'retryable_failure' }, original.command));
      } finally {
        busy.current = false;
      }
    });
  }

  function reviewLatest(keepEdits: boolean) {
    if (!keepEdits) setDraft(prepareHoursException(active[0]));
    setBaseline({ revision, values });
    attempt.current = null;
    setResult(null);
    setMessage(keepEdits ? 'Latest date-specific hours reviewed. Your edits remain unsaved.' : 'Latest date-specific hours loaded. You can edit a date now.');
  }

  return <>
    <p>Date-specific hours use your business time zone: <strong>{timezone}</strong>. Choose one local date at a time. A saved exception replaces the hours for that date only.</p>
    <p className="notice">These exceptions do not change weekly hours, book appointments, sync calendars, connect providers or enable live scheduling. Removing a date with no saved override is safe and has no appointment effect.</p>
    {active.length ? <section aria-labelledby={id + '-saved-title'}><h3 id={id + '-saved-title'}>Saved date overrides</h3>{latestSummary()}<div className="button-row">{active.map(item => <button className="button secondary" type="button" key={item.date} disabled={locked} onClick={() => setDraft(prepareHoursException(item))}>Edit {item.date}</button>)}</div></section> : <p>No date-specific hours are saved yet.</p>}
    <form className="form setup-editor" aria-busy={pending} onSubmit={event => { event.preventDefault(); if (!locked) save('upsert_hours_exception'); }}>
      <fieldset disabled={locked}><legend className="visually-hidden">Date-specific hours</legend>
        <label className="field" htmlFor={id + '-date'}><span>Local date</span><input id={id + '-date'} type="date" value={draft.date} onChange={event => setDraft(previous => ({ ...previous, date: event.target.value }))} required aria-invalid={invalid('date')} aria-describedby={id + '-date-hint'}/><small id={id + '-date-hint'}>{invalid('date') ? 'Use a real local date in YYYY-MM-DD format.' : 'This date is interpreted in the business time zone.'}</small></label>
        <label className="setup-checkbox"><input type="checkbox" checked={draft.closed} onChange={event => setDraft(previous => ({ ...previous, closed: event.target.checked, intervals: event.target.checked ? [] : previous.intervals }))}/>Closed all day on this date</label>
        {!draft.closed && <>
          {!draft.intervals.length && <p>No opening intervals added for this date. Add an interval or mark the date closed.</p>}
          {draft.intervals.map((interval, intervalIndex) => <div className="setup-interval" key={intervalIndex}>
            <label className="field" htmlFor={id + '-' + intervalIndex + '-start'}><span>Interval {intervalIndex + 1} start</span><HoursTimeInput id={id + '-' + intervalIndex + '-start'} type="text" inputMode="text" placeholder="HH:MM" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" required minute={interval.start_minute} onChange={minute => changeInterval(intervalIndex, 'start_minute', minute)} aria-invalid={invalid('intervals')} aria-describedby={id + '-interval-hint'}/></label>
            <label className="field" htmlFor={id + '-' + intervalIndex + '-end'}><span>Interval {intervalIndex + 1} end</span><HoursTimeInput id={id + '-' + intervalIndex + '-end'} type="text" inputMode="text" placeholder="HH:MM" pattern="([01][0-9]|2[0-3]):[0-5][0-9]|24:00" required minute={interval.end_minute} onChange={minute => changeInterval(intervalIndex, 'end_minute', minute)} aria-invalid={invalid('intervals')} aria-describedby={id + '-interval-hint'}/></label>
            <button className="button secondary" type="button" onClick={() => setDraft(previous => ({ ...previous, intervals: previous.intervals.filter((_, i) => i !== intervalIndex) }))}>Remove interval {intervalIndex + 1}</button>
          </div>)}
          <button className="button secondary" type="button" disabled={draft.intervals.length >= 8} onClick={() => setDraft(previous => ({ ...previous, intervals: [...previous.intervals, { start_minute: 540, end_minute: 1020 }] }))}>Add interval</button>
          <p id={id + '-interval-hint'} className={invalid('intervals') ? 'form-error' : 'small'}>{invalid('intervals') ? 'Check this date: each start must be before its end, with no overlapping intervals. Up to eight intervals are allowed.' : 'Use up to eight non-overlapping intervals. Times cannot cross midnight.'}</p>
        </>}
        <div className="button-row"><button className="button" type="submit">{pending ? 'Saving…' : 'Save date override'}</button><button className="button secondary" type="button" onClick={() => save('remove_hours_exception')}>{pending ? 'Removing…' : 'Remove date override'}</button></div>
      </fieldset>
      {result?.status === 'validation_error' && <p className="form-error">Check the date and intervals. Your edits remain shown.</p>}
      <div aria-live="polite" role={result && !['saved', 'replayed'].includes(result.status) ? 'alert' : 'status'}>{message && <p className={result && !['saved', 'replayed'].includes(result.status) ? 'form-error' : 'notice'}>{message}</p>}</div>
    </form>
    {uncertain && <button className="button" type="button" disabled={pending} onClick={() => save(attempt.current?.command ?? 'upsert_hours_exception')}>{pending ? 'Retrying…' : 'Retry same date override save'}</button>}
    {stopped && <section className="onboarding-review" aria-labelledby={id + '-review'}><h3 id={id + '-review'}>Latest date-specific hours</h3><p>{result?.status === 'unavailable' ? 'Refresh and review Setup before trying again. Your edits are still shown above.' : 'Refresh and review saved date-specific hours before saving another date override.'}</p><button className="button secondary" type="button" onClick={() => router.refresh()}>Refresh date-specific hours</button>{latestSummary()}{result?.status === 'conflict' && result.reason === 'version_exhausted' ? <p>Ask your administrator for help before making more date-specific changes.</p> : result?.status === 'unavailable' ? <p className="small">If this does not refresh, return to the dashboard and reopen Setup before trying again.</p> : refreshed ? <div className="button-row"><button className="button secondary" type="button" onClick={() => reviewLatest(false)}>Use saved date-specific hours</button>{result?.status === 'conflict' && <button className="button" type="button" onClick={() => reviewLatest(true)}>Keep my edits after review</button>}</div> : <p className="small">If this does not refresh, return to the dashboard and reopen Setup. Keep a copy of unsaved changes before leaving.</p>}</section>}
  </>;
}

export function ServicesForm({ tenantId, revision, values }: { tenantId: string; revision: number; values: { items: ServiceInput[] } }) {
  const id = useId();
  const editor = useSetupEditor('replace_services', tenantId, revision, values);
  function change(index: number, update: Partial<ServiceInput>) { editor.setDraft(previous => ({ items: previous.items.map((item, i) => i === index ? { ...item, ...update } : item) })); }
  return <>
    <p>Add the services your business offers. Enable services you want listed. Position controls their order, starting at 0. Saving replaces this service list and does not enable live bookings.</p>
    <form className="form setup-editor" aria-busy={editor.pending} onSubmit={event => { event.preventDefault(); if (!editor.locked) editor.save(); }}>
      <fieldset disabled={editor.locked}><legend className="visually-hidden">Services</legend>
        {!editor.draft.items.length && <p>No services added. Add a service below, or save an empty list to remove existing services.</p>}
        {editor.draft.items.map((item, index) => <fieldset className="setup-editor-row" key={item.id ?? `new-${index}`}><legend>Service {index + 1}</legend>
          <label className="field" htmlFor={`${id}-${index}-name`}><span>Service {index + 1} name</span><input id={`${id}-${index}-name`} value={item.name} onChange={event => change(index, { name: event.target.value })} aria-invalid={editor.invalid(`items.${index}.name`)}/></label>
          <label className="field" htmlFor={`${id}-${index}-description`}><span>Service {index + 1} description</span><textarea id={`${id}-${index}-description`} value={item.description} onChange={event => change(index, { description: event.target.value })} aria-invalid={editor.invalid(`items.${index}.description`)}/></label>
          <label className="setup-checkbox"><input type="checkbox" checked={item.enabled} onChange={event => change(index, { enabled: event.target.checked })}/>Enable service {index + 1}</label>
          <label className="field" htmlFor={`${id}-${index}-position`}><span>Service {index + 1} position (0–9999)</span><input id={`${id}-${index}-position`} type="number" min={0} max={9999} step={1} value={Number.isFinite(item.position) ? item.position : ''} onChange={event => change(index, { position: event.target.value === '' ? NaN : Number(event.target.value) })} aria-invalid={editor.invalid(`items.${index}.position`)}/></label>
          {editor.invalid(`items.${index}`) && <p className="form-error">Check service {index + 1}. Use up to 120 characters for its name, 2000 for its description and a whole-number position from 0 to 9999.</p>}
          <button className="button secondary" type="button" onClick={() => editor.setDraft(previous => ({ items: previous.items.filter((_, i) => i !== index) }))}>Remove service {index + 1}</button>
        </fieldset>)}
        <div className="button-row"><button className="button secondary" type="button" disabled={editor.draft.items.length >= 100} onClick={() => editor.setDraft(previous => ({ items: [...previous.items, { id: null, name: '', description: '', enabled: false, position: Math.min(9999, Math.max(-1, ...previous.items.map(item => Number.isFinite(item.position) ? item.position : -1)) + 1) }] }))}>Add service</button><button className="button" type="submit">{editor.pending ? 'Saving…' : 'Save services'}</button></div>
      </fieldset>
      {editor.result?.status === 'validation_error' && <p className="form-error">Check service names, descriptions and positions. A list can contain up to 100 services. Your edits remain shown.</p>}
    </form>
    <EditorOutcome editor={editor} latest={values.items.length ? <ul>{values.items.map((item, index) => <li key={item.id ?? index}>{item.name || 'Unnamed service'} — {item.enabled ? 'Enabled' : 'Disabled'}, position {item.position}<p className="record-notes">{item.description || 'No description'}</p></li>)}</ul> : <p>No saved services.</p>}/>
  </>;
}

export function WeeklyHoursForm({ tenantId, revision, timezone, values }: { tenantId: string; revision: number; timezone: string; values: { days: HoursDay[] } }) {
  const id = useId();
  const editor = useSetupEditor('replace_weekly_hours', tenantId, revision, values, prepareHours);
  function changeDay(index: number, update: Partial<HoursDay>) { editor.setDraft(previous => ({ days: previous.days.map((day, i) => i === index ? { ...day, ...update } : day) })); }
  return <>
    <p>Hours use your business time zone: <strong>{timezone}</strong>. Review all seven days before saving. Days without saved hours start closed. Changing a day to closed removes its intervals from this draft. Use 24-hour times (HH:MM); an end time of 24:00 means midnight at the end of that day. Intervals must not overlap or cross midnight. Saving does not reserve appointments or enable live booking.</p>
    <form className="form setup-editor" aria-busy={editor.pending} onSubmit={event => { event.preventDefault(); if (!editor.locked) editor.save(); }}>
      <fieldset disabled={editor.locked}><legend className="visually-hidden">Weekly hours</legend>
        {editor.draft.days.map((day, index) => <fieldset className="setup-editor-row" key={day.weekday}><legend>{dayNames[day.weekday]}</legend>
          <label className="setup-checkbox"><input type="checkbox" checked={day.closed} onChange={event => changeDay(index, { closed: event.target.checked, intervals: [] })}/>{dayNames[day.weekday]} closed</label>
          {!day.closed && <>
            {!day.intervals.length && <p>No opening intervals added for {dayNames[day.weekday]}. Add an interval to show opening hours.</p>}
            {day.intervals.map((interval, intervalIndex) => <div className="setup-interval" key={intervalIndex}>
              {(['start_minute', 'end_minute'] as const).map(field => <label className="field" key={field} htmlFor={`${id}-${index}-${intervalIndex}-${field}`}><span>{dayNames[day.weekday]} interval {intervalIndex + 1} {field === 'start_minute' ? 'start' : 'end'}</span><HoursTimeInput id={`${id}-${index}-${intervalIndex}-${field}`} type="text" inputMode="text" placeholder="HH:MM" pattern={field === 'start_minute' ? '([01][0-9]|2[0-3]):[0-5][0-9]' : '([01][0-9]|2[0-3]):[0-5][0-9]|24:00'} required minute={interval[field]} onChange={minute => changeDay(index, { intervals: day.intervals.map((row, i) => i === intervalIndex ? { ...row, [field]: minute } : row) })} aria-invalid={editor.invalid(`days.${index}.intervals`)} aria-describedby={`${id}-${index}-hint`}/></label>)}
              <button className="button secondary" type="button" onClick={() => changeDay(index, { intervals: day.intervals.filter((_, i) => i !== intervalIndex) })}>Remove {dayNames[day.weekday]} interval {intervalIndex + 1}</button>
            </div>)}
            <button className="button secondary" type="button" disabled={day.intervals.length >= 8} onClick={() => changeDay(index, { intervals: [...day.intervals, { start_minute: 540, end_minute: 1020 }] })}>Add {dayNames[day.weekday]} interval</button>
          </>}
          <p id={`${id}-${index}-hint`} className={editor.invalid(`days.${index}`) ? 'form-error' : 'small'}>{editor.invalid(`days.${index}`) ? 'Check this day: each start must be before its end, with no overlapping intervals. Up to eight intervals are allowed.' : day.closed ? 'Closed days have no opening intervals.' : 'Up to eight intervals. Check times before saving.'}</p>
        </fieldset>)}
        <button className="button" type="submit">{editor.pending ? 'Saving…' : 'Save weekly hours'}</button>
      </fieldset>
      {editor.result?.status === 'validation_error' && <p className="form-error">Review all seven days and their intervals. Your edits remain shown.</p>}
    </form>
    <EditorOutcome editor={editor} latest={values.days.length ? <ul>{values.days.map(day => <li key={day.weekday}>{dayNames[day.weekday]}: {day.closed ? 'Closed' : day.intervals.length ? day.intervals.map(interval => `${clockValue(interval.start_minute)}–${clockValue(interval.end_minute)}`).join(', ') : 'Hours not set'}</li>)}</ul> : <p>No saved weekly hours.</p>}/>
  </>;
}

type BookingPreferences = ConfigurationPayloads['save_booking_preferences'];
const bookingNumbers = [
  { field: 'lead_time_minutes', label: 'Advance notice (minutes)', min: 0, max: 525600 },
  { field: 'buffer_before_minutes', label: 'Time before an appointment (minutes)', min: 0, max: 1440 },
  { field: 'buffer_after_minutes', label: 'Time after an appointment (minutes)', min: 0, max: 1440 },
  { field: 'horizon_days', label: 'How far ahead to consider requests (days)', min: 1, max: 730 },
] as const;

export function BookingPreferencesForm({ tenantId, revision, values, saved }: { tenantId: string; revision: number; values: BookingPreferences; saved: boolean }) {
  const id = useId();
  const editor = useSetupEditor('save_booking_preferences', tenantId, revision, values);
  return <>
    <p className="notice">Booking remains request-only. Office staff must review requests. Provider verification and live booking readiness remain pending. Saving preferences does not check availability, reserve appointments or send reminders.</p>
    {!saved && <p>No request preferences saved yet.</p>}
    <p>These optional preferences help describe how your office reviews requests. Leave a number blank if it has not been decided. Use whole numbers in the ranges shown.</p>
    <form className="form setup-editor" aria-busy={editor.pending} onSubmit={event => { event.preventDefault(); if (!editor.locked) editor.save(); }}>
      <fieldset disabled={editor.locked}><legend className="visually-hidden">Request-only booking preferences</legend>
        <div className="setup-preference-grid">{bookingNumbers.map(({ field, label, min, max }) => <label className="field" key={field} htmlFor={`${id}-${field}`}><span>{label} (optional)</span><input id={`${id}-${field}`} type="number" min={min} max={max} step={1} value={editor.draft[field] === null || !Number.isFinite(editor.draft[field]) ? '' : editor.draft[field]} onChange={event => editor.setDraft(previous => ({ ...previous, [field]: event.target.value === '' ? null : Number(event.target.value) }))} aria-invalid={editor.invalid(field)} aria-describedby={`${id}-${field}-hint`}/><small id={`${id}-${field}-hint`}>{editor.invalid(field) ? 'Check this number. ' : ''}Use {min}–{max}, or leave blank.</small></label>)}</div>
        <label className="field" htmlFor={`${id}-notes`}><span>Request review notes (optional)</span><textarea id={`${id}-notes`} value={editor.draft.notes} onChange={event => editor.setDraft(previous => ({ ...previous, notes: event.target.value }))} aria-invalid={editor.invalid('notes')} aria-describedby={`${id}-notes-hint`}/><small id={`${id}-notes-hint`}>{editor.invalid('notes') ? 'Check these notes. ' : ''}Up to 2000 characters. Saving notes does not automate these instructions.</small></label>
        <label className="setup-checkbox"><input type="checkbox" checked={editor.draft.acknowledged} onChange={event => editor.setDraft(previous => ({ ...previous, acknowledged: event.target.checked }))}/>I understand requests need office review and saving these preferences does not enable live booking.</label>
        <button className="button" type="submit">{editor.pending ? 'Saving…' : 'Save request preferences'}</button>
      </fieldset>
      {editor.result?.status === 'validation_error' && <p className="form-error">Check the numbers and notes. Your edits remain shown.</p>}
    </form>
    <EditorOutcome editor={editor} latest={saved ? <><dl>{bookingNumbers.map(({ field, label }) => <div key={field}><dt>{label}</dt><dd>{values[field] ?? 'Not set'}</dd></div>)}</dl><p className="record-notes">{values.notes || 'No request review notes.'}</p><p>Office review understanding: {values.acknowledged ? 'Acknowledged' : 'Not acknowledged'}.</p><p>Booking remains request-only.</p></> : <p>No saved request preferences.</p>}/>
  </>;
}

export function EscalationContactsForm({ tenantId, revision, values }: { tenantId: string; revision: number; values: { items: EscalationInput[] } }) {
  const id = useId();
  const editor = useSetupEditor('replace_escalation_contacts', tenantId, revision, values);
  const fields = [{ field: 'label', label: 'Purpose or team', max: 120 }, { field: 'contact_name', label: 'Contact name', max: 160 }, { field: 'email', label: 'Email', max: 254 }, { field: 'phone', label: 'Phone', max: 40 }] as const;
  function change(index: number, update: Partial<EscalationInput>) { editor.setDraft(previous => ({ items: previous.items.map((item, i) => i === index ? { ...item, ...update } : item) })); }
  return <>
    <p>Keep contacts for requests that need a person’s attention. Only workspace owners and admins can view or edit this list here. Saving contacts does not send a message, place a call or confirm a handoff. Provider verification remains pending.</p>
    <p>Add up to 20 contacts. Position controls their order, starting at 0. Email and phone are optional; for phone, use + and the country code followed by digits only. Saving replaces the contact list.</p>
    <form className="form setup-editor" aria-busy={editor.pending} onSubmit={event => { event.preventDefault(); if (!editor.locked) editor.save(); }}>
      <fieldset disabled={editor.locked}><legend className="visually-hidden">Escalation contacts</legend>
        {!editor.draft.items.length && <p>No escalation contacts added. Add a contact below, or save an empty list to remove existing contacts.</p>}
        {editor.draft.items.map((item, index) => <fieldset className="setup-editor-row" key={item.id ?? `new-contact-${index}`}><legend>Escalation contact {index + 1}</legend>
          <div className="setup-preference-grid">{fields.map(({ field, label, max }) => <label className="field" key={field} htmlFor={`${id}-${index}-${field}`}><span>Contact {index + 1} {label.toLowerCase()} (optional)</span><input id={`${id}-${index}-${field}`} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} value={item[field] ?? ''} onChange={event => change(index, { [field]: event.target.value })} aria-invalid={editor.invalid(`items.${index}.${field}`)} aria-describedby={`${id}-${index}-${field}-hint`}/><small id={`${id}-${index}-${field}-hint`}>{editor.invalid(`items.${index}.${field}`) ? 'Check this value. ' : ''}{field === 'phone' ? 'Use +, country code and digits only.' : field === 'email' ? 'Use a valid email address, or leave blank.' : `Up to ${max} characters.`}</small></label>)}</div>
          <label className="setup-checkbox"><input type="checkbox" checked={item.enabled} onChange={event => change(index, { enabled: event.target.checked })}/>Enable escalation contact {index + 1}</label>
          <label className="field" htmlFor={`${id}-${index}-position`}><span>Contact {index + 1} position (0–9999)</span><input id={`${id}-${index}-position`} type="number" min={0} max={9999} step={1} value={Number.isFinite(item.position) ? item.position : ''} onChange={event => change(index, { position: event.target.value === '' ? NaN : Number(event.target.value) })} aria-invalid={editor.invalid(`items.${index}.position`)} aria-describedby={`${id}-${index}-position-hint`}/><small id={`${id}-${index}-position-hint`}>Use a whole number from 0 to 9999.</small></label>
          {editor.invalid(`items.${index}`) && <p className="form-error">Check contact {index + 1} and its position. Your edits remain shown.</p>}
          <button className="button secondary" type="button" onClick={() => editor.setDraft(previous => ({ items: previous.items.filter((_, i) => i !== index) }))}>Remove escalation contact {index + 1}</button>
        </fieldset>)}
        <div className="button-row"><button className="button secondary" type="button" disabled={editor.draft.items.length >= 20} onClick={() => editor.setDraft(previous => ({ items: [...previous.items, { id: null, label: '', contact_name: '', email: null, phone: null, enabled: false, position: Math.min(9999, Math.max(-1, ...previous.items.map(item => Number.isFinite(item.position) ? item.position : -1)) + 1) }] }))}>Add escalation contact</button><button className="button" type="submit">{editor.pending ? 'Saving…' : 'Save escalation contacts'}</button></div>
      </fieldset>
      {editor.result?.status === 'validation_error' && <p className="form-error">Check contact details and positions. A list can contain up to 20 contacts. Your edits remain shown.</p>}
    </form>
    <EditorOutcome editor={editor} latest={values.items.length ? <ul>{values.items.map((item, index) => <li key={item.id ?? index}><strong>{item.label || 'Contact purpose not added'}</strong><p>{item.contact_name || 'Name not added'}; {item.email || 'Email not added'}; {item.phone || 'Phone not added'}.</p><p>{item.enabled ? 'Enabled' : 'Disabled'}, position {item.position}. No handoff confirmed.</p></li>)}</ul> : <p>No saved escalation contacts.</p>}/>
  </>;
}


