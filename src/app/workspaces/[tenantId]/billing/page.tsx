import Link from 'next/link';
import { automationStateLabel } from '@/lib/automation-controls';
import { getAutomationControls } from '@/lib/server/automation-control-queries';
import {getWorkspace} from '@/lib/server/queries';

const paymentExpectations = [
  'The current pilot offer is $497 setup plus $297 per month.',
  'Your Cevanta operator will confirm payment using an approved payment link or invoice outside this dashboard.',
  'Setup work starts after the setup payment is confirmed.',
  'Monthly pilot support stays active while the monthly payment is current.',
  'In-app payment collection and subscriptions remain optional future features that require separate approval and testing.',
];
const disabled = [
  'No credit card form is shown in Cevanta until payment collection is approved, tested and released.',
  'No automatic subscriptions, failed-payment dunning, refunds, taxes or receipts run from this page yet.',
  'No SMS/email, external calendar write, automatic booking, payment collection or dispatch automation is triggered here.',
];

export default async function BillingPage({params}:{params:Promise<{tenantId:string}>}) {
 const {tenantId}=await params;
 const {tenant,role}=await getWorkspace(tenantId);
 const {controls,canManage}=await getAutomationControls(tenantId);
 const paymentControls=controls.filter(control => control.capability === 'payment_collection' || control.capability === 'subscription_billing');
 const base=`/workspaces/${tenant.id}`;
 return <>
  <div className="page-heading"><span className="eyebrow">BILLING</span><h1>Your Cevanta pilot billing.</h1><p>See the current pilot price, what is included, and which payment features still require approval before they go live.</p></div>
  <section className="front-office-hero"><div><span className="eyebrow">CURRENT PILOT PLAN</span><h2>$497 setup + $297/month</h2><p>{tenant.name} is on a managed pilot path. The setup fee covers guided setup and readiness review. The monthly pilot covers dashboard access, office-review workflow, and managed support while live automation remains controlled.</p><div className="button-row"><Link className="button secondary" href={`${base}/manual`}>Read billing guide ↗</Link><Link className="button secondary" href={`${base}/integrations`}>Review payment options ↗</Link></div></div><div className="roi-card"><span className="eyebrow">PAYMENT STATUS</span><strong>Manual confirmation</strong><p>Your operator confirms payment outside this dashboard using an approved invoice or payment link. Cevanta does not collect card details on this page.</p><small>Your access: {role}. Billing visibility does not change workspace permissions.</small></div></section>
  <div className="split-layout"><section className="panel"><span className="eyebrow">WHAT TO EXPECT</span><h2>How pilot payment works</h2><ol className="setup-readiness-list">{paymentExpectations.map(item=><li key={item}>{item}</li>)}</ol></section><section className="panel"><span className="eyebrow">SAFETY BOUNDARY</span><h2>What remains off</h2><ul className="setup-readiness-list">{disabled.map(item=><li key={item}>{item}</li>)}</ul></section></div>
  <section className="panel"><div className="section-heading"><div><span className="eyebrow">PAYMENT AUTOMATION OPTIONS</span><h2>Collection and subscription gates</h2><p>These settings are managed from Integrations and shown here so billing risk stays visible.</p></div><Link className="button secondary" href={`${base}/integrations`}>Edit automation gates ↗</Link></div><div className="dispatch-summary">{paymentControls.map(control=><article key={control.capability}><span>{canManage ? automationStateLabel(control.activation_state) : 'Status restricted'}</span><strong>{control.label}</strong><p className="small muted">{canManage ? control.summary : 'This billing option exists in the catalog. Current approval and activation status are restricted to owners and admins.'}</p></article>)}</div></section>
  <section className="panel"><span className="eyebrow">FUTURE BILLING OPTIONS</span><h2>What can be added after the pilot is proven</h2><div className="dispatch-summary"><article><span>1</span><strong>Payment status</strong><p className="small muted">Track setup paid, monthly active, overdue and cancelled.</p></article><article><span>2</span><strong>Stripe subscriptions</strong><p className="small muted">Create subscriptions only after a reviewed payment design.</p></article><article><span>3</span><strong>Receipts and taxes</strong><p className="small muted">Add proper receipt, tax and refund handling before self-service billing.</p></article><article><span>4</span><strong>Client portal</strong><p className="small muted">Let clients manage billing only after access and support rules are verified.</p></article></div></section>
 </>;
}
