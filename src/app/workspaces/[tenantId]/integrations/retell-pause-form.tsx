'use client';

import { useState, useTransition } from 'react';
import { pauseRetellAgentMapping } from '@/app/actions/retell-provisioning';

export function RetellPauseForm({ tenantId }: { tenantId: string }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function pause() {
    if (!window.confirm('Pause this workspace’s Retell routing? You can map it again later.')) return;
    setMessage('');
    setError(false);
    startTransition(async () => {
      const result = await pauseRetellAgentMapping(tenantId);
      if (result.status === 'paused') setMessage('Retell routing is paused for this workspace.');
      else if (result.status === 'not_mapped') setMessage('No active Retell mapping was found for this workspace.');
      else {
        setError(true);
        setMessage(result.status === 'not_configured' ? 'Retell routing is not configured on this server.' : 'Retell routing could not be paused. Try again or contact support.');
      }
    });
  }

  return <div className="button-row">
    <button className="button secondary" type="button" onClick={pause} disabled={pending}>{pending ? 'Pausing routing…' : 'Pause Retell routing'}</button>
    {message && <p className={error ? 'form-error' : 'notice'} role={error ? 'alert' : 'status'}>{message}</p>}
  </div>;
}
