'use client';
import {useId} from 'react';
import type {Appointment} from '@/lib/appointments-contracts';
import type {Job} from '@/lib/jobs-contracts';
import {Field} from '@/components/action-form';

export function AppointmentFields({jobs,appointment}:{jobs:Job[];appointment?:Appointment}) {
 const hint=useId();
 const utcValue=(value?:string)=>value ? new Date(value).toISOString().slice(0,19) : '';
 return <>
  {!appointment && <label className="field"><span>Job <span className="required">*</span></span><select required name="job_id" defaultValue=""><option value="" disabled>Select a job</option>{jobs.map(job=><option key={job.id} value={job.id}>{job.title}</option>)}</select></label>}
  <Field label="Appointment title" name="title" required maxLength={160} defaultValue={appointment?.title}/>
  <p id={hint} className="notice">Enter both times in UTC. The end must be after the start, within seven days. This calendar does not check scheduling conflicts.</p>
  <div className="form-row"><label className="field"><span>Start (UTC) <span className="required">*</span></span><input type="datetime-local" step="1" name="starts_at" required defaultValue={utcValue(appointment?.starts_at)} aria-describedby={hint}/></label><label className="field"><span>End (UTC) <span className="required">*</span></span><input type="datetime-local" step="1" name="ends_at" required defaultValue={utcValue(appointment?.ends_at)} aria-describedby={hint}/></label></div>
  <label className="field"><span>Status</span><select name="status" required defaultValue={appointment?.status ?? 'scheduled'}><option value="scheduled">Scheduled</option><option value="cancelled">Cancelled</option></select></label>
  {appointment && <p className="muted small">The appointment stays linked to its original job. Choose Cancelled to cancel this appointment.</p>}
 </>;
}

export function CalendarSetupNotice() {return <section className="panel"><h1>Calendar needs setup</h1><p>Ask the workspace owner to apply the reviewed appointments database migration, then refresh this page.</p></section>;}
