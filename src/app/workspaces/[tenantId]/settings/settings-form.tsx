'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboardingSettings } from '@/app/actions/onboarding-settings';
import type { ConfigurationInput, ConfigurationPayloads, ConfigurationResult } from '@/lib/onboarding-contracts';

type SettingsValues = ConfigurationPayloads['save_business_profile'];
type SettingsInput = ConfigurationInput<'save_business_profile'>;
type SettingsResponse = Awaited<ReturnType<typeof saveOnboardingSettings>>;

const initialResult = null as ConfigurationResult | null;

function normalize(values: SettingsValues): SettingsValues {
  return {
    name: values.name.trim(),
    trade: values.trade.trim(),
    timezone: values.timezone.trim(),
    business_contact_name: values.business_contact_name.trim(),
    business_email: values.business_email?.trim() || null,
    business_phone: values.business_phone?.trim() || null,
  };
}

function validationIssues(values: SettingsValues) {
  const payload = normalize(values);
  const issues: string[] = [];
  if (!payload.name) issues.push('Business name is required.');
  if (payload.name.length > 160) issues.push('Business name must be 160 characters or fewer.');
  if (!payload.trade) issues.push('Trade is required.');
  if (payload.trade.length > 80) issues.push('Trade must be 80 characters or fewer.');
  if (!payload.timezone) issues.push('Time zone is required.');
  if (payload.timezone.length > 80) issues.push('Time zone must be 80 characters or fewer.');
  return issues;
}

export function settingsFeedback(result: ConfigurationResult | null): string {
  if (!result) return '';
  switch (result.status) {
    case 'saved': return 'Settings saved. Refresh and review the latest details before saving again. Setup readiness, providers, live booking and production release remain pending.';
    case 'replayed': return 'Your earlier settings save is confirmed. Refresh and review the latest details before saving again.';
    case 'validation_error': return 'Check the highlighted settings and try again. Your typed values are still shown.';
    case 'conflict': return result.reason === 'revision' ? 'Settings changed somewhere else. Your typed values are still shown. Refresh and review the latest details before saving again.' : result.reason === 'request_reuse' ? 'This save was already used for different settings. Refresh and review the latest details before trying again.' : 'These settings cannot accept further changes. Ask your administrator for help.';
    case 'unavailable': return 'Settings could not be safely updated. Your typed values are still shown. Refresh and review the workspace before trying again.';
    default: return 'We could not confirm this save. Retry this same save before changing these settings.';
  }
}

export async function submitSettings(input: SettingsInput): Promise<SettingsResponse> {
  const issues = validationIssues(input.payload);
  if (issues.length) return { result: { status: 'validation_error', issues: issues.map((_, index) => ({ field: `settings.${index}`, code: 'invalid_text' })) }, message: issues.join(' '), refreshRequired: false };
  return saveOnboardingSettings({ ...input, payload: normalize(input.payload) });
}

export function SettingsForm({ tenantId, revision, values }: { tenantId: string; revision: number; values: SettingsValues }) {
  const router = useRouter();
  const [draft, setDraft] = useState<SettingsValues>(() => values);
  const [result, setResult] = useState(initialResult);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const attempt = useRef<SettingsInput | null>(null);
  const [baseline, setBaseline] = useState({ revision, values });
  const currentChanged = baseline.revision !== revision || baseline.values !== values;
  const mustReview = !!result && ['saved', 'replayed', 'conflict', 'unavailable'].includes(result.status) && !currentChanged;
  const uncertain = result?.status === 'retryable_failure';
  const locked = pending || mustReview;

  function save(original: SettingsInput) {
    startTransition(async () => {
      const response = await submitSettings(original);
      setResult(response.result);
      setMessage(settingsFeedback(response.result) || response.message);
      if (response.result.status === 'retryable_failure') attempt.current = original;
      else attempt.current = null;
      if (response.result.status === 'saved' || response.result.status === 'replayed') router.refresh();
    });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    const original = attempt.current ?? { tenant_id: tenantId, request_id: crypto.randomUUID(), expected_config_revision: revision, payload: normalize(draft) };
    attempt.current = original;
    save(original);
  }

  function update(field: keyof SettingsValues, value: string) {
    setDraft(previous => ({ ...previous, [field]: value }));
    if (result?.status === 'validation_error') {
      setResult(null);
      setMessage('');
    }
  }

  function reviewLatest() {
    setDraft(values);
    setBaseline({ revision, values });
    attempt.current = null;
    setResult(null);
    setMessage('');
  }

  return <form className="form" onSubmit={onSubmit}>
    <fieldset disabled={pending}>
      <label className="field"><span>Business name <span className="required">*</span></span><input name="name" required maxLength={160} value={draft.name} onChange={event => update('name', event.currentTarget.value)}/></label>
      <label className="field"><span>Trade <span className="required">*</span></span><input name="trade" required maxLength={80} value={draft.trade} onChange={event => update('trade', event.currentTarget.value)}/></label>
      <label className="field"><span>Time zone <span className="required">*</span></span><input name="timezone" required maxLength={80} value={draft.timezone} onChange={event => update('timezone', event.currentTarget.value)}/></label>
      <p className="small muted">Use an IANA time zone, for example America/New_York.</p>
      <p className="notice">Saving these settings keeps your existing business contact details from Setup. It does not connect providers, enable live booking or approve production release.</p>
      <div aria-live="polite" role={result && !['saved', 'replayed'].includes(result.status) ? 'alert' : 'status'}>{message && <p className={result && !['saved', 'replayed'].includes(result.status) ? 'form-error' : 'notice'}>{message}</p>}</div>
      <div className="button-row">
        {uncertain && <button className="button secondary" type="button" disabled={pending} onClick={() => attempt.current && save(attempt.current)}>Retry same save</button>}
        {(mustReview || currentChanged) && <button className="button secondary" type="button" disabled={pending} onClick={currentChanged ? reviewLatest : () => router.refresh()}>{currentChanged ? 'Review latest details' : 'Refresh page'}</button>}
        <button className="button" disabled={locked} type="submit">{pending ? 'Saving...' : 'Save settings'}</button>
      </div>
    </fieldset>
  </form>;
}
