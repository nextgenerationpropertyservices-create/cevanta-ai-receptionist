const leads = [
  { name: 'Sam Carter', issue: 'No heat upstairs', location: 'Maple Ridge neighborhood', urgency: 'High', window: 'Today after 2 PM', status: 'Needs review', value: '$650 potential job' },
  { name: 'Pine Street Market', issue: 'Walk-in cooler running warm', location: 'Auburn commercial district', urgency: 'Urgent', window: 'First available today', status: 'New lead', value: '$1,200 potential job' },
  { name: 'Casey Morgan', issue: 'Fall tune-up request', location: 'Lisbon service area', urgency: 'Routine', window: 'Next Wednesday afternoon', status: 'Ready to call back', value: '$189 maintenance visit' },
];

const timeline = [
  { time: '8:03 AM', title: 'Missed call becomes captured intake', detail: 'AI answers, gets the issue, location, urgency and preferred window.' },
  { time: '8:04 AM', title: 'Office sees new lead alert', detail: 'The request lands in Cevanta for review instead of disappearing into voicemail.' },
  { time: '8:11 AM', title: 'Dispatcher reviews before confirming', detail: 'Office decides whether to call, schedule, quote follow-up, or close.' },
  { time: '10:00 AM', title: 'Calendar hold after human approval', detail: 'Calendar preview shows what the office may schedule after review.' },
];

const jobs = [
  { title: 'Review Pine Street Market cooling request', tech: 'Unassigned', status: 'Office review', date: 'Today · pending confirmation', note: 'Flagged urgent; no dispatch promised by AI.' },
  { title: 'Sam Carter furnace diagnostic', tech: 'Avery Brooks', status: 'Calendar hold', date: 'Tue Oct 13 · 10:00 AM', note: 'Human-created hold after reviewing availability.' },
  { title: 'Casey Morgan tune-up', tech: 'Jordan Lee', status: 'Ready to schedule', date: 'Next Wednesday · afternoon preference', note: 'Customer preference captured, not a confirmed appointment.' },
];

const setupItems = [
  'Services: no heat, AC repair, cooling, maintenance and tune-ups',
  'Hours: Monday–Thursday 8 AM–5 PM, Friday 8 AM–3 PM',
  'Service area: Lewiston, Auburn, Lisbon and nearby towns',
  'Never promise: exact pricing, parts availability, same-day dispatch or confirmed appointment times',
  'Escalation: urgent safety issue goes to office review first',
];

const roiRows = [
  { label: 'Missed calls per month', value: '12' },
  { label: 'Average booked job value', value: '$425' },
  { label: 'If 3 extra jobs are recovered', value: '$1,275' },
];

export default function DemoDashboard() {
  return (
    <main className="demo-dashboard demo-meet" aria-labelledby="demo-title">
      <section className="demo-hero panel">
        <div>
          <span className="eyebrow">GOOGLE MEET SALES DEMO · FICTIONAL HVAC COMPANY</span>
          <h1 id="demo-title">See how Cevanta turns missed calls into office-ready leads.</h1>
          <p className="lede">This clean demo dashboard is built for screen sharing. Every name, address, job, lead and dollar example is fictional. The first pilot keeps the office in control before anything is confirmed.</p>
          <div className="button-row demo-hero-points" aria-label="Demo talking points">
            <span className="pill">AI answers</span>
            <span className="pill">Lead captured</span>
            <span className="pill">Office reviews</span>
            <span className="pill">No automatic booking</span>
          </div>
        </div>
        <aside className="demo-safe-card">
          <span className="eyebrow">PILOT OFFER</span>
          <strong>$497 setup + $297/month</strong>
          <p>Managed pilot for HVAC owners who miss calls or need front-office backup.</p>
          <small>Boundary: no automatic booking, SMS/email, calendar writes, payment collection or dispatch automation unless separately approved and tested.</small>
        </aside>
      </section>

      <section className="demo-meet-alert panel" aria-label="New lead alert">
        <div>
          <span className="eyebrow">IMPOSSIBLE-TO-MISS ALERT</span>
          <h2>3 AI receptionist leads need office review</h2>
          <p>Use this first on Google Meet: show the owner that every missed call becomes a clear next action for the office.</p>
        </div>
        <strong>$2,039</strong>
      </section>

      <section className="demo-stats" aria-label="Demo summary">
        <article className="panel stat"><span>New AI leads</span><strong>3</strong><p>All fictional, all waiting for office review</p></article>
        <article className="panel stat"><span>Fastest response path</span><strong>8 min</strong><p>From missed call to office callback queue</p></article>
        <article className="panel stat"><span>Pilot mode</span><strong className="role-value">Office review</strong><p>AI captures preferences, office confirms</p></article>
      </section>

      <section className="split-layout demo-grid">
        <div className="panel">
          <div className="section-heading"><div><span className="eyebrow">LEAD INBOX</span><h2>AI receptionist leads</h2></div><span className="pill">Fictional data</span></div>
          <div className="demo-card-list">
            {leads.map((lead) => (
              <article className="demo-record demo-lead-card" key={lead.name}>
                <div><strong>{lead.name}</strong><span>{lead.status}</span></div>
                <p>{lead.issue}</p>
                <dl>
                  <div><dt>Area</dt><dd>{lead.location}</dd></div>
                  <div><dt>Urgency</dt><dd>{lead.urgency}</dd></div>
                  <div><dt>Preferred window</dt><dd>{lead.window}</dd></div>
                  <div><dt>Demo value</dt><dd>{lead.value}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel demo-script-card">
          <span className="eyebrow">TALK TRACK</span>
          <h2>What to say while sharing</h2>
          <ol>
            <li>“This is the dashboard your office opens each morning.”</li>
            <li>“The AI captures the caller’s need and urgency.”</li>
            <li>“Your office reviews before confirming anything.”</li>
            <li>“The pilot is intentionally safe while we prove the workflow.”</li>
          </ol>
        </aside>
      </section>

      <section className="panel demo-flow-panel">
        <div className="section-heading"><div><span className="eyebrow">CALL TO OFFICE WORKFLOW</span><h2>How a missed call becomes a reviewed job</h2></div><span className="pill">Simple story</span></div>
        <div className="demo-flow">
          {timeline.map((item) => <article key={item.title}><time>{item.time}</time><strong>{item.title}</strong><p>{item.detail}</p></article>)}
        </div>
      </section>

      <section className="split-layout demo-grid">
        <div className="panel">
          <div className="section-heading"><div><span className="eyebrow">CALENDAR PREVIEW</span><h2>Jobs and technician view</h2></div><span className="pill">Office controlled</span></div>
          <div className="demo-card-list">
            {jobs.map((job) => (
              <article className="demo-record" key={job.title}>
                <div><strong>{job.title}</strong><span>{job.status}</span></div>
                <p>{job.note}</p>
                <dl>
                  <div><dt>Technician</dt><dd>{job.tech}</dd></div>
                  <div><dt>Calendar</dt><dd>{job.date}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel demo-roi-card">
          <span className="eyebrow">ROI SNAPSHOT</span>
          <h2>Make the value obvious</h2>
          <div className="demo-roi-list">
            {roiRows.map(row => <div key={row.label}><span>{row.label}</span><strong>{row.value}</strong></div>)}
          </div>
          <p>This is an example calculator for the sales conversation, not a guarantee. The point is to show how a few recovered calls can cover the pilot.</p>
        </aside>
      </section>

      <section className="split-layout demo-grid">
        <div className="panel">
          <span className="eyebrow">ONBOARDING SNAPSHOT</span>
          <h2>What the HVAC owner fills out</h2>
          <ul className="demo-check-list">
            {setupItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <aside className="panel demo-close">
          <span className="eyebrow">CLOSE</span>
          <h2>Use this close on the call</h2>
          <p>“For the first pilot, Cevanta answers calls, captures the details, and gives your office a clean review queue. Your team stays in control before anything is booked. Setup is $497, then $297 per month.”</p>
        </aside>
      </section>
    </main>
  );
}

