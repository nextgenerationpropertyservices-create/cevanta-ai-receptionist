import type { Customer } from '@/lib/contracts';
import type { Lead } from '@/lib/intake-contracts';
import { Field } from '@/components/action-form';

export function IntakeFields({customers,lead}: {customers: Customer[];lead?: Lead}) {
  return <>
    <Field label="Enquiry name" name="name" required maxLength={160} defaultValue={lead?.name}/>
    <Field label="Email" name="email" type="email" maxLength={254} defaultValue={lead?.email ?? ''}/>
    <Field label="Phone" name="phone" type="tel" maxLength={40} defaultValue={lead?.phone ?? ''}/>
    {lead ? <p className="muted">Linked customer: {customers.find(customer => customer.id === lead.customer_id)?.name ?? 'No linked customer'}. Customer links are set when creating an enquiry.</p> : <label className="field"><span>Existing customer (optional)</span><select name="customer_id" defaultValue=""><option value="">No linked customer</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>}
    <label className="field"><span>Service request <span className="required">*</span></span><textarea required name="description" maxLength={4000} rows={4} defaultValue={lead?.description ?? ''}/></label>
    <div className="form-row">
      <label className="field"><span>Priority <span className="required">*</span></span><select name="priority" required defaultValue={lead?.priority ?? 'normal'}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
      <label className="field"><span>Status <span className="required">*</span></span><select name="status" required defaultValue={lead?.status ?? 'new'}><option value="new">New</option><option value="contacted">Contacted</option><option value="scheduled">Scheduled</option><option value="closed">Closed</option></select></label>
    </div>
    <Field label="Follow-up date" name="follow_up_date" type="date" defaultValue={lead?.follow_up_date ?? ''}/>
  </>;
}
export function IntakeSetupNotice() {
  return <section className="panel"><h2>Lead inbox needs setup</h2><p className="notice">Ask the workspace owner to apply the reviewed service intake database migration in the development Supabase project, then refresh this page.</p></section>;
}
