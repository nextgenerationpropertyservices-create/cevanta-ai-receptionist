import Link from 'next/link';
export default function NotFound() {return <main id="main" className="state-page"><span className="eyebrow">PAGE UNAVAILABLE</span><h1>This record isn’t available.</h1><p>It may have been removed, or your account may not have access to this workspace.</p><Link className="button" href="/workspaces">Back to workspaces ↗</Link></main>;}
