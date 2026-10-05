'use client';
import Link from 'next/link';
export default function ErrorPage({reset}: {error: Error & {digest?:string};reset:()=>void}) { return <main id="main" className="state-page"><span className="eyebrow">LET’S TRY THAT AGAIN</span><h1>We couldn’t open this page.</h1><p>Your session may have expired, or the service may be unavailable. Try again or sign in.</p><div className="button-row"><button className="button" onClick={reset}>Try again</button><Link className="button secondary" href="/sign-in">Sign in</Link></div></main>; }
