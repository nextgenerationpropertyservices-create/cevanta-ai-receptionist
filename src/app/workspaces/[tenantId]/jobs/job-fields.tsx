'use client';
import {useId,useState} from 'react';
import type { Customer,ServiceLocation } from '@/lib/contracts';
import type { Job } from '@/lib/jobs-contracts';
import { Field } from '@/components/action-form';

type TechnicianOption={user_id:string;display_name:string};
export function JobFields({customers=[],locations=[],technicians,job,title='',description='',customerId='',priority='normal',lockCustomer=false}: {customers?:Customer[];locations?:ServiceLocation[];technicians:TechnicianOption[];job?:Job;title?:string;description?:string;customerId?:string;priority?:Job['priority'];lockCustomer?:boolean}) {
 const [selectedCustomer,setSelectedCustomer]=useState(customerId);
 const [selectedLocation,setSelectedLocation]=useState('');
 const [status,setStatus]=useState<Job['status']>(job?.status ?? 'new');
 const hintId=useId();
 const missingAssignment=!!job?.assigned_user_id && !technicians.some(technician=>technician.user_id===job.assigned_user_id);
 return <>
  <Field label="Job title" name="title" required maxLength={160} defaultValue={job?.title ?? title}/>
  <label className="field"><span>Work description <span className="required">*</span></span><textarea required name="description" maxLength={4000} rows={4} defaultValue={job?.description ?? description}/></label>
  {!job && <><label className="field"><span>Customer (optional)</span><select name="customer_id" value={selectedCustomer} onChange={event=>{setSelectedCustomer(event.target.value);setSelectedLocation('');}}>{!lockCustomer && <option value="">No linked customer</option>}{customers.map(customer=><option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label><label className="field"><span>Service location (optional)</span><select name="service_location_id" value={selectedLocation} onChange={event=>setSelectedLocation(event.target.value)}><option value="">No linked location</option>{locations.filter(location=>location.customer_id===selectedCustomer).map(location=><option key={location.id} value={location.id}>{customers.find(customer=>customer.id===location.customer_id)?.name ?? 'Customer'} — {location.label}</option>)}</select></label><p className="muted small">Locations are shown for the selected customer. Customer and location links are set when the job is created.</p></>}
  {job && <p className="muted">Customer, location and source enquiry links remain as originally recorded.</p>}
  <div className="form-row"><label className="field"><span>Status</span><select name="status" required value={status} onChange={event=>setStatus(event.target.value as Job['status'])}><option value="new">New</option><option value="scheduled">Scheduled</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><label className="field"><span>Priority</span><select name="priority" required defaultValue={job?.priority ?? priority}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label></div>
  <label className="field"><span>Scheduled date{status==='scheduled' && <span className="required"> *</span>}</span><input name="scheduled_date" type="date" required={status==='scheduled'} defaultValue={job?.scheduled_date ?? ''} aria-describedby={hintId}/></label>
  <p id={hintId} className="muted small">A date is required for scheduled jobs. Dates use the workspace’s local calendar day.</p>
  <label className="field"><span>Assigned technician</span><select name="assigned_user_id" defaultValue={job?.assigned_user_id ?? ''}><option value="">Unassigned</option>{missingAssignment && <option value={job?.assigned_user_id ?? ''}>Previously assigned technician — choose an assignment</option>}{technicians.map(technician=><option key={technician.user_id} value={technician.user_id}>{technician.display_name}</option>)}</select></label>
  {missingAssignment && <p className="notice" role="status">The previously assigned technician is no longer available. Choose an active technician or explicitly select Unassigned before saving.</p>}
  {!technicians.length && <p className="notice">No technicians are available in this workspace. You can save the job as unassigned.</p>}
 </>;
}
export function JobsSetupNotice() {return <section className="panel"><h2>Jobs need setup</h2><p className="notice">Ask the workspace owner to apply the reviewed dispatch and jobs database migration in the development Supabase project, then refresh this page.</p></section>;}
