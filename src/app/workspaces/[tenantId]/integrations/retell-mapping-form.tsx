'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { registerRetellAgentMapping } from '@/app/actions/retell-provisioning';

export function RetellMappingForm({ tenantId }: { tenantId: string }) {
  const [agentId, setAgentId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError(false);
    startTransition(async () => {
      const result = await registerRetellAgentMapping(tenantId, agentId);
      if (result.status === 'mapped' || result.status === 'already_mapped') {
        setMessage(result.status === 'already_mapped' ? 'This agent is already mapped to this workspace.' : 'Retell agent mapped. Keep the agent unpublished until the pilot approval checklist passes.');
        setAgentId('');
      } else if (result.status === 'invalid_agent') {
        setError(true);
        setMessage('Enter the Retell agent ID exactly as shown in Retell, beginning with agent_.');
      } else if (result.status === 'conflict') {
        setError(true);
        setMessage('This Retell agent is already assigned to another workspace. No mapping was changed.');
      } else {
        setError(true);
        setMessage('The mapping could not be confirmed. Check the server integration configuration and try again.');
      }
    });
  }
  return <form className="form" onSubmit={submit} aria-busy={pending}>
    <label className="field"><span>Retell agent ID</span><input value={agentId} onChange={event => setAgentId(event.target.value)} placeholder="agent_…" autoComplete="off" required pattern="agent_[A-Za-z0-9_-]{1,128}"/><small>Use the draft agent ID from Retell. Do not paste an API key or webhook URL.</small></label>
    <button className="button" type="submit" disabled={pending}>{pending ? 'Connecting…' : 'Connect receptionist'}</button>
    {message && <p className={error ? 'form-error' : 'notice'} role={error ? 'alert' : 'status'}>{message}</p>}
  </form>;
}
