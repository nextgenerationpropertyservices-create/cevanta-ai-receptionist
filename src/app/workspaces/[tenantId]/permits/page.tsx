import Link from "next/link";
import { requirePermitWorkspace } from "@/lib/server/permits";
import { permitStatusLabels, permitLanes, permitLane, type Permit, type PermitOperations } from "@/lib/permit-contracts";

export default async function PermitsPage({params,searchParams}:{params:Promise<{tenantId:string}>;searchParams:Promise<{q?:string;lane?:string}>}){
 const {tenantId}=await params;
 const {client,tenant}=await requirePermitWorkspace(tenantId);
 const {q,lane}=await searchParams;
 const search=typeof q==="string"?q.slice(0,100).trim().toLowerCase():"";
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:tenant.timezone,year:"numeric",month:"2-digit",day:"2-digit"}).format();
 const {data,error}=await client.from("job_permits").select("id,title,site,jurisdiction,status,next_followup,utility_status,inspection_status,first_inspection,blocker,expires_on,issued_on,submitted_on,inspection_date,work_on,disconnect_on,reconnect_on").eq("tenant_id",tenantId).order("updated_at",{ascending:false}).limit(200);
 const base=`/workspaces/${tenantId}/permits`;
 const permits=(data??[]) as (Pick<Permit,"id"|"title"|"site"|"jurisdiction"|"status"|"next_followup"> & Pick<PermitOperations,"utility_status"|"inspection_status"|"first_inspection"|"blocker"|"expires_on"|"issued_on"|"inspection_date"|"work_on"|"disconnect_on"|"reconnect_on"> & Pick<Permit,"submitted_on">)[];
 const shown=permits.filter(p=>[p.title,p.site,p.jurisdiction].some(value=>value.toLowerCase().includes(search))&&(!lane||permitLane(p)===lane));
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
 return <><div className="page-heading"><span className="eyebrow">PERMITDESK</span><h1>Permits</h1><p>Prepare applications and track filings inside your Cevanta workspace.</p><Link className="button" href={`${base}/new`}>New permit</Link> <Link className="button secondary" href={base+"/library"}>Permit library</Link> <Link className="card-link" href={base+"/feedback"}>Pilot feedback</Link></div>
  <section className="panel"><h2>Permit operations</h2>
 {!error&&<div className="stat-grid"><p>Open permits <strong>{open.length}</strong></p><p>Need attention <strong>{alerts.length}</strong></p><p>Average approval <strong>{average===null?"—":average+" days"}</strong></p><p>First inspections passed <strong>{first.filter(p=>p.first_inspection.toLowerCase()==="passed").length}/{first.length}</strong></p></div>}
 {alerts.length>0&&<ul>{alerts.map(p=><li key={p.id}><Link href={base+"/"+p.id}>{p.title}</Link> · {p.blocker||"Review dates or inspection corrections"}</li>)}</ul>}
 <h3>Next 14 days</h3>{!error&&(upcoming.length?<ul>{upcoming.map(p=><li key={p.id+p.label}><Link href={base+"/"+p.id}>{p.title}</Link> · {p.label} · {p.date}</li>)}</ul>:<p className="muted">No upcoming milestones.</p>)}
 </section>
 <section className="panel"><h2>Permit queue</h2>{csv&&<a className="card-link" download="permit-queue.csv" href={"data:text/csv;charset=utf-8,"+encodeURIComponent(csv)}>Download filtered CSV</a>}{permits.length===200&&<p className="muted">Queue and totals use the 200 most recently updated permits.</p>}
 <form><label className="field"><span>Search permits</span><input name="q" defaultValue={search} maxLength={100}/></label><label className="field"><span>Workflow stage</span><select name="lane" defaultValue={lane??""}><option value="">All stages</option>{permitLanes.map(stage=><option key={stage}>{stage}</option>)}</select></label><button className="button secondary" type="submit">Filter</button></form>{error?<p role="alert">The permit queue is unavailable. Refresh and try again.</p>:shown.length===0?<p>{search||lane?"No permits match your filters.":"No permits yet. Start here or create a permit from a job."}</p>:<div className="stat-grid">{permitLanes.map(status=>{const entries=shown.filter(permit=>permitLane(permit)===status); return <section className="panel" key={status}><h3>{status} ({entries.length})</h3>{entries.length===0?<p className="muted">No permits</p>:<ul>{entries.map(p=><li key={p.id}><Link className="card-link" href={`${base}/${p.id}`}>{p.title}</Link><p className="small muted">{p.site} · {p.jurisdiction} · {permitStatusLabels[p.status]}{p.next_followup?` · Follow-up ${p.next_followup}`:""}</p></li>)}</ul>}</section>;})}</div>}</section></>;
}
