"use client";

import { saveAutomationControl } from "@/app/actions/automation-controls";
import { ActionForm } from "@/components/action-form";
import { automationStateLabel, AUTOMATION_STATES, type AutomationControl } from "@/lib/automation-controls";

export function AutomationControlForm({ control, canManage }: { control: AutomationControl; canManage: boolean }) {
  return (
    <article id={`automation-${control.capability}`} className="panel automation-control-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{control.provider}</span>
          <h3>{control.label}</h3>
          <p>{control.summary}</p>
        </div>
        <span className="pill">{canManage ? automationStateLabel(control.activation_state) : "Status restricted"}</span>
      </div>
      <p className="notice"><strong>Live risk:</strong> {control.liveRisk}</p>
      {!canManage ? (
        <div className="setup-readiness-list">
          <p><strong>Catalog only:</strong> This option can be prepared for a client, but current approval, test evidence and activation details are restricted to owners and admins.</p>
          <p className="notice">Ask an owner or admin to review or change automation status.</p>
        </div>
      ) : (
      <ActionForm
        action={saveAutomationControl}
        submitLabel="Save option"
        hidden={{ tenantId: control.tenant_id, capability: control.capability }}
      >
        <label className="checkbox-row">
          <input type="checkbox" name="requested" defaultChecked={control.requested} disabled={!canManage} />
          <span>Make this optional feature available for this client</span>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" name="client_visible" defaultChecked={control.client_visible} disabled={!canManage} />
          <span>Show this option to the client</span>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" name="owner_approved" defaultChecked={control.owner_approved} disabled={!canManage} />
          <span>Owner approved after reviewing scope, risk, and provider requirements</span>
        </label>
        <label className="field">
          <span>Activation state</span>
          <select name="activation_state" defaultValue={control.activation_state} disabled={!canManage}>
            {AUTOMATION_STATES.map(state => <option key={state} value={state}>{automationStateLabel(state)}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Test evidence</span>
          <textarea name="test_evidence" maxLength={2000} rows={3} defaultValue={control.test_evidence} disabled={!canManage} placeholder="Example: test call ID, test message result, conflict check result, or Stripe test-mode proof." />
        </label>
        <label className="field">
          <span>Rollback plan</span>
          <textarea name="rollback_plan" maxLength={2000} rows={3} defaultValue={control.rollback_plan} disabled={!canManage} placeholder="Example: switch state to paused, disable provider webhook, notify office, and return to manual review." />
        </label>
        <label className="field">
          <span>Provider notes</span>
          <textarea name="provider_notes" maxLength={2000} rows={3} defaultValue={control.provider_notes} disabled={!canManage} placeholder="Provider, account readiness, consent notes, template status, or known setup blockers." />
        </label>
      </ActionForm>
      )}
    </article>
  );
}
