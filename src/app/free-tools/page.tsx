import Link from 'next/link';
import { Brand } from '@/components/ui';

const tools = [
  { title: 'Lead organizer', text: 'Add enquiries, track priority and follow-up, and keep up to 50 active leads in one clear queue.' },
  { title: 'Customer records', text: 'Keep customer details, service locations, equipment, and office notes together.' },
  { title: 'Jobs and calendar', text: 'Turn approved work into jobs and place visits on your internal Cevanta calendar.' },
  { title: 'Small team roster', text: 'Add up to two technicians and keep their skills, phone numbers, and availability easy to find.' },
  { title: 'Reports and ROI estimator', text: 'See office workload and adjust simple estimates using numbers that match your business.' },
  { title: 'Upgrade when it earns its place', text: 'Add the managed AI receptionist only when you are ready. The free workspace does not start calls or send messages.' },
];

export default function FreeToolsPage() {
  return <main id="main" className="free-tools-page">
    <header className="free-tools-nav"><Brand/><div><Link href="/sign-in">Sign in</Link><Link className="button" href="/sign-up">Create free workspace</Link></div></header>
    <section className="free-tools-hero" aria-labelledby="free-tools-title">
      <div><span className="eyebrow">FREE FRONT-OFFICE TOOLS FOR TRADE BUSINESSES</span><h1 id="free-tools-title">Get leads and service work out of your head—and into one clean dashboard.</h1><p>Start with a practical workspace for HVAC, plumbing, electrical, roofing, and other service trades. No credit card. No sales call required.</p><div className="button-row"><Link className="button" href="/sign-up">Create my free workspace <span aria-hidden="true">↗</span></Link><Link className="button secondary" href="/demo-dashboard">See the dashboard</Link></div><small>We require a verified email to protect your workspace. Creating an account does not enroll you in marketing messages.</small></div>
      <aside className="free-tools-preview" aria-label="Free plan at a glance"><span className="pill">$0 TO START</span><h2>Your free Cevanta workspace</h2><ul><li><strong>50</strong><span>active leads</span></li><li><strong>2</strong><span>technician roster spots</span></li><li><strong>Included</strong><span>customers, manual jobs, internal calendar, reports</span></li></ul><p>Use it as long as it is useful. Upgrade only when you want managed answering or connected automation.</p></aside>
    </section>
    <section className="free-tools-section" aria-labelledby="included-title"><div className="free-tools-heading"><span className="eyebrow">USEFUL BEFORE YOU BUY ANYTHING</span><h2 id="included-title">A real starter workspace—not a fake trial.</h2><p>Add your own records and organize daily office work. Your data stays inside your workspace.</p></div><div className="free-tools-grid">{tools.map((tool,index)=><article key={tool.title}><span aria-hidden="true">{String(index+1).padStart(2,'0')}</span><h3>{tool.title}</h3><p>{tool.text}</p></article>)}</div></section>
    <section className="free-tools-boundary" aria-labelledby="free-boundary-title"><div><span className="eyebrow">CLEAR BOUNDARIES</span><h2 id="free-boundary-title">The free plan stays manual and under your control.</h2><p>It does not activate AI phone answering, send SMS or email, write to an external calendar, book automatically, collect payment, dispatch technicians, or run reactivation campaigns. Those features require the right plan, owner approval, provider setup, and testing.</p></div><Link className="button" href="/sign-up">Start free</Link></section>
    <footer className="free-tools-footer"><span>Cevanta · Front-office tools for service businesses</span><span><Link href="/">Home</Link> · <Link href="/sign-in">Sign in</Link></span></footer>
  </main>;
}
