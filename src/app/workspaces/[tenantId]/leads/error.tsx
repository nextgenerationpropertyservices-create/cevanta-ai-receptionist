'use client';
export default function LeadError({reset}: {reset:()=>void}) { return <section className="panel"><h2>Enquiries are unavailable</h2><p role="alert">We could not load this page. Try again in a moment.</p><button className="button" onClick={reset} type="button">Try again</button></section>; }
