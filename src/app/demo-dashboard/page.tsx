import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cevanta client dashboard preview',
  description: 'Explore a fictional client-facing preview of the Cevanta front office dashboard.',
};

const attentionItems = [
  '3 new calls are ready for office review',
  '1 urgent cooling request needs a callback',
  '2 open jobs still need a technician',
];

const summaryCards = [
  { label: 'New leads', value: '3', detail: '1 urgent or high priority' },
  { label: 'Open jobs', value: '7', detail: '2 waiting for field assignment' },
  { label: 'Visits today', value: '4', detail: '3 technicians on the road' },
  { label: 'Calls captured', value: '18', detail: 'Fictional month-to-date example' },
];

const queueItems = [
  {
    name: 'Taylor Reed',
    meta: 'Urgent · AI receptionist lead · Today, 8:42 AM',
    request: 'No cooling at a small office. The caller reports warm air and requested the first available callback.',
    priority: 'urgent',
  },
  {
    name: 'Morgan Ellis',
    meta: 'High priority · AI receptionist lead · Today, 9:16 AM',
    request: 'Water around the indoor unit. The system is off and the office should review the safety notes.',
    priority: 'high',
  },
  {
    name: 'Riverview Market',
    meta: 'Normal priority · Manually added lead · Today, 10:05 AM',
    request: 'Routine maintenance request for two rooftop units with a morning scheduling preference.',
    priority: 'normal',
  },
];

const technicianLoad = [
  { name: 'Avery Brooks', work: '2 open jobs', current: 'Furnace diagnostic · North district' },
  { name: 'Jordan Lee', work: '1 open job', current: 'Seasonal tune-up · Central district' },
  { name: 'Cameron Wells', work: 'Available', current: 'No active assignment shown' },
];

const calendarItems = [
  { time: 'Today · 11:00 AM', title: 'Heat pump diagnostic', meta: 'Avery Brooks · high priority' },
  { time: 'Today · 2:30 PM', title: 'Seasonal maintenance visit', meta: 'Jordan Lee · normal priority' },
  { time: 'Tomorrow · 9:00 AM', title: 'Commercial rooftop inspection', meta: 'Unassigned · normal priority' },
];

const roiAssumptions = [
  { label: 'Missed calls each month', value: '12' },
  { label: 'Average completed job', value: '$680' },
  { label: 'Example close rate', value: '35%' },
];

export default function DemoDashboard() {
  return (
    <div className="demo-overview-shell">
      <a className="skip-link" href="#demo-overview-main">Skip to dashboard preview</a>

      <header className="demo-overview-topbar">
        <div className="demo-overview-topbar-inner">
          <Link className="demo-overview-brand" href="/" aria-label="Cevanta home">
            <span className="brand-mark" aria-hidden="true">C</span>
            <span>Cevanta</span>
          </Link>
          <div className="demo-overview-workspace">
            <strong>Northstar Heating &amp; Cooling</strong>
            <span>Fictional client workspace</span>
          </div>
          <nav className="demo-overview-nav" aria-label="Demo dashboard navigation">
            <a href="#demo-overview-main" aria-current="page">Overview</a>
            <a href="#today-queue">Leads</a>
            <a href="#dispatch-coverage">Dispatch</a>
            <a href="#calendar-pulse">Calendar</a>
          </nav>
          <Link className="button demo-overview-top-cta" href="/sign-up">Start setup</Link>
        </div>
      </header>

      <main className="demo-overview-main" id="demo-overview-main" aria-labelledby="demo-overview-title">
        <section className="demo-overview-hero">
          <div>
            <div className="demo-overview-kicker">
              <span className="eyebrow">FRONT OFFICE COMMAND CENTER</span>
              <span className="demo-preview-label">Fictional preview</span>
            </div>
            <h1 id="demo-overview-title">See every call, lead, and job that needs attention.</h1>
            <p>This client-facing preview shows how a busy trade-service office can review new requests, watch dispatch pressure, and keep the day organized from one clean dashboard.</p>
          </div>

          <aside className="demo-overview-roi" aria-labelledby="demo-roi-title">
            <span className="eyebrow">VALUE SNAPSHOT</span>
            <h2 id="demo-roi-title">Example recovered opportunity</h2>
            <strong>$2,856</strong>
            <p>Illustrative monthly value if 12 captured calls close at the assumptions below.</p>
            <div className="demo-overview-roi-fields" aria-label="Example ROI assumptions">
              {roiAssumptions.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <output>{item.value}</output>
                </div>
              ))}
            </div>
            <small>Example only. Results depend on call volume, job value, follow-up, and close rate.</small>
          </aside>
        </section>

        <section className="demo-overview-alert" aria-labelledby="demo-attention-title">
          <div>
            <span className="eyebrow">NEEDS ATTENTION</span>
            <h2 id="demo-attention-title">{attentionItems[0]}</h2>
            <p>{attentionItems.slice(1).join(' · ')}</p>
          </div>
          <a className="button" href="#today-queue">Review today&apos;s queue</a>
        </section>

        <section className="demo-overview-stats" aria-label="Fictional front office summary">
          {summaryCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </section>

        <div className="demo-overview-grid">
          <section className="demo-overview-panel" id="today-queue" aria-labelledby="demo-queue-title">
            <div className="demo-overview-section-heading">
              <div>
                <span className="eyebrow">TODAY&apos;S QUEUE</span>
                <h2 id="demo-queue-title">What the office should handle first</h2>
              </div>
              <span className="demo-preview-label">Fictional records</span>
            </div>
            <div className="demo-overview-queue">
              {queueItems.map((item) => (
                <article data-priority={item.priority} key={item.name}>
                  <strong>{item.name}</strong>
                  <span>{item.meta}</span>
                  <p>{item.request}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="demo-overview-panel" id="dispatch-coverage" aria-labelledby="demo-dispatch-title">
            <div className="demo-overview-section-heading">
              <div>
                <span className="eyebrow">DISPATCH COVERAGE</span>
                <h2 id="demo-dispatch-title">Field team and workload</h2>
              </div>
            </div>
            <div className="demo-overview-tech-list">
              {technicianLoad.map((technician) => (
                <article key={technician.name}>
                  <div>
                    <strong>{technician.name}</strong>
                    <span>{technician.work}</span>
                  </div>
                  <p>{technician.current}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="demo-overview-panel demo-overview-calendar" id="calendar-pulse" aria-labelledby="demo-calendar-title">
          <div className="demo-overview-section-heading">
            <div>
              <span className="eyebrow">CALENDAR PULSE</span>
              <h2 id="demo-calendar-title">Upcoming jobs by field team</h2>
            </div>
            <span className="demo-preview-label">Office-reviewed schedule</span>
          </div>
          <div className="demo-overview-calendar-list">
            {calendarItems.map((item) => (
              <article key={`${item.time}-${item.title}`}>
                <time>{item.time}</time>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                </div>
                <span className="demo-calendar-status">Preview</span>
              </article>
            ))}
          </div>
        </section>

        <section className="demo-overview-boundary" aria-labelledby="demo-boundary-title">
          <div>
            <span className="eyebrow">YOUR OFFICE STAYS IN CONTROL</span>
            <h2 id="demo-boundary-title">Choose what Cevanta is allowed to do.</h2>
            <p>Live booking, SMS or email messages, external calendar writes, payment collection, and dispatch automation stay off until the client approves each feature and the workflow is configured and tested for that business.</p>
          </div>
          <div className="demo-overview-actions">
            <Link className="button" href="/sign-up">Start your guided setup</Link>
            <Link className="button secondary" href="/#watch">Watch the call example</Link>
            <Link className="demo-overview-signin" href="/sign-in">Already have an account? Sign in</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
