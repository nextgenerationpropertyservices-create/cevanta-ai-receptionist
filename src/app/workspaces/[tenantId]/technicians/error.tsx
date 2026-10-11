'use client';

export default function TechniciansError({reset}:{reset:()=>void}) {
 return <section className="panel" role="alert"><h1>Technicians could not load</h1><p className="notice">Refresh this section. If it keeps failing, confirm the team-management setup has been applied.</p><button className="button" type="button" onClick={reset}>Try again</button></section>;
}
