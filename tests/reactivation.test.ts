import { describe, expect, it } from 'vitest';
import type { Customer } from '@/lib/contracts';
import type { Lead } from '@/lib/intake-contracts';
import type { Job } from '@/lib/jobs-contracts';
import { buildReactivationDraft, isOlderThanTwelveMonths, latestCompletedService } from '@/lib/reactivation';
import { campaignSchema } from '@/lib/reactivation-validation';

const tenantId = '11111111-1111-4111-8111-111111111111';
const customer: Customer = {
  id: '22222222-2222-4222-8222-222222222222', tenant_id: tenantId, name: 'Fictional Harbor Mechanical',
  email: 'maintenance@example.test', phone: '2075550100', notes: null,
  created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z',
};
const completedJob: Job = {
  id: '33333333-3333-4333-8333-333333333333', tenant_id: tenantId, submission_id: '44444444-4444-4444-8444-444444444444',
  lead_id: null, customer_id: customer.id, service_location_id: null, title: 'Fictional rooftop unit service',
  description: 'Fictional completed maintenance visit', status: 'completed', priority: 'normal', scheduled_date: '2024-09-15',
  assigned_user_id: null, created_at: '2024-09-15T00:00:00.000Z', updated_at: '2024-09-15T00:00:00.000Z',
};
const lead: Lead = {
  id: '55555555-5555-4555-8555-555555555555', tenant_id: tenantId, submission_id: '66666666-6666-4666-8666-666666666666',
  customer_id: customer.id, name: customer.name, email: customer.email, phone: customer.phone,
  description: 'Fictional rooftop unit maintenance request', priority: 'normal', status: 'closed', follow_up_date: null,
  created_at: '2024-09-15T00:00:00.000Z', updated_at: '2024-09-15T00:00:00.000Z',
};

describe('seasonal maintenance reactivation', () => {
  it('finds the latest completed service and ignores incomplete jobs', () => {
    const newerOpenJob = { ...completedJob, id: '77777777-7777-4777-8777-777777777777', status: 'in_progress' as const, scheduled_date: '2025-09-15' };
    expect(latestCompletedService(customer.id, [completedJob, newerOpenJob])).toBe('2024-09-15');
  });

  it('requires a completed service date to be more than one year old', () => {
    const now = new Date('2026-10-25T12:00:00.000Z');
    expect(isOlderThanTwelveMonths('2024-09-15', now)).toBe(true);
    expect(isOlderThanTwelveMonths('2025-10-25', now)).toBe(false);
  });

  it('creates a personalized draft without claiming an appointment was booked', () => {
    const draft = buildReactivationDraft({ customer, lastServiceAt: '2024-09-15', latestLead: lead, season: 'fall', channel: 'email', triggerType: 'seasonal' });
    expect(draft.subject).toContain(customer.name);
    expect(draft.message).toContain('rooftop unit maintenance request');
    expect(draft.message).toContain('does not confirm an appointment or price');
    expect(draft.message).not.toMatch(/booked|confirmed appointment/i);
  });

  it('requires a description when a weather trigger is selected', () => {
    const base = { tenantId, name: 'Fictional fall review', season: 'fall', channel: 'email', triggerType: 'weather' } as const;
    expect(campaignSchema.safeParse(base).success).toBe(false);
    expect(campaignSchema.safeParse({ ...base, weatherTrigger: 'First forecast below 35°F' }).success).toBe(true);
  });
});
