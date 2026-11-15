import Link from 'next/link';
import { automationStateLabel } from '@/lib/automation-controls';
import { getAutomationControls } from '@/lib/server/automation-control-queries';
import {getWorkspace} from '@/lib/server/queries';
import {getWorkspacePlanSummary} from '@/lib/server/workspace-plan-queries';

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
 const [{tenant,role},planSummary]=await Promise.all([getWorkspace(tenantId),getWorkspacePlanSummary(tenantId)]);
 const base=`/workspaces/${tenant.id}`;
 if (planSummary.plan === 'unavailable') return <>
  <div className="page-heading"><span className="eyebrow">BILLING</span><h1>Plan information is temporarily unavailable.</h1><p>We cannot safely show pricing or plan benefits until this workspace&apos;s plan is verified.</p></div>
  <section className="panel" role="status"><span className="eyebrow">NO PLAN ASSUMED</span><h2>Billing and connected services remain unchanged.</h2><p>This page has not assumed a free or managed plan. No payment, subscription, messaging, booking, calendar, or dispatch action was started.</p><div className="button-row"><Link className="button secondary" href={base}>Return to overview</Link><Link className="button secondary" href={`${base}/manual`}>Open the dashboard guide</Link></div></section>
 </>;
 if (planSummary.plan === 'free') return <>
  <div className="page-heading"><span className="eyebrow">BILLING</span><h1>Your free Cevanta workspace.</h1><p>Use the dashboard at no charge and upgrade only when managed answering or connected automation is a good fit.</p></div>
  <section className="front-office-hero"><div><span className="eyebrow">CURRENT PLAN</span><h2>$0/month</h2><p>No payment method is required. Your free workspace includes customer records, manual jobs, the internal calendar, reports, up to 50 active leads, and up to two technician roster entries.</p><div className="button-row"><Link className="button secondary" href={`${base}/manual`}>Read the dashboard guide ↗</Link><Link className="button secondary" href={`${base}`}>Return to overview</Link></div></div><div className="roi-card"><span className="eyebrow">CURRENT USAGE</span><strong>{planSummary.remaining.activeLeads}</strong><p>active lead spaces remaining</p><small>{planSummary.usage.technicianRoster} of {planSummary.limits.technicianRoster} technician roster spots used.</small></div></section>
  <div className="split-layout"><section className="panel"><span className="eyebrow">INCLUDED FREE</span><h2>Run the manual front office</h2><ul className="setup-readiness-list"><li>Customer, location, and equipment records.</li><li>Manual leads, jobs, follow-up, and internal calendar.</li><li>Reports and an editable ROI estimator.</li><li>No trial deadline and no automatic charge.</li></ul></section><section className="panel"><span className="eyebrow">UPGRADE WHEN READY</span><h2>Add managed services later</h2><p>AI phone answering, SMS/email, external calendar writes, live booking, payment collection, automatic dispatch, and reactivation are not active on the free plan.</p><p>Activation requires the right plan, owner approval, provider configuration, a successful test, and a rollback plan.</p><Link className="button" href={`${base}/integrations`}>Review available upgrades ↗</Link></section></div>
 </>;
 const {controls,canManage}=await getAutomationControls(tenantId);
 const paymentControls=controls.filter(control => control.capability === 'payment_collection' || control.capability === 'subscription_billing');
 return <>
  <div className="page-heading"><span className="eyebrow">BILLING</span><h1>Your Cevanta pilot billing.</h1><p>See the current pilot price, what is included, and which payment features still require approval before they go live.</p></div>
  <section className="front-office-hero"><div><span className="eyebrow">CURRENT PILOT PLAN</span><h2>$497 setup + $297/month</h2><p>{tenant.name} is on a managed pilot path. The setup fee covers guided setup and readiness review. The monthly pilot covers dashboard access, office-review workflow, and managed support while live automation remains controlled.</p><div className="button-row"><Link className="button secondary" href={`${base}/manual`}>Read billing guide ↗</Link><Link className="button secondary" href={`${base}/integrations`}>Review payment options ↗</Link><Link className="button secondary" href={`${base}/go-live`}>Go Live billing gates ↗</Link></div></div><div className="roi-card"><span className="eyebrow">PAYMENT STATUS</span><strong>Manual confirmation</strong><p>Your operator confirms payment outside this dashboard using an approved invoice or payment link. Cevanta does not collect card details on this page.</p><small>Your access: {role}. Billing visibility does not change workspace permissions.</small></div></section>
  <div className="split-layout"><section className="panel"><span className="eyebrow">WHAT TO EXPECT</span><h2>How pilot payment works</h2><ol className="setup-readiness-list">{paymentExpectations.map(item=><li key={item}>{item}</li>)}</ol></section><section className="panel"><span className="eyebrow">SAFETY BOUNDARY</span><h2>What remains off</h2><ul className="setup-readiness-list">{disabled.map(item=><li key={item}>{item}</li>)}</ul></section></div>
  <section className="panel"><div className="section-heading"><div><span className="eyebrow">PAYMENT AUTOMATION OPTIONS</span><h2>Collection and subscription gates</h2><p>These settings are managed from Integrations and shown here so billing risk stays visible.</p></div><Link className="button secondary" href={`${base}/integrations`}>Edit automation gates ↗</Link></div><div className="dispatch-summary">{paymentControls.map(control=><article key={control.capability}><span>{canManage ? automationStateLabel(control.activation_state) : 'Status restricted'}</span><strong>{control.label}</strong><p className="small muted">{canManage ? control.summary : 'This billing option exists in the catalog. Current approval and activation status are restricted to owners and admins.'}</p></article>)}</div></section>
  <section className="panel"><span className="eyebrow">FUTURE BILLING OPTIONS</span><h2>What can be added after the pilot is proven</h2><div className="dispatch-summary"><article><span>1</span><strong>Payment status</strong><p className="small muted">Track setup paid, monthly active, overdue and cancelled.</p></article><article><span>2</span><strong>Stripe subscriptions</strong><p className="small muted">Create subscriptions only after a reviewed payment design.</p></article><article><span>3</span><strong>Receipts and taxes</strong><p className="small muted">Add proper receipt, tax and refund handling before self-service billing.</p></article><article><span>4</span><strong>Client portal</strong><p className="small muted">Let clients manage billing only after access and support rules are verified.</p></article></div></section>
 </>;
}
