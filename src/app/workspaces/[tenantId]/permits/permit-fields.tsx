import { Field } from "@/components/action-form";
import { permitStatusLabels, permitStatuses, type Permit } from "@/lib/permit-contracts";
import directory from "@/lib/permit-directory.json";

export function PermitFields({permit}:{permit?:Partial<Permit>}) {
 return <><Field name="title" label="Project name" required maxLength={160} defaultValue={permit?.title}/>
 <Field name="site" label="Service address" required maxLength={200} defaultValue={permit?.site}/>
 <label className="field"><span>Jurisdiction *</span><input name="jurisdiction" list="permit-jurisdictions" required maxLength={160} defaultValue={permit?.jurisdiction}/><datalist id="permit-jurisdictions">{directory.map(a=><option key={a.id} value={a.name}/>)}</datalist></label>
 <label className="field"><span>Electrical scope *</span><textarea name="scope" rows={5} required maxLength={4000} defaultValue={permit?.scope}/></label>
 {permit?.id&&<><label className="field"><span>Permit status</span><select name="status" defaultValue={permit.status}>{permitStatuses.map(s=><option key={s} value={s}>{permitStatusLabels[s]}</option>)}</select></label>
 <Field name="submitted_on" label="Actual submission date" type="date" defaultValue={permit.submitted_on??undefined}/>
 <Field name="permit_number" label="Town-issued permit number" maxLength={100} defaultValue={permit.permit_number}/>
 <Field name="next_followup" label="Next follow-up date" type="date" defaultValue={permit.next_followup??undefined}/>
 <Field name="closeout_reference" label="Final closure reference" maxLength={160} defaultValue={permit.closeout_reference}/>
 <Field name="closed_on" label="Actual closure date" type="date" defaultValue={permit.closed_on??undefined}/></>}
 </>;
}
