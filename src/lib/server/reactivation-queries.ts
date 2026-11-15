import 'server-only';
import { OFFICE_ROLES } from '@/lib/contracts';
import type { Customer } from '@/lib/contracts';
import type { Lead } from '@/lib/intake-contracts';
import type { Job } from '@/lib/jobs-contracts';
import type { ReactivationCampaign, ReactivationCandidate, ReactivationCustomer, ReactivationInbox } from '@/lib/reactivation-contracts';
import { isEligibleForReactivation, latestCompletedService } from '@/lib/reactivation';
import { requireMembership } from './authorization';

const missing = (code?: string) => code === '42P01' || code === 'PGRST205';

export async function getReactivationInbox(tenantId: string): Promise<ReactivationInbox> {
  const { client } = await requireMembership(tenantId, OFFICE_ROLES);
  const [campaignResult, candidateResult, customersResult, leadsResult, jobsResult] = await Promise.all([
    client.from('reactivation_campaigns').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    client.from('reactivation_candidates').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    client.from('customers').select('*').eq('tenant_id', tenantId).order('name'),
    client.from('leads').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    client.from('jobs').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
  ]);
  if (missing(campaignResult.error?.code) || missing(candidateResult.error?.code)) return { ready: false, campaigns: [], candidates: [], eligibleCustomers: [] };
  if (campaignResult.error || candidateResult.error || customersResult.error || leadsResult.error || jobsResult.error) throw new Error('Could not load reactivation records.');

  const customers = (customersResult.data ?? []) as Customer[];
  const leads = (leadsResult.data ?? []) as Lead[];
  const jobs = (jobsResult.data ?? []) as Job[];
  const latestLeadByCustomer = new Map<string, Lead>();
  for (const lead of leads) if (lead.customer_id && !latestLeadByCustomer.has(lead.customer_id)) latestLeadByCustomer.set(lead.customer_id, lead);
  const eligibleCustomers: ReactivationCustomer[] = customers.flatMap(customer => {
    const lastServiceAt = latestCompletedService(customer.id, jobs);
    const latestLead = latestLeadByCustomer.get(customer.id) ?? null;
    const contactable = Boolean(customer.email || customer.phone);
    if (!isEligibleForReactivation(lastServiceAt) || !contactable) return [];
    return [{
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      lastServiceAt,
      latestLeadId: latestLead?.id ?? null,
      latestLeadSummary: latestLead?.description ?? null,
      eligible: true,
      reason: lastServiceAt ? `Last completed service: ${lastServiceAt}` : 'No completed service date recorded',
    }];
  });
  return {
    ready: true,
    campaigns: (campaignResult.data ?? []) as ReactivationCampaign[],
    candidates: (candidateResult.data ?? []) as ReactivationCandidate[],
    eligibleCustomers,
  };
}
