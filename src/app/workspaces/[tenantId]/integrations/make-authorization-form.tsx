'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { createClientMakeAuthorization, type MakeAuthorizationActionState } from '@/app/actions/make-authorization';

const initialState: MakeAuthorizationActionState = { status: 'idle', message: '' };

export function MakeAuthorizationForm({ tenantId }: { tenantId: string }) {
  const [state, setState] = useState(initialState);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => setState(await createClientMakeAuthorization(state, form)));
  }
  return <form className="form" aria-busy={pending} onSubmit={submit}>
    <label className="field"><span>Client name</span><input name="name" value={name} onChange={event => setName(event.target.value)} maxLength={255} autoComplete="organization" required placeholder="Example Trade Services" /></label>
    <label className="field"><span>Client email</span><input name="email" value={email} onChange={event => setEmail(event.target.value)} type="email" maxLength={256} autoComplete="email" required placeholder="owner@example.com" /></label>
    <input type="hidden" name="tenantId" value={tenantId} />
    <button className="button" type="submit" disabled={pending}>{pending ? 'Creating link…' : 'Create authorization link'}</button>
    {state.message && <p className={state.status === 'error' ? 'form-error' : 'notice'} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p>}
    {state.publicUri && <div className="notice"><strong>Client link ready.</strong><p><a href={state.publicUri} target="_blank" rel="noreferrer">Open authorization link ↗</a></p><p className="small muted">Copy this link from the address bar and send it to the client. It expires under Make’s request policy. Status tracking will be added after the request is stored against this workspace.</p></div>}
  </form>;
}
