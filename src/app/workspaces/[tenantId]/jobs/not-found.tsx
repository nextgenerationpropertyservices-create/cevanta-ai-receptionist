import Link from 'next/link';

export default function JobNotFound() {
 return <section className="panel dispatch-detail"><h1>Job unavailable</h1><p>This job may have been removed, reassigned, or unavailable with your current workspace access.</p><Link className="button secondary" href="/workspaces">Return to your workspaces</Link></section>;
}
