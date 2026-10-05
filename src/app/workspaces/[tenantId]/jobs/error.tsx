'use client';
export default function JobsError({reset}:{reset:()=>void}) {return <section className="panel"><h2>Jobs are unavailable</h2><p role="alert">We could not load this page. Try again in a moment.</p><button className="button" type="button" onClick={reset}>Try again</button></section>;}
