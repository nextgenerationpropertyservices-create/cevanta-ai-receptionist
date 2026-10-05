'use client';
export default function CalendarError({reset}:{reset:()=>void}) {return <section className="panel"><h2>Calendar unavailable</h2><p role="alert">We could not load your appointments. Try again in a moment.</p><button className="button" type="button" onClick={reset}>Try again</button></section>;}
