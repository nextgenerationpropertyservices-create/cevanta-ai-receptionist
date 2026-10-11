import { getWorkspace } from '@/lib/server/queries';
import { getJobs,getTeamMembers } from '@/lib/server/jobs-queries';
import { canManageSettings } from '@/lib/contracts';
import { saveTeamMember } from '@/app/actions/team';
import { ActionForm,Field } from '@/components/action-form';
import { Empty } from '@/components/ui';

export default async function Technicians({params}:{params:Promise<{tenantId:string}>}) {
 const {tenantId}=await params;
 const workspace=await getWorkspace(tenantId);
 if(!canManageSettings(workspace.role)) return <section className="panel"><h1>Technicians</h1><p className="notice">Owner or admin access is required to add or edit technicians.</p></section>;
 const [team,jobs]=await Promise.all([getTeamMembers(tenantId),getJobs(tenantId)]);
 if(!team.ready) return <section className="panel"><h1>Technicians need setup</h1><p className="notice">Apply the team-management database migration before editing technicians.</p></section>;
 const members=team.members;
 const technicians=members.filter(member=>member.role==='technician');
 const openJobs=jobs.ready ? jobs.jobs.filter(job=>job.status!=='completed'&&job.status!=='cancelled') : [];
 const workload=(userId:string)=>openJobs.filter(job=>job.assigned_user_id===userId);
 return <>
  <div className="page-heading dispatch-heading"><div><span className="eyebrow">FIELD TEAM</span><h1>Add, edit, and assign technicians.</h1><p>Use confirmed Cevanta user emails. Technicians added here become available in job assignment and calendar views.</p></div><span className="pill">OWNER / ADMIN</span></div>
  <section className="front-office-stats" aria-label="Technician summary"><article><span>Technicians</span><strong>{technicians.length}</strong><p>Available for assignment</p></article><article><span>Open assigned jobs</span><strong>{openJobs.filter(job=>job.assigned_user_id).length}</strong><p>Across active field team</p></article><article><span>Unassigned jobs</span><strong>{openJobs.filter(job=>!job.assigned_user_id).length}</strong><p>Needs dispatch review</p></article><article><span>Team accounts</span><strong>{members.length}</strong><p>Owner, admin, dispatcher, tech, viewer</p></article></section>
  <div className="front-office-grid"><section className="panel"><div className="section-heading"><div><span className="eyebrow">TECHNICIAN ROSTER</span><h2>Field team workload</h2></div></div>{technicians.length ? <div className="tech-roster-list">{technicians.map(tech=>{const assigned=workload(tech.user_id);return <article key={tech.user_id}><div><strong>{tech.display_name}</strong><span>{tech.email}</span></div><p>{assigned.length} open job{assigned.length===1?'':'s'} assigned</p><small>{assigned[0]?.title ?? 'No active assignment shown'}</small><details className="dispatch-create"><summary>Edit technician role</summary><ActionForm action={saveTeamMember} submitLabel="Save role" hidden={{tenantId,email:tech.email}}><label className="field"><span>Role</span><select name="role" defaultValue="technician"><option value="technician">Technician</option><option value="dispatcher">Dispatcher</option><option value="viewer">Viewer</option></select></label></ActionForm></details></article>})}</div> : <Empty title="No technicians yet">Add a confirmed Cevanta account as a technician, then assign jobs to them from Jobs.</Empty>}</section>
   <section className="panel"><div className="section-heading"><div><span className="eyebrow">ADD TECHNICIAN</span><h2>Add a confirmed user</h2></div></div><p className="small muted">The person must create and confirm a Cevanta account first. This keeps workspace access tied to a verified login.</p><ActionForm action={saveTeamMember} submitLabel="Add technician" hidden={{tenantId,role:'technician'}}><Field label="Technician email" name="email" type="email" required autoComplete="email"/></ActionForm><div className="notice"><strong>Safe setup rule:</strong> this does not send invites yet. Create the user account first, then add the email here.</div></section></div>
  <section className="panel"><div className="section-heading"><div><span className="eyebrow">ALL TEAM ACCESS</span><h2>Edit non-owner workspace roles</h2></div></div><div className="team-table"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Change role</th></tr></thead><tbody>{members.map(member=><tr key={member.user_id}><td>{member.display_name}</td><td>{member.email}</td><td>{member.role}</td><td>{member.role==='owner' ? 'Owner protected' : <ActionForm action={saveTeamMember} submitLabel="Update" hidden={{tenantId,email:member.email}}><label className="field"><span className="visually-hidden">Role for {member.email}</span><select name="role" defaultValue={member.role}><option value="dispatcher">Dispatcher</option><option value="technician">Technician</option><option value="viewer">Viewer</option></select></label></ActionForm>}</td></tr>)}</tbody></table></div></section>
 </>;
}
