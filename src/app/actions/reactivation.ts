'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { OFFICE_ROLES } from '@/lib/contracts';
import type { Customer } from '@/lib/contracts';
import type { Lead } from '@/lib/intake-contracts';
import type { Job } from '@/lib/jobs-contracts';
import { buildReactivationDraft, isEligibleForReactivation, latestCompletedService } from '@/lib/reactivation';
import { campaignSchema, candidateActionSchema, scheduleSchema } from '@/lib/reactivation-validation';
import { requireMembership } from '@/lib/server/authorization';
import type { ActionState } from '@/lib/server/action-state';

const missing = (code?: string) => code === '42P01' || code === 'PGRST205';
const migrationMessage = 'Reactivation needs its database migration before it can be used.';

export async function createReactivationCampaign(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const parsed = campaignSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the campaign fields.' };
    const { tenantId, name, season, channel, triggerType, weatherTrigger } = parsed.data;
    const { client, user } = await requireMembership(tenantId, OFFICE_ROLES);
    const campaignResult = await client.from('reactivation_campaigns').insert({
      tenant_id: tenantId,
      name,
      season,
      channel,
      trigger_type: triggerType,
      weather_trigger: weatherTrigger || null,
      status: 'draft',
      created_by: user.id,
    }).select('id').single();
    if (missing(campaignResult.error?.code)) return { status: 'error', message: migrationMessage };
    if (campaignResult.error || !campaignResult.data) throw new Error('Campaign could not be created.');

    const [customersResult, leadsResult, jobsResult] = await Promise.all([
      client.from('customers').select('*').eq('tenant_id', tenantId),
      client.from('leads').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
      client.from('jobs').select('*').eq('tenant_id', tenantId),
    ]);
    if (customersResult.error || leadsResult.error || jobsResult.error) throw new Error('Campaign history could not be loaded.');
    const customers = (customersResult.data ?? []) as Customer[];
    const leads = (leadsResult.data ?? []) as Lead[];
    const jobs = (jobsResult.data ?? []) as Job[];
    const latestLeadByCustomer = new Map<string, Lead>();
    for (const lead of leads) if (lead.customer_id && !latestLeadByCustomer.has(lead.customer_id)) latestLeadByCustomer.set(lead.customer_id, lead);
    const rows = customers.flatMap(customer => {
      const lastServiceAt = latestCompletedService(customer.id, jobs);
      if (!isEligibleForReactivation(lastServiceAt) || (!customer.email && !customer.phone)) return [];
      const latestLead = latestLeadByCustomer.get(customer.id) ?? null;
      const draft = buildReactivationDraft({ customer, lastServiceAt, latestLead, season, channel, triggerType, weatherTrigger: weatherTrigger || null });
      return [{
        tenant_id: tenantId,
        campaign_id: campaignResult.data.id,
        customer_id: customer.id,
        lead_id: latestLead?.id ?? null,
        last_service_at: lastServiceAt,
        reason: draft.reason,
        channel,
        subject: draft.subject,
        message: draft.message,
        status: 'draft',
      }];
    });
    if (rows.length) {
      const candidateResult = await client.from('reactivation_candidates').insert(rows).select('id');
      if (missing(candidateResult.error?.code)) return { status: 'error', message: migrationMessage };
      if (candidateResult.error) throw new Error('Campaign candidates could not be created.');
      const update = await client.from('reactivation_campaigns').update({ status: 'review' }).eq('tenant_id', tenantId).eq('id', campaignResult.data.id);
      if (update.error) throw new Error('Campaign status could not be updated.');
    }
    revalidatePath(`/workspaces/${tenantId}/reactivation`);
    return { status: 'success', message: rows.length ? `Campaign created with ${rows.length} review draft${rows.length === 1 ? '' : 's'}.` : 'Campaign created. No accounts currently meet the 12-month rule.' };
  } catch (error) {
    unstable_rethrow(error);
    return { status: 'error', message: 'Unable to create this campaign. Check permissions and try again.' };
  }
}

export async function approveReactivationCandidate(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const parsed = candidateActionSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: 'error', message: 'The campaign candidate is unavailable.' };
    const { tenantId, candidateId } = parsed.data;
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const result = await client.from('reactivation_candidates').update({ status: 'approved' }).eq('tenant_id', tenantId).eq('id', candidateId).eq('status', 'draft').select('id').single();
    if (missing(result.error?.code)) return { status: 'error', message: migrationMessage };
    if (result.error || !result.data) return { status: 'error', message: 'This draft is no longer waiting for approval.' };
    revalidatePath(`/workspaces/${tenantId}/reactivation`);
    return { status: 'success', message: 'Draft approved. No email or SMS was sent.' };
  } catch (error) {
    unstable_rethrow(error);
    return { status: 'error', message: 'Unable to approve this draft.' };
  }
}

export async function dismissReactivationCandidate(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const parsed = candidateActionSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: 'error', message: 'The campaign candidate is unavailable.' };
    const { tenantId, candidateId } = parsed.data;
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const result = await client.from('reactivation_candidates').update({ status: 'dismissed' }).eq('tenant_id', tenantId).eq('id', candidateId).in('status', ['draft', 'approved']).select('id').single();
    if (missing(result.error?.code)) return { status: 'error', message: migrationMessage };
    if (result.error || !result.data) return { status: 'error', message: 'This candidate is no longer available to dismiss.' };
    revalidatePath(`/workspaces/${tenantId}/reactivation`);
    return { status: 'success', message: 'Candidate dismissed.' };
  } catch (error) {
    unstable_rethrow(error);
    return { status: 'error', message: 'Unable to dismiss this candidate.' };
  }
}

export async function scheduleReactivationCandidate(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const parsed = scheduleSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Choose a future visit time.' };
    const { tenantId, candidateId, date, time } = parsed.data;
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const startsAt = new Date(`${date}T${time}:00Z`);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
    const result = await client.rpc('schedule_reactivation_visit', {
      target_tenant: tenantId,
      target_candidate: candidateId,
      target_date: date,
      target_starts_at: startsAt.toISOString(),
      target_ends_at: endsAt.toISOString(),
    });
    if (missing(result.error?.code)) return { status: 'error', message: migrationMessage };
    if (result.error) return { status: 'error', message: result.error.code === '42501' ? 'Approve the draft before scheduling, or check your permissions.' : 'The visit could not be scheduled.' };
    revalidatePath(`/workspaces/${tenantId}/reactivation`);
    revalidatePath(`/workspaces/${tenantId}/jobs`);
    revalidatePath(`/workspaces/${tenantId}/calendar`);
    return { status: 'success', message: 'Internal job and calendar visit created. No external calendar or message was written.' };
  } catch (error) {
    unstable_rethrow(error);
    return { status: 'error', message: 'Unable to schedule this visit.' };
  }
}
