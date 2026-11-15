import { redirect } from "next/navigation";
import { z } from "zod";
import { requireMembership } from "@/lib/server/authorization";

const entries = z.array(z.object({
  id: z.string().uuid(),
  name: z.string(),
  trade: z.string(),
  timezone: z.string(),
  dashboard_enabled: z.boolean(),
  permitdesk_enabled: z.boolean(),
  expires_at: z.string().nullable(),
  created_at: z.string(),
}));

async function saveAccess(operatorId: string, clientId: string, data: FormData) {
  "use server";
  const { client } = await requireMembership(operatorId, ["owner", "admin"]);
  const permitdesk = data.get("permitdesk") === "on";
  const date = z.iso.date().safeParse(data.get("expiry"));
  const endAt = permitdesk && date.success ? `${date.data}T00:00:00.000Z` : null;
  const path = `/workspaces/${operatorId}/clients`;
  if (permitdesk && (!endAt || Date.parse(endAt) <= Date.now())) {
    redirect(`${path}?signupAccess=expiry#signup-${clientId}`);
  }
  const { error } = await client.rpc("set_self_service_client_access", {
    operator_id: operatorId,
    client_id: clientId,
    dashboard_enabled: data.get("dashboard") === "on",
    permitdesk_enabled: permitdesk,
    end_at: endAt,
  });
  redirect(`${path}?signupAccess=${error ? "error" : "saved"}#signup-${clientId}`);
}

export async function SelfServiceClientQueue({ operatorId, result }: { operatorId: string; result?: string }) {
  const { client } = await requireMembership(operatorId, ["owner", "admin"]);
  const response = await client.rpc("list_self_service_clients", { operator_id: operatorId });
  const parsed = entries.safeParse(response.data);
  return <section className="panel" id="self-service-clients">
    <h2>New signups</h2>
    {result === "saved" && <p role="status">Dashboard access saved.</p>}
    {result === "error" && <p role="alert">Dashboard access could not be saved.</p>}
    {result === "expiry" && <p role="alert">Choose a future expiration date to enable PermitDesk.</p>}
    {response.error || !parsed.success ? <p>Signup queue unavailable.</p> :
      parsed.data.length === 0 ? <p>No self-service workspaces yet.</p> :
      parsed.data.map(entry => <form className="panel" key={entry.id} id={`signup-${entry.id}`}
        action={saveAccess.bind(null, operatorId, entry.id)}>
        <h3>{entry.name}</h3>
        <p>{entry.trade} · {entry.timezone}</p>
        <fieldset>
          <legend>Dashboard access</legend>
          <label><input type="checkbox" name="dashboard" defaultChecked={entry.dashboard_enabled} /> Free Dashboard</label>
          <label><input type="checkbox" name="permitdesk" defaultChecked={entry.permitdesk_enabled} /> PermitDesk</label>
          <label>PermitDesk expiration (00:00 UTC)
            <input type="date" name="expiry" defaultValue={entry.expires_at?.slice(0, 10)} />
          </label>
        </fieldset>
        <button className="button" type="submit">Save dashboard access</button>
      </form>)}
  </section>;
}
