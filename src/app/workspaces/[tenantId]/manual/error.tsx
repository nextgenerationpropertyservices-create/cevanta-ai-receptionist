'use client';

export default function ManualError({ reset }: { reset: () => void }) {
  return <section className="panel" role="alert"><h1>Manual could not load</h1><p className="notice">Refresh this section. If it keeps failing, confirm your workspace access is still active.</p><button className="button" type="button" onClick={reset}>Try again</button></section>;
}
