'use client';

import { useState, type FormEvent } from 'react';

type Message = { role: 'guide' | 'user'; text: string };

const quickQuestions = ['How do I review a new lead?', 'How do I assign a job?', 'Where do I finish setup?'];

function answerFor(question: string) {
  const value = question.toLowerCase();
  if (value.includes('lead') || value.includes('enquir')) return 'Open Leads from the top menu. Start with Needs attention, review the summary and contact details, then open the enquiry to update its status, priority, and follow-up date.';
  if (value.includes('job') || value.includes('assign') || value.includes('technician')) return 'Open Jobs to create or review work. Open a job, choose a technician with the right skills and availability, then save the assignment. Use Calendar to confirm the visit time.';
  if (value.includes('setup') || value.includes('onboard') || value.includes('hours')) return 'Open More → Setup. Complete business details, services, hours, service area, escalation contacts, call rules, and never-promise rules. Save each section and review the readiness summary.';
  if (value.includes('calendar') || value.includes('schedule')) return 'Open Calendar to switch between year, month, week, day, and hour views. Select a scheduled visit to open the linked job and verify the assigned technician.';
  if (value.includes('notification') || value.includes('urgent')) return 'Open Notifications to see new leads, urgent jobs, unassigned work, and visits that need attention. Select an item to jump directly to its record.';
  if (value.includes('billing') || value.includes('pay')) return 'Open More → Billing to review the client-facing plan and payment instructions. Payment collection stays separate from operational records unless it is explicitly enabled and tested.';
  if (value.includes('automation') || value.includes('sms') || value.includes('email')) return 'Open Integrations to review controlled automation. Keep SMS, email, calendar writes, automatic booking, payments, and dispatch off until the owner approves a test plan and rollback path.';
  if (value.includes('report') || value.includes('roi')) return 'Open Reports to review captured leads, conversion signals, scheduled visits, workload, and the editable recovery estimate. Treat ROI as an estimate until real revenue data is connected.';
  return 'I can help with leads, jobs, technicians, calendar, setup, notifications, billing, reports, and controlled automation. Ask me what you want to do next.';
}

export function DashboardGuide() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ role: 'guide', text: 'Hi — I can guide you around this workspace. What would you like to do?' }]);
  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setMessages(current => [...current, { role: 'user', text: trimmed }, { role: 'guide', text: answerFor(trimmed) }]);
    setDraft('');
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); ask(draft); }
  return <aside className={`dashboard-guide${open ? ' is-open' : ''}`} aria-label="Cevanta dashboard guide">
    {open && <div className="dashboard-guide-panel" role="dialog" aria-label="Cevanta dashboard guide"><div className="dashboard-guide-heading"><div><span className="eyebrow">CEVANTA GUIDE</span><strong>Dashboard help</strong></div><button className="icon-button" type="button" aria-label="Close dashboard guide" onClick={() => setOpen(false)}>×</button></div><div className="dashboard-guide-messages" aria-live="polite">{messages.map((message, index) => <p className={`dashboard-guide-message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</p>)}</div><div className="dashboard-guide-quick">{quickQuestions.map(question => <button key={question} type="button" onClick={() => ask(question)}>{question}</button>)}</div><form className="dashboard-guide-form" onSubmit={submit}><label className="visually-hidden" htmlFor="dashboard-guide-question">Ask about this dashboard</label><input id="dashboard-guide-question" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask how to use the dashboard"/><button className="button" type="submit">Ask</button></form><small>Built-in guidance stays in this browser; it does not send workspace data to an AI provider.</small></div>}
    {!open && <button className="dashboard-guide-launcher" type="button" aria-expanded={open} onClick={() => setOpen(true)}><span aria-hidden="true">✦</span> Dashboard help</button>}
  </aside>;
}

