import Link from 'next/link';
import Image from 'next/image';
export function Brand() { return <Link className="brand brand-logo" href="/" aria-label="Cevanta home"><Image className="brand-logo-image" src="/cevanta-logo-v1.png" alt="Cevanta" width={210} height={70} priority /></Link>; }
export function Empty({title, children}: {title: string; children: React.ReactNode}) { return <div className="empty"><span aria-hidden="true" className="empty-icon">↗</span><h3>{title}</h3><p>{children}</p></div>; }
type LandingFaq = readonly {question: string; answer: string}[];
export function LandingPage({faq = []}: {faq?: LandingFaq}) {
  return <main id="main" className="landing-page">
    <header className="landing-nav">
      <Brand />
      <nav aria-label="Main navigation" className="landing-nav-links">
        <a href="#how-it-works">How it works</a>
        <a href="#who-it-is-for">Who it is for</a>
        <a href="#watch">See it in action</a>
        <Link href="/sign-in">Sign in</Link>
        <Link className="button landing-nav-cta" href="/sign-up">Get started</Link>
      </nav>
    </header>

    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-hero-copy">
        <span className="eyebrow">AI ANSWERING FOR SERVICE BUSINESSES</span>
        <h1 id="landing-title">Stop routing customers to your competitors.</h1>
        <p className="landing-hero-lede">Our AI answering service helps turn missed calls into office-ready lead opportunities, including after-hours coverage when configured. It listens, captures the details, and gives your team a clear next step before the lead goes cold.</p>
        <div className="landing-actions">
          <Link className="button landing-primary-cta" href="/sign-up">Start your setup <span aria-hidden="true">↗</span></Link>
          <a className="button secondary" href="#watch">Watch the call <span aria-hidden="true">↓</span></a>
        </div>
        <p className="landing-note">Your office stays in control. Cevanta does not promise a time, collect payment, or dispatch a technician without your approval.</p>
      </div>
      <div className="landing-hero-proof" aria-label="What the receptionist does">
        <div className="landing-proof-window">
          <div className="landing-window-top"><span className="landing-live-dot" aria-hidden="true" /> Sample call in progress <span>Fictional example</span></div>
          <div className="landing-call-row landing-call-customer"><strong>Caller</strong><p>“My AC is not cooling. Can someone help tomorrow?”</p></div>
          <div className="landing-call-row landing-call-ai"><strong>AI receptionist</strong><p>“I can capture that for the office and note your preferred time.”</p></div>
          <div className="landing-proof-footer"><span>Issue captured</span><span>Preferred time saved</span><span>Office review next</span></div>
        </div>
      </div>
    </section>

    <section className="landing-proof-strip" aria-label="Cevanta benefits">
      <div><strong>Capture more call opportunities</strong><span>Including after-hours coverage when configured.</span></div>
      <div><strong>Capture the right details</strong><span>Name, number, issue, urgency and timing.</span></div>
      <div><strong>Keep your team in control</strong><span>Review before anything is confirmed.</span></div>
    </section>

    <section id="watch" className="landing-video-section" aria-labelledby="video-title">
      <div className="landing-section-heading"><span className="eyebrow">SEE IT IN ACTION</span><h2 id="video-title">From a missed call to a clean next step.</h2><p>Watch a fictional service call move from conversation to an office-ready request. No complicated screens or technical language.</p></div>
      <div className="landing-video-layout">
        <div className="landing-video-frame">
          <video controls preload="metadata" poster="/call-demo-poster.svg" aria-label="Fictional AI receptionist call and dashboard handoff demo">
            <source src="/cevanta-call-demo.mp4" type="video/mp4" />
            Your browser cannot play this video. The sample call: a customer reports that their air conditioner is not cooling, the AI captures the issue and preferred time, and the office reviews the request before scheduling.
          </video>
        </div>
        <aside className="landing-call-summary">
          <span className="eyebrow">THE SIMPLE STORY</span>
          <ol>
            <li><strong>The phone rings.</strong><span>The AI answers while your team is busy.</span></li>
            <li><strong>The details are captured.</strong><span>The office gets the customer&apos;s need, urgency and preferred time.</span></li>
            <li><strong>Your team decides.</strong><span>Review the request, call back, schedule or close it.</span></li>
          </ol>
        </aside>
      </div>
    </section>

    <section id="how-it-works" className="landing-how" aria-labelledby="how-title">
      <div className="landing-section-heading"><span className="eyebrow">HOW IT WORKS</span><h2 id="how-title">A calmer front office in three steps.</h2></div>
      <div className="landing-step-grid">
        <article><span className="landing-step-number">01</span><h3>Someone calls</h3><p>The receptionist answers with your business information and listens for what the customer needs.</p></article>
        <article><span className="landing-step-number">02</span><h3>A lead is ready</h3><p>The request appears in one clear queue with the caller&apos;s details, service request and urgency.</p></article>
        <article><span className="landing-step-number">03</span><h3>Your office takes over</h3><p>Your team chooses the next action. Nothing is promised or booked without your approval.</p></article>
      </div>
    </section>

    <section id="who-it-is-for" className="landing-audience" aria-labelledby="audience-title">
      <div className="landing-section-heading"><span className="eyebrow">BUILT FOR BUSY SERVICE TEAMS</span><h2 id="audience-title">A clear front door for service calls.</h2><p>Cevanta is designed for HVAC, plumbing, electrical, roofing, and similar field-service businesses whose teams cannot always stop working to answer the phone.</p></div>
      <div className="landing-answer-grid">
        <article><h3>What Cevanta does today</h3><p>It answers service calls, captures the caller&apos;s name and contact details, summarizes the request, records urgency and preferred timing, and places the lead in an office-review dashboard.</p></article>
        <article><h3>What your office controls</h3><p>Your team reviews each request and chooses whether to call back, schedule, assign, or close it. Cevanta does not promise a time, collect payment, or dispatch a technician by default.</p></article>
        <article><h3>How you can evaluate it</h3><p>Watch the fictional call example, open the sample dashboard, and complete a guided setup before deciding whether a managed pilot fits your business.</p></article>
      </div>
    </section>

    {faq.length > 0 ? <section id="faq" className="landing-faq" aria-labelledby="faq-title">
      <div className="landing-section-heading"><span className="eyebrow">COMMON QUESTIONS</span><h2 id="faq-title">Straight answers before you start.</h2><p>What the service does, who it serves, and where your office stays in control.</p></div>
      <div className="landing-faq-list">{faq.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
    </section> : null}

    <section className="landing-cta" aria-labelledby="landing-cta-title">
      <div><span className="eyebrow">READY WHEN YOU ARE</span><h2 id="landing-cta-title">Stop losing good calls to voicemail.</h2><p>Start with a guided setup and see how Cevanta fits your business before you commit to a live pilot.</p></div>
      <div className="landing-cta-actions"><Link className="button landing-primary-cta" href="/sign-up">Start your setup <span aria-hidden="true">↗</span></Link><Link className="button secondary" href="/demo-dashboard">Open the dashboard demo</Link></div>
    </section>

    <footer className="landing-footer"><span>Cevanta · Managed AI answering for service businesses</span><span><Link href="/sign-in">Sign in</Link> · <Link href="/demo-dashboard">Demo</Link></span></footer>
  </main>;
}
export function Setup() { return <main id="main" className="setup"><Brand/><div className="setup-grid"><section><span className="eyebrow">YOUR SERVICE BUSINESS, CONNECTED</span><h1>Good service starts<br/>with a clear picture.</h1><p className="lede">Bring your customers, service locations, and equipment together in one secure workspace.</p><div className="feature-list"><span>01 <b>Know every customer</b></span><span>02 <b>Keep equipment history close</b></span><span>03 <b>Give your team the right access</b></span></div></section><section className="panel setup-panel"><span className="pill">FOUNDATION READY</span><h2>Connect your workspace</h2><p>Cevanta needs a Supabase project before anyone can sign in. Your workspace stays protected during setup.</p><ol><li>Follow the local setup instructions in README.md.</li><li>Add your project URL and public publishable key to .env.local.</li><li>Apply the database migrations, create a user, and assign workspace membership.</li><li>Restart the app and sign in.</li></ol><div className="notice">Use the public key only. Never place a service-role key in this app.</div><p className="muted small">The demo seed contains fictional records. Access still requires a real account and membership.</p></section></div><footer>Built for the people who keep things running.</footer></main>; }
