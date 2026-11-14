import Link from "next/link";
import styles from "./permitdesk.module.css";
import { requirePermitWorkspace } from "@/lib/server/permits";
import { permitStatusLabels, permitLanes, permitLane, type Permit, type PermitOperations } from "@/lib/permit-contracts";

export default async function PermitsPage({params,searchParams}:{params:Promise<{tenantId:string}>;searchParams:Promise<{q?:string;lane?:string;view?:string}>}){
 const {tenantId}=await params;
 const {client,tenant}=await requirePermitWorkspace(tenantId);
 const {q,lane,view}=await searchParams;
 const search=typeof q==="string"?q.slice(0,100).trim().toLowerCase():"";
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:tenant.timezone,year:"numeric",month:"2-digit",day:"2-digit"}).format();
 const {data,error}=await client.from("job_permits").select("id,title,site,jurisdiction,status,next_followup,utility_status,inspection_status,first_inspection,blocker,expires_on,issued_on,submitted_on,inspection_date,work_on,disconnect_on,reconnect_on").eq("tenant_id",tenantId).order("updated_at",{ascending:false}).limit(200);
 const base=`/workspaces/${tenantId}/permits`;
 const permits=(data??[]) as (Pick<Permit,"id"|"title"|"site"|"jurisdiction"|"status"|"next_followup"> & Pick<PermitOperations,"utility_status"|"inspection_status"|"first_inspection"|"blocker"|"expires_on"|"issued_on"|"inspection_date"|"work_on"|"disconnect_on"|"reconnect_on"> & Pick<Permit,"submitted_on">)[];
 const workArea = view === "utility" ? permits.filter(p=>p.utility_status!=="not_required") : view === "inspections" ? permits.filter(p=>p.inspection_status!=="not_scheduled") : view === "closeout" ? permits.filter(p=>p.status==="closed" || p.inspection_status==="passed") : view === "field" ? permits.filter(p=>["draft","ready"].includes(p.status)) : permits;
 const shown=workArea.filter(p=>[p.title,p.site,p.jurisdiction].some(value=>value.toLowerCase().includes(search))&&(!lane||permitLane(p)===lane));
 const csvCell=(value:string|null)=>{
  const text=value??"";
  const safe=/^[\s\uFEFF]*[=+@-]|^[\t\r\n]/.test(text)?"'"+text:text;
  return '"'+safe.replaceAll('"','""')+'"';
 };
 const csv=shown.length?[
  ["Permit","Address","Jurisdiction","Status","Follow-up"],
  ...shown.map(p=>[p.title,p.site,p.jurisdiction,permitStatusLabels[p.status],p.next_followup]),
 ].map(row=>row.map(csvCell).join(",")).join("\r\n"):null;
 const open=permits.filter(p=>p.status!=="closed");
 const alerts=open.filter(p=>p.blocker||p.inspection_status==="corrections"||(p.next_followup&&p.next_followup<=today)||(p.expires_on&&p.expires_on<=today));
 const horizon=new Date(Date.parse(today)+14*86400000).toISOString().slice(0,10);
 const upcoming=open.flatMap(p=>([[p.work_on,"Work"],[p.inspection_date,"Inspection"],[p.disconnect_on,"Utility disconnect"],[p.reconnect_on,"Utility reconnect"],[p.expires_on,"Expiration"]] as const).flatMap(([date,label])=>date&&date>=today&&date<=horizon?[{id:p.id,title:p.title,date,label}]:[])).sort((a,b)=>a.date.localeCompare(b.date));
 const first=permits.filter(p=>["passed","corrections"].includes(p.first_inspection.toLowerCase()));
 const approvalDays=permits.flatMap(p=>p.issued_on&&p.submitted_on&&p.issued_on>=p.submitted_on?[(Date.parse(p.issued_on)-Date.parse(p.submitted_on))/86400000]:[]);
 const average=approvalDays.length?Math.round(approvalDays.reduce((sum,days)=>sum+days,0)/approvalDays.length):null;
 const nav=[['Overview',base],['Permit Queue',base+'?view=queue'],['Field Intake',base+'?view=field'],['Utility Coordination',base+'?view=utility'],['Inspections',base+'?view=inspections'],['Closeout',base+'?view=closeout'],['AHJ Matrix',base+'/library#jurisdictions'],['Scope Templates',base+'/library#templates'],['Documents',base+'/documents']];
 return <><nav className="permitdesk-subnav" aria-label="PermitDesk">{nav.map(([label,href])=><Link key={label} aria-current={(view===undefined&&label==='Overview')||(view==='queue'&&label==='Permit Queue')||(view==='field'&&label==='Field Intake')||(view==='utility'&&label==='Utility Coordination')||(view==='inspections'&&label==='Inspections')||(view==='closeout'&&label==='Closeout')?"page":undefined} href={href}>{label}</Link>)}</nav><div className="page-heading"><span className="eyebrow">PERMITDESK</span><h1>{view==='utility'?'Utility coordination':view==='inspections'?'Inspections':view==='closeout'?'Closeout':view==='field'?'Field intake':'Permit operations'}</h1><p>Keep permits, inspections, utilities, documents, and office follow-up in one place.</p><Link className="button" href={`${base}/new`}>Create permit</Link> <Link className="button secondary" href={base+"/library"}>Open permit library</Link></div>
 {!view && !error && <>
  <div className={styles.metrics}>
   <article className="panel"><span>Active in-flight permits</span><strong>{open.length}</strong></article>
   <article className="panel"><span>Avg. approval cycle</span><strong>{average === null ? "—" : `${average} days`}</strong></article>
   <article className="panel"><span>First-pass inspections</span><strong>{first.length ? `${Math.round(100 * first.filter(p => p.first_inspection.toLowerCase() === "passed").length / first.length)}%` : "—"}</strong></article>
   <article className="panel"><span>Needs attention</span><strong>{alerts.length}</strong></article>
  </div>
  <section className="panel"><h2>Permit pipeline</h2><div className={styles.stages}>
   {permitLanes.map(stage => <Link key={stage} href={`${base}?view=queue&lane=${encodeURIComponent(stage)}`}>{stage} <strong>{permits.filter(permit => permitLane(permit) === stage).length}</strong></Link>)}
  </div></section>
 </>}
  <section className="panel"><h2>Needs attention</h2>
 {!error && alerts.length === 0 && <p className="muted">No open blockers or deadline alerts.</p>}
 {alerts.length>0&&<ul>{alerts.map(p=><li key={p.id}><Link href={base+"/"+p.id}>{p.title}</Link> · {p.blocker||"Review dates or inspection corrections"}</li>)}</ul>}
 <h3>Next 14 days</h3>{!error&&(upcoming.length?<ul>{upcoming.map(p=><li key={p.id+p.label}><Link href={base+"/"+p.id}>{p.title}</Link> · {p.label} · {p.date}</li>)}</ul>:<p className="muted">No upcoming milestones.</p>)}
 </section>
 <section className="panel"><h2>Permit queue</h2>{csv&&<a className="card-link" download="permit-queue.csv" href={"data:text/csv;charset=utf-8,"+encodeURIComponent(csv)}>Download filtered CSV</a>}{permits.length===200&&<p className="muted">Queue and totals use the 200 most recently updated permits.</p>}
 <form>{view && <input type="hidden" name="view" value={view}/>}<label className="field"><span>Search permits</span><input name="q" defaultValue={search} maxLength={100}/></label><label className="field"><span>Workflow stage</span><select name="lane" defaultValue={lane??""}><option value="">All stages</option>{permitLanes.map(stage=><option key={stage}>{stage}</option>)}</select></label><button className="button secondary" type="submit">Filter</button></form>{error?<p role="alert">The permit queue is unavailable. Refresh and try again.</p>:shown.length===0?<p>{search||lane?"No permits match your filters.":"No permits in this work area yet."}</p>:<div className="table-scroll"><table><thead><tr><th>Project</th><th>Jurisdiction</th><th>Stage</th><th>Next follow-up</th></tr></thead><tbody>{shown.map(permit => <tr key={permit.id}><td><Link className="card-link" href={`${base}/${permit.id}`}>{permit.title}</Link><p className="small muted">{permit.site}</p></td><td>{permit.jurisdiction}</td><td>{permitLane(permit)}</td><td>{permit.next_followup ?? "—"}</td></tr>)}</tbody></table></div>}</section></>;
}
