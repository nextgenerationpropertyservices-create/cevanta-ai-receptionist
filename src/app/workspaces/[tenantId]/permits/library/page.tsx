import Link from "next/link";
import { removePermitLibraryEntry, savePermitJurisdiction, savePermitTemplate } from "@/app/actions/permit-library";
import { ActionForm, Field } from "@/components/action-form";
import directory from "@/lib/permit-directory.json";
import { requirePermitWorkspace } from "@/lib/server/permits";

const jurisdictionFields = [
  ["nec", "Electrical code edition"],
  ["channel", "Filing channel"],
  ["routeStatus", "Filing route status"],
  ["nextStep", "Filing instructions"],
  ["inspectionNotes", "Inspection instructions"],
  ["formUrl", "Application form URL", "url"],
  ["relatedUrl", "Related resource URL", "url"],
  ["relatedLabel", "Related resource label"],
  ["portal", "Filing portal URL", "url"],
  ["payments", "Payment instructions"],
  ["turn", "Typical turnaround"],
  ["contact", "Municipal contact"],
  ["vault", "Password manager item name"],
  ["source", "Official source URL", "url"],
  ["verified", "Last verified date", "date"],
  ["thresholds", "Instant permit thresholds"],
  ["plans", "Plan requirements"],
  ["formats", "File formats"],
  ["amendments", "Local amendments"],
] as const;

function RemoveEntry({ hidden, label }: { hidden: Record<string, string>; label: string }) {
  return <ActionForm action={removePermitLibraryEntry} submitLabel={label} hidden={hidden}>
    <label><input type="checkbox" name="confirm" value="yes" required /> Confirm removal</label>
  </ActionForm>;
}

function TemplateForm({ tenantId, template }: {
  tenantId: string;
  template?: { id: string; name: string; scope: string; permit_kind: string; updated_at: string };
}) {
  const hidden: Record<string, string> = template
    ? { tenantId, templateId: template.id, revision: template.updated_at }
    : { tenantId };
  return <>
    <ActionForm action={savePermitTemplate} submitLabel="Save template" hidden={hidden}>
      <Field label="Template name" name="name" required maxLength={100} defaultValue={template?.name} />
      <Field label="Permit type" name="permit_kind" maxLength={80} defaultValue={template?.permit_kind} />
      <label className="field">
        <span>Scope of work</span>
        <textarea name="scope" rows={4} required maxLength={4000} defaultValue={template?.scope} />
      </label>
    </ActionForm>
    {template && <RemoveEntry hidden={hidden} label="Remove template" />}
  </>;
}

function JurisdictionForm({ tenantId, ahjId, profile, revision, starter }: {
  tenantId: string;
  ahjId?: string;
  profile?: Record<string, unknown>;
  revision?: string;
  starter?: boolean;
}) {
  const hidden: Record<string, string> = { tenantId };
  if (ahjId) hidden.ahjId = ahjId;
  if (revision) hidden.revision = revision;
  const value = (key: string) => typeof profile?.[key] === "string" ? profile[key] : undefined;
  return <>
    <ActionForm action={savePermitJurisdiction} submitLabel="Save jurisdiction" hidden={hidden}>
      <Field label="Jurisdiction name" name="name" required maxLength={160} defaultValue={value("name")} />
      {jurisdictionFields.map(([key, label, type]) => <Field
        key={key} label={label} name={key} type={type}
        maxLength={type === "url" ? 500 : 1000} defaultValue={value(key)}
      />)}
      <p className="muted">Use only the password manager item name. Keep sign-in credentials in your password manager.</p>
    </ActionForm>
    {revision && <RemoveEntry hidden={hidden} label={starter ? "Restore starter profile" : "Remove jurisdiction"} />}
  </>;
}

export default async function PermitLibraryPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { client } = await requirePermitWorkspace(tenantId);
  const [templates, overrides] = await Promise.all([
    client.from("permit_scope_templates").select("id,name,permit_kind,scope,updated_at").eq("tenant_id", tenantId).order("name"),
    client.from("permit_ahj_overrides").select("ahj_id,profile,updated_at").eq("tenant_id", tenantId),
  ]);
  const starterIds = new Set(directory.map(({ id }) => id));
  const customProfiles = overrides.data?.filter(({ ahj_id }) => !starterIds.has(ahj_id)) ?? [];
  const profiles = new Map(overrides.data?.map((entry) => [entry.ahj_id, entry]));
  return <>
    <header className="page-header">
      <Link href={"/workspaces/" + tenantId + "/permits"}>Back to permits</Link>
      <h1>Permit library</h1>
      <p>Reuse common scopes of work and keep your workspace’s municipal filing instructions up to date.</p>
    </header>
    <section className="card">
      <h2>Scope templates</h2>
      {templates.error ? <p role="alert">Scope templates are unavailable. Refresh this page to try again.</p> : <>
        {templates.data?.map((template) => <details key={template.id}>
          <summary>{template.name}</summary>
          <TemplateForm tenantId={tenantId} template={template} />
        </details>)}
        <details>
          <summary>Add a scope template</summary>
          <TemplateForm tenantId={tenantId} />
        </details>
      </>}
    </section>
    <section className="card">
      <h2>Jurisdiction directory</h2>
      <p>Verify instructions against the municipality’s official source before filing.</p>
      {overrides.error ? <p role="alert">Workspace jurisdiction profiles are unavailable. Refresh this page to try again.</p> : <>
        {directory.map((starter) => {
          const override = profiles.get(starter.id);
          const profile = override ? override.profile as Record<string, unknown> : starter;
          return <details key={starter.id}>
            <summary>{String(profile.name)}{override ? " · Workspace profile" : ""}</summary>
            <JurisdictionForm tenantId={tenantId} ahjId={starter.id} profile={profile} revision={override?.updated_at} starter />
          </details>;
        })}
        {customProfiles.map(({ ahj_id, profile, updated_at }) => <details key={ahj_id}>
          <summary>{String(profile.name)}</summary>
          <JurisdictionForm tenantId={tenantId} ahjId={ahj_id} profile={profile} revision={updated_at} />
        </details>)}
        <details>
          <summary>Add a jurisdiction</summary>
          <JurisdictionForm tenantId={tenantId} />
        </details>
      </>}
    </section>
  </>;
}


