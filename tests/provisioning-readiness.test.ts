import { describe, expect, it } from 'vitest';
import { AUTOMATION_CONTROL_DEFINITIONS, defaultAutomationControl } from '@/lib/automation-controls';
import { buildProvisioningReadiness } from '@/lib/provisioning-readiness';
import type { OwnerOnboardingSnapshot } from '@/lib/onboarding-contracts';

const tenant = '11111111-1111-4111-8111-111111111111';

function snapshot(overrides: Partial<OwnerOnboardingSnapshot> = {}): OwnerOnboardingSnapshot {
  return {
    projection: 'owner_setup',
    workspace: { id: tenant, name: 'Northstar HVAC', trade: 'HVAC', timezone: 'America/New_York' },
    flow_version: 'onboarding-v1',
    config_revision: 2,
    profile: { business_contact_name: 'Fictional Owner', business_email: 'owner@example.invalid', business_phone: '2075550100' },
    services: [{ id: '22222222-2222-4222-8222-222222222222', name: 'No heat', description: 'Fictional service', enabled: true, position: 0, version: 1 }],
    weekly_hours: [{ weekday: 1, closed: false, intervals: [{ start_minute: 480, end_minute: 1020 }] }],
    exceptions: [],
    booking: { mode: 'request_only', lead_time_minutes: null, buffer_before_minutes: null, buffer_after_minutes: null, horizon_days: null, notes: 'Office reviews every request. Never promise exact arrival or price.', acknowledged: true },
    escalation: [{ id: '33333333-3333-4333-8333-333333333333', label: 'Office', contact_name: 'Fictional Dispatcher', email: 'dispatch@example.invalid', phone: null, enabled: true, position: 0, version: 1 }],
    resume_step: 'review',
    resume_version: 1,
    readiness: { configuration_state: 'not_evaluated', manual_workspace_state: 'not_evaluated', reason: 'setup_policy_pending', next_action: 'platform_operator', booking_state: 'blocked', release_state: 'not_evaluated', hostedReady: false, providerConnectionAuthorized: false },
    ...overrides,
  };
}

describe('provisioning readiness', () => {
  it('marks complete saved setup and draft package ready while provider work remains gated', () => {
    const controls = AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenant, definition));
    const readiness = buildProvisioningReadiness(snapshot(), controls);
    expect(readiness.readyCount).toBe(2);
    expect(readiness.safeSummary).toContain('Preparation only');
    expect(readiness.gates.find(gate => gate.key === 'saved_setup')?.state).toBe('ready');
    expect(readiness.gates.find(gate => gate.key === 'receptionist_draft')?.state).toBe('ready');
    expect(readiness.gates.find(gate => gate.key === 'trusted_route')?.state).toBe('manual_required');
    expect(readiness.gates.find(gate => gate.key === 'activation')?.state).toBe('blocked');
    expect(JSON.stringify(readiness)).not.toMatch(/webhook|api key|sk_live_|Bearer /i);
  });

  it('marks the trusted route ready only when the tenant mapping is active', () => {
    const readiness = buildProvisioningReadiness(snapshot(), [], 'active');
    const gate = readiness.gates.find(item => item.key === 'trusted_route');
    expect(gate?.state).toBe('ready');
    expect(gate?.summary).toContain('active tenant-scoped Retell route');
    expect(JSON.stringify(readiness)).not.toMatch(/agent_[A-Za-z0-9_-]+|webhook|api key/i);
  });

  it('shows setup needed when required client onboarding details are missing', () => {
    const readiness = buildProvisioningReadiness(snapshot({ profile: null, services: [], weekly_hours: [], booking: null, escalation: [] }), []);
    expect(readiness.readyCount).toBe(0);
    expect(readiness.overallState).toBe('setup_needed');
    expect(readiness.gates.find(gate => gate.key === 'saved_setup')?.summary).toContain('Setup still needs');
    expect(readiness.gates.find(gate => gate.key === 'receptionist_draft')?.nextAction).toContain('Collect services');
  });

  it('summarizes requested optional automation without activating it', () => {
    const controls = AUTOMATION_CONTROL_DEFINITIONS.map(definition => ({ ...defaultAutomationControl(tenant, definition), requested: definition.capability === 'email', owner_approved: definition.capability === 'email', activation_state: definition.capability === 'email' ? 'ready' as const : 'off' as const, test_evidence: definition.capability === 'email' ? 'Fictional email test passed.' : '', rollback_plan: definition.capability === 'email' ? 'Pause email control.' : '' }));
    const readiness = buildProvisioningReadiness(snapshot(), controls);
    expect(readiness.gates.find(gate => gate.key === 'provider_connections')?.summary).toContain('1 optional automation controls are requested; 1 have approval');
    expect(readiness.gates.find(gate => gate.key === 'test_call')?.state).toBe('blocked');
  });
});
