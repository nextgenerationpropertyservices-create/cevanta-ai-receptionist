import Link from 'next/link';
import {getWorkspace} from '@/lib/server/queries';

const checklist = [
  'Create or copy the client-specific Stripe payment link or invoice outside Cevanta.',
  'Send it manually to the business owner using your approved sales process.',
  'Confirm the $497 setup fee before live setup work starts.',
  'Confirm the $297/month managed pilot before the pilot stays active.',
  'Record payment confirmation in your internal notes until billing storage is added.',
];
const disabled = [
  'No credit card form or payment collection in Cevanta.',
  'No automatic subscriptions, failed-payment dunning, refunds, taxes or receipts in this app yet.',
  'No SMS/email, external calendar write, automatic booking, payment collection or dispatch automation is triggered here.',
];

export default async function BillingPage({params}:{params:Promise<{tenantId:string}>}) {
 const {tenantId}=await params;
 const {tenant,role}=await getWorkspace(tenantId);
 const base=`/workspaces/${tenant.id}`;
 return <>
  <div className="page-heading"><span className="eyebrow">BILLING</span><h1>Manual pilot billing checklist.</h1><p>Use this page to keep the first managed pilot offer clear without collecting payment inside Cevanta.</p></div>
  <section className="front-office-hero"><div><span className="eyebrow">FIRST PILOT OFFER</span><h2>$497 setup + $297/month</h2><p>{tenant.name} is currently handled as a managed pilot. Payment is confirmed manually before live setup and ongoing pilot support. This page is guidance only; it does not charge, subscribe, invoice, refund or store card details.</p><div className="button-row"><Link className="button secondary" href={`${base}/clients`}>Back office ↗</Link><Link className="button secondary" href={`${base}/integrations`}>Automation gates ↗</Link></div></div><div className="roi-card"><span className="eyebrow">PAYMENT MODE</span><strong>Manual</strong><p>Use Stripe payment links or manual invoices for the first client. Add full subscriptions after the pilot sales flow is proven.</p><small>Your access: {role}. Billing setup does not change workspace permissions.</small></div></section>
  <div className="split-layout"><section className="panel"><span className="eyebrow">DO THIS FOR EACH CLIENT</span><h2>Manual payment workflow</h2><ol className="setup-readiness-list">{checklist.map(item=><li key={item}>{item}</li>)}</ol></section><section className="panel"><span className="eyebrow">SAFETY BOUNDARY</span><h2>What remains off</h2><ul className="setup-readiness-list">{disabled.map(item=><li key={item}>{item}</li>)}</ul></section></div>
  <section className="panel"><span className="eyebrow">NEXT VERSION</span><h2>What full billing should add later</h2><div className="dispatch-summary"><article><span>1</span><strong>Payment status</strong><p className="small muted">Track setup paid, monthly active, overdue and cancelled.</p></article><article><span>2</span><strong>Stripe subscriptions</strong><p className="small muted">Create subscriptions only after a reviewed payment design.</p></article><article><span>3</span><strong>Receipts and taxes</strong><p className="small muted">Add proper receipt, tax and refund handling before self-service billing.</p></article><article><span>4</span><strong>Client portal</strong><p className="small muted">Let clients manage billing only after access and support rules are verified.</p></article></div></section>
 </>;
}
