"use client";

import { useActionState } from "react";
import { issueClientInvitation } from "@/app/actions/invitations";
import type { ActionState } from "@/lib/server/action-state";

type InvitationState = ActionState & { inviteUrl?: string; expiresAt?: string };

export function InvitationLinkForm({ operatorTenantId, clientTenantId }: { operatorTenantId: string; clientTenantId: string }) {
  const [state, action, pending] = useActionState<InvitationState, FormData>(issueClientInvitation, { status: "idle", message: "" });
  return <form action={action} className="form invitation-form">
    <input type="hidden" name="request_id" value={crypto.randomUUID()} />
    <input type="hidden" name="operator_tenant_id" value={operatorTenantId} />
    <input type="hidden" name="client_tenant_id" value={clientTenantId} />
    <label className="field"><span>Confirmed client account email <span className="required">*</span></span><input name="recipient_email" type="email" required autoComplete="email" placeholder="owner@client-company.com" /></label>
    <p className="small muted">The client must confirm this Cevanta account first. No membership is added until they open the private link and accept it.</p>
    {state.message && <p className={state.status === "error" ? "form-error" : "notice"} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
    {state.inviteUrl && <div className="notice"><strong>Copy this private link now:</strong><input readOnly value={state.inviteUrl} aria-label="Private client invitation link" onFocus={event => event.currentTarget.select()} /><p className="small muted">Valid for 7 days. Send it only to the confirmed email above. It is not emailed automatically yet.</p></div>}
    <button className="button" disabled={pending} type="submit">{pending ? "Creating…" : "Create private invite"}<span aria-hidden="true">↗</span></button>
  </form>;
}
