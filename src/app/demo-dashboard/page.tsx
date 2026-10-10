const leads = [
  { name: 'Sam Carter', issue: 'Furnace grinding noise', location: '22 Pine Street, Lewiston', urgency: 'Routine', window: 'Monday morning', status: 'New' },
  { name: 'Pine Street Market', issue: 'AC blowing warm air', location: '118 Main Street, Auburn', urgency: 'Today', window: 'Today if possible', status: 'Contacted' },
  { name: 'Casey Morgan', issue: 'Fall tune-up request', location: 'Lisbon area', urgency: 'Routine', window: 'Next Wednesday afternoon', status: 'New' },
];

const jobs = [
  { title: 'Review Pine Street Market cooling request', status: 'Scheduled hold', date: 'Tue Oct 13, 10:00 AM', note: 'Office reviews availability before confirming.' },
  { title: 'Office review: furnace grinding noise', status: 'New', date: 'Not scheduled', note: 'Lead captured by AI, waiting for office decision.' },
  { title: 'Completed demo maintenance visit', status: 'Completed', date: 'Fri Oct 9, 9:00 AM', note: 'Fictional history item for showing job records.' },
];

const setupItems = [
  'Services: no heat, AC repair, maintenance and tune-ups',
  'Hours: Monday–Thursday 8 AM–5 PM, Friday 8 AM–3 PM',
  'Rule: AI captures preferred windows only; office confirms appointments',
  'Escalation: office review first, urgent safety review second',
];

export default function DemoDashboard() {
  return (
    <main className="demo-dashboard" aria-labelledby="demo-title">
      <section className="demo-hero panel">
        <span className="eyebrow">FICTIONAL HVAC DEMO</span>
        <div>
          <h1 id="demo-title">Northstar HVAC Demo Dashboard</h1>
          <p className="lede">Use this page for prospect demos. Every name, phone number, address, lead, job and calendar item is fictional. It shows the managed pilot flow: AI call intake, office review, and no automatic booking.</p>
        </div>
        <div className="demo-safe-card">
          <strong>Safe pilot boundary</strong>
          <p>No SMS, email, payment, quote, dispatch or confirmed appointment is sent from this demo.</p>
        </div>
      </section>

      <section className="demo-stats" aria-label="Demo summary">
        <article className="panel stat"><span>New AI leads</span><strong>2</strong><p>Waiting for office review</p></article>
        <article className="panel stat"><span>Review jobs</span><strong>3</strong><p>One scheduled hold, one new, one completed</p></article>
        <article className="panel stat"><span>Pilot mode</span><strong className="role-value">Office review</strong><p>Preferences only, never confirmed by AI</p></article>
      </section>

      <section className="split-layout demo-grid">
        <div className="panel">
          <div className="section-heading"><h2>AI receptionist leads</h2><span className="pill">Fictional data</span></div>
          <div className="demo-card-list">
            {leads.map((lead) => (
              <article className="demo-record" key={lead.name}>
                <div><strong>{lead.name}</strong><span>{lead.status}</span></div>
                <p>{lead.issue}</p>
                <dl>
                  <div><dt>Location</dt><dd>{lead.location}</dd></div>
                  <div><dt>Urgency</dt><dd>{lead.urgency}</dd></div>
                  <div><dt>Preferred window</dt><dd>{lead.window}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel demo-script-card">
          <h2>Demo talk track</h2>
          <ol>
            <li>The AI answers and collects the service request.</li>
            <li>The request becomes a lead for office review.</li>
            <li>The office decides whether to call back, schedule, or close.</li>
            <li>The pilot keeps the business in control before anything is confirmed.</li>
          </ol>
        </aside>
      </section>

      <section className="split-layout demo-grid">
        <div className="panel">
          <div className="section-heading"><h2>Jobs and calendar preview</h2><span className="pill">Office controlled</span></div>
          <div className="demo-card-list">
            {jobs.map((job) => (
              <article className="demo-record" key={job.title}>
                <div><strong>{job.title}</strong><span>{job.status}</span></div>
                <p>{job.note}</p>
                <dl><div><dt>Calendar</dt><dd>{job.date}</dd></div></dl>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel">
          <h2>Setup snapshot</h2>
          <ul className="demo-check-list">
            {setupItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </aside>
      </section>

      <section className="panel demo-close">
        <h2>How to close the demo</h2>
        <p>“This first pilot is simple: the AI captures calls and organizes them for your office. Your team reviews every request before anything is confirmed. Setup is $497, then $297 per month.”</p>
      </section>
    </main>
  );
}
