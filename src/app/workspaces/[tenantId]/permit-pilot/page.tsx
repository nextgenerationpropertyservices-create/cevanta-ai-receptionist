import { notFound } from "next/navigation";
import { setPermitPilotAccess } from "@/app/actions/permit-pilot";
import { getWorkspaceRecord } from "@/lib/server/queries";

type PilotOverview = {
  workspaces: { id: string; name: string; enabled: boolean; expires_at: string | null; expired: boolean; status: string; permitdesk_only: boolean }[];
  feedback: { id: string; name: string; category: string; rating: number | null; message: string; review: string; allow_quote: boolean; created_at: string }[];
};

export default async function PermitPilotPage({ params, searchParams }: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { tenantId } = await params;
  const { result } = await searchParams;
  const { client, tenant, role } = await getWorkspaceRecord(tenantId);
  if (tenant.account_type !== "internal" || (role !== "owner" && role !== "admin")) notFound();
  const { data, error } = await client.rpc("permit_pilot_overview", { operator_id: tenantId });
  const overview = error ? null : data as PilotOverview;
  const update = setPermitPilotAccess.bind(null, tenantId);

  return <>
    <div className="page-heading"><h1>PermitDesk pilots</h1><p>Manage access for your client workspaces and review private feedback.</p></div>
    {result === "saved" && <p role="status">Pilot access saved.</p>}
    {result === "invalid" && <p role="alert">Choose a valid expiration date in the future.</p>}
    {result === "error" && <p role="alert">Pilot access could not be saved. Check the workspace status and try again.</p>}
    {overview ? <>
      <section className="panel">
        <h2>Managed workspaces</h2>
        {overview.workspaces.length === 0 && <p>No managed client workspaces yet.</p>}
        {overview.workspaces.map(workspace => {
          const inactive = workspace.status === "archived" || workspace.status === "paused";
          const access = inactive ? "Unavailable" : workspace.enabled ? workspace.expired ? "Expired" : "Enabled" : "Off";
          return <form className="panel" key={workspace.id} action={update}>
            <h3>{workspace.name}</h3>
            <p>{access}{workspace.expires_at && ` · Ends ${workspace.expires_at.slice(0, 10)} at 00:00 UTC`}</p>
            <input type="hidden" name="client" value={workspace.id} />
            <label>Product access
              <select name="mode" defaultValue={workspace.permitdesk_only ? "permits" : "bundle"}>
                <option value="permits">PermitDesk only</option>
                <option value="bundle">PermitDesk and Missed Call</option>
              </select>
            </label>
            <label>Expiration date (00:00 UTC)
              <input name="expiry" type="date" defaultValue={workspace.expires_at?.slice(0, 10)} />
            </label>
            {inactive && <p>Workspace status is {workspace.status}.</p>}
            <button className="button" name="command" value="enable" disabled={inactive}>Save and enable</button>
            {workspace.enabled && <button className="button secondary" name="command" value="pause">Pause PermitDesk</button>}
          </form>;
        })}
      </section>
      <section className="panel">
        <h2>Recent pilot feedback</h2>
        {overview.feedback.length === 0 && <p>No feedback yet.</p>}
        {overview.feedback.map(item => <article className="panel" key={`${item.id}-${item.created_at}`}>
          <h3>{item.name} · {item.category}</h3>
          <p><time dateTime={item.created_at}>{item.created_at.slice(0, 10)}</time>{item.rating && ` · ${item.rating}/5`}</p>
          <p>{item.message}</p>
          {item.review && <><h4>Optional review</h4><p>{item.review}</p><p>{item.allow_quote ? "Quote permission granted for this review" : "Private review"}</p></>}
        </article>)}
      </section>
    </> : <p role="alert">Pilot details are unavailable. Refresh and try again.</p>}
  </>;
}
