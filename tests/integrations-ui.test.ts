import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AUTOMATION_CONTROL_DEFINITIONS, defaultAutomationControl } from '@/lib/automation-controls';

const harness = vi.hoisted(() => ({
  workspace: vi.fn(),
  automationControls: vi.fn(),
  retellHealth: vi.fn(),
  milestones: vi.fn(),
  relation: { data: null, error: null } as { data: { client_tenant_id: string } | null; error: unknown },
  relationCalls: [] as unknown[][],
}));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace }));
vi.mock('@/lib/server/automation-control-queries', () => ({ getAutomationControls: harness.automationControls }));
vi.mock('@/app/actions/retell-provisioning', () => ({ getRetellAgentMappingHealth: harness.retellHealth, registerRetellAgentMapping: vi.fn(), pauseRetellAgentMapping: vi.fn() }));
vi.mock('@/lib/server/onboarding-milestones', () => ({ getOnboardingMilestones: harness.milestones }));

import IntegrationsReadiness from '@/app/workspaces/[tenantId]/integrations/page';

const tenant = '11111111-1111-4111-8111-111111111111';

function relationshipClient() {
  const query = {
    select(columns: string) {
      harness.relationCalls.push(['select', columns]);
      return query;
    },
    eq(column: string, value: unknown) {
      harness.relationCalls.push(['eq', column, value]);
      return query;
    },
    in(column: string, values: unknown[]) {
      harness.relationCalls.push(['in', column, values]);
      return query;
    },
    async maybeSingle() {
      harness.relationCalls.push(['maybeSingle']);
      return harness.relation;
    },
  };
  return {
    from(table: string) {
      harness.relationCalls.push(['from', table]);
      return query;
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  harness.relationCalls.length = 0;
  harness.relation = { data: { client_tenant_id: tenant }, error: null };
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York', account_type: 'client' }, role: 'owner', client: relationshipClient() });
  harness.automationControls.mockResolvedValue({
    ready: true,
    canManage: true,
    controls: AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenant, definition)),
  });
  harness.retellHealth.mockResolvedValue({ status: 'not_mapped' });
  harness.milestones.mockResolvedValue(new Map());
});

async function html() {
  return renderToStaticMarkup(await IntegrationsReadiness({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe('integrations readiness page', () => {
  it('shows provider readiness and client-specific optional automation gates', async () => {
    const output = await html();
    expect(output).toContain('Safe integration posture');
    expect(output).toContain('Retell voice agent');
    expect(output).toContain('Not mapped');
    expect(output).toContain('Make intake scenario');
    expect(output).toContain('No client-specific Make connection is recorded');
    expect(output).toContain('Platform path available');
    expect(output).toContain('Twilio and SMS');
    expect(output).toContain('Optional controlled write');
    expect(output).toContain('Provider writes');
    expect(output).toContain('Optional');
    expect(output).toContain('High-risk actions');
    expect(output).toContain('Gated');
    expect(output).toContain('SMS follow-up');
    expect(output).toContain('Email follow-up');
    expect(output).toContain('External calendar writes');
    expect(output).toContain('Automatic booking');
    expect(output).toContain('Payment collection');
    expect(output).toContain('Subscription billing');
    expect(output).toContain('Dispatch automation');
    expect(output).toContain('Owner approved after reviewing scope, risk, and provider requirements');
    expect(output).toContain('Open Go Live to see the complete setup, test, approval and rollback path');
    expect(output).toContain(`/workspaces/${tenant}/go-live`);
    expect(output).toContain('Pause Retell routing');
    expect(output).toContain('does not delete the Retell agent, change phone routing, or revoke the API key');
    expect(output).toContain('Route status:');
    expect(output).toContain('Not mapped');
    expect(output).toContain('Connect this client’s receptionist');
    expect(output).toContain('Assign and check the client phone number in Retell');
    expect(output).toContain('Connect receptionist');
    expect(output).toContain('Manual ownership check required');
    expect(output).toContain('does not contact Retell to prove provider ownership');
    expect(output).toContain('Mapping in Cevanta does not publish the agent or configure phone routing');
    expect(output).toContain('Mapping alone does not prove live delivery');
    expect(output).toContain('Make one fictional test call');
    expect(output).toContain('Make webhook is already configured once on the server');
    expect(output).toContain('Until request tracking is built');
    expect(output).not.toContain('lets you check its status here');
    expect(output).not.toContain('Phone answering tested');
    expect(output).not.toContain('Safe receiver tested');
    expect(harness.relationCalls).toContainEqual(['from', 'managed_client_workspaces']);
    expect(harness.relationCalls).toContainEqual(['eq', 'client_tenant_id', tenant]);
    expect(harness.relationCalls).toContainEqual(['in', 'status', ['onboarding', 'pilot', 'active']]);
  });

  it('gives a client owner non-sensitive health without mapping or pause controls', async () => {
    harness.relation = { data: null, error: null };
    harness.retellHealth.mockResolvedValueOnce({ status: 'active' });
    const output = await html();
    expect(output).toContain('Receptionist route health');
    expect(output).toContain('Health only');
    expect(output).toContain('Route status:');
    expect(output).toContain('Active');
    expect(output).toContain('does not expose the Retell agent ID or provider telemetry');
    expect(output).toContain('Mapping and pause controls are restricted');
    expect(output).not.toContain('Connect receptionist');
    expect(output).not.toContain('Pause Retell routing');
    expect(output).not.toContain('Manual ownership check required');
  });

  it('fails closed to health-only UI when the operator relationship read errors', async () => {
    harness.relation = { data: null, error: { message: 'private database detail' } };
    const output = await html();
    expect(output).toContain('Health only');
    expect(output).not.toContain('Connect receptionist');
    expect(output).not.toContain('Pause Retell routing');
    expect(output).not.toContain('private database detail');
  });

  it('shows verified provider wording only for matching client evidence', async () => {
    harness.retellHealth.mockResolvedValueOnce({ status: 'active' });
    harness.milestones.mockResolvedValueOnce(new Map([[tenant, {
      payment_status: 'paid', setup_status: 'complete', test_call_status: 'passed', retell_status: 'verified', make_status: 'verified', launch_approval_status: 'approved', updated_at: '2026-10-26T00:00:00.000Z',
    }]]));
    const output = await html();
    expect(output).toContain('Verification evidence recorded');
    expect(output).toContain('Verified evidence recorded');
    expect(output).toContain('Client test recorded');
  });

  it('shows catalog-only messaging for non-manager roles', async () => {
    harness.workspace.mockResolvedValueOnce({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York', account_type: 'client' }, role: 'dispatcher', client: relationshipClient() });
    harness.automationControls.mockResolvedValueOnce({
      ready: true,
      canManage: false,
      controls: AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenant, definition)),
    });
    const output = await html();
    expect(output).toContain('automation catalog only');
    expect(output).toContain('Status restricted');
    expect(output).not.toContain('Shown to client');
    expect(output).not.toContain('Not approved');
    expect(output).not.toContain('Receptionist route health');
    expect(output).not.toContain('Connect receptionist');
    expect(harness.retellHealth).not.toHaveBeenCalled();
  });

  it('links to the workspace launch and setup paths', async () => {
    const output = await html();
    expect(output).toContain(`/workspaces/${tenant}/launch`);
    expect(output).toContain(`/workspaces/${tenant}/onboarding`);
    expect(output).toContain(`/workspaces/${tenant}/leads`);
    expect(output).toContain(`/workspaces/${tenant}/calendar`);
    expect(output).toContain(`/workspaces/${tenant}/settings`);
  });
});
