'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { z } from 'zod';
import { OFFICE_ROLES } from '@/lib/contracts';
import type { Customer } from '@/lib/contracts';
import type { Lead } from '@/lib/intake-contracts';
import type { Job } from '@/lib/jobs-contracts';
import { buildReactivationDraft, isEligibleForReactivation, latestCompletedService } from '@/lib/reactivation';
import { campaignSchema, candidateActionSchema, scheduleSchema } from '@/lib/reactivation-validation';
import { requireMembership } from '@/lib/server/authorization';
import type { ActionState } from '@/lib/server/action-state';
import { getAuthoritativeWorkspacePlan, FREE_PLAN_LOCKED_MESSAGE } from '@/lib/workspace-plans';

const missing = (code?: string) => code === '42P01' || code === 'PGRST205' || code === 'PGRST202' || code === '42883';
const migrationMessage = 'Reactivation needs its database migration before it can be used.';
const requestIdSchema = z.uuid();
const campaignCommandResultSchema = z.union([
  z.object({ status: z.enum(['saved', 'replayed']), campaign_id: z.uuid(), campaign_status: z.enum(['draft', 'review']), candidate_count: z.number().int().min(0).max(250) }),
  z.object({ status: z.literal('conflict'), reason: z.literal('request_reuse') }),
]);
const candidateCommandResultSchema = z.object({ status: z.literal('saved'), candidate_id: z.uuid(), candidate_status: z.enum(['approved', 'dismissed']) });
const scheduleCommandResultSchema = z.tuple([z.object({ job_id: z.uuid(), appointment_id: z.uuid() }).strict()]);

export async function createReactivationCampaign(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const parsed = campaignSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the campaign fields.' };
    const parsedRequestId = requestIdSchema.safeParse(form.get('request_id'));
    if (!parsedRequestId.success) return { status: 'error', message: 'Refresh this page before creating the campaign.' };
    const { tenantId, name, season, channel, triggerType, weatherTrigger } = parsed.data;
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const plan = await getAuthoritativeWorkspacePlan(client, tenantId);
    if (plan === null || plan === 'free') return { status: 'error', message: FREE_PLAN_LOCKED_MESSAGE };

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
    const candidates = customers.flatMap(customer => {
      const lastServiceAt = latestCompletedService(customer.id, jobs);
      if (!isEligibleForReactivation(lastServiceAt) || (!customer.email && !customer.phone)) return [];
      const latestLead = latestLeadByCustomer.get(customer.id) ?? null;
      const draft = buildReactivationDraft({ customer, lastServiceAt, latestLead, season, channel, triggerType, weatherTrigger: weatherTrigger || null });
      return [{
        customer_id: customer.id,
        lead_id: latestLead?.id ?? null,
        last_service_at: lastServiceAt,
        reason: draft.reason,
        subject: draft.subject,
        message: draft.message,
      }];
    });
    const command = await client.rpc('create_reactivation_campaign', { input: {
      tenant_id: tenantId,
      request_id: parsedRequestId.data,
      name,
      season,
      channel,
      trigger_type: triggerType,
      weather_trigger: weatherTrigger || null,
      candidates,
    } });
    if (missing(command.error?.code)) return { status: 'error', message: migrationMessage };
    if (command.error) return { status: 'error', message: command.error.code === '22023' ? 'The campaign details or account history could not be accepted.' : 'Unable to create this campaign. Check permissions and try again.' };
    const commandResult = campaignCommandResultSchema.safeParse(command.data);
    if (!commandResult.success) return { status: 'error', message: 'Unable to create this campaign. Check permissions and try again.' };
    if (commandResult.data.status === 'conflict') return { status: 'error', message: 'This campaign request was already used with different details. Refresh and try again.' };
    if (commandResult.data.candidate_count !== candidates.length) return { status: 'error', message: 'Unable to confirm the campaign draft count. Refresh and review the campaign.' };
    revalidatePath(`/workspaces/${tenantId}/reactivation`);
    return { status: 'success', message: candidates.length ? `Campaign created with ${candidates.length} review draft${candidates.length === 1 ? '' : 's'}.` : 'Campaign created. No accounts currently meet the 12-month rule.' };
  } catch (error) {
    unstable_rethrow(error);
    return { status: 'error', message: 'Unable to create this campaign. Check permissions and try again.' };
  }
}

async function reviewReactivationCandidate(form: FormData, decision: 'approve' | 'dismiss'): Promise<ActionState> {
  try {
    const parsed = candidateActionSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: 'error', message: 'The campaign candidate is unavailable.' };
    const { tenantId, candidateId } = parsed.data;
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const plan = await getAuthoritativeWorkspacePlan(client, tenantId);
    if (plan === null || plan === 'free') return { status: 'error', message: FREE_PLAN_LOCKED_MESSAGE };
    const result = await client.rpc('review_reactivation_candidate', { input: { tenant_id: tenantId, candidate_id: candidateId, decision } });
    if (missing(result.error?.code)) return { status: 'error', message: migrationMessage };
    if (result.error) return { status: 'error', message: decision === 'approve' ? 'This draft is no longer waiting for approval.' : 'This candidate is no longer available to dismiss.' };
    const commandResult = candidateCommandResultSchema.safeParse(result.data);
    const expectedStatus = decision === 'approve' ? 'approved' : 'dismissed';
    if (!commandResult.success || commandResult.data.candidate_id !== candidateId || commandResult.data.candidate_status !== expectedStatus) {
      return { status: 'error', message: decision === 'approve' ? 'Unable to confirm this draft approval.' : 'Unable to confirm this candidate dismissal.' };
    }
    revalidatePath(`/workspaces/${tenantId}/reactivation`);
    return { status: 'success', message: decision === 'approve' ? 'Draft approved. No email or SMS was sent.' : 'Candidate dismissed.' };
  } catch (error) {
    unstable_rethrow(error);
    return { status: 'error', message: decision === 'approve' ? 'Unable to approve this draft.' : 'Unable to dismiss this candidate.' };
  }
}

export async function approveReactivationCandidate(_previous: ActionState, form: FormData): Promise<ActionState> {
  return reviewReactivationCandidate(form, 'approve');
}

export async function dismissReactivationCandidate(_previous: ActionState, form: FormData): Promise<ActionState> {
  return reviewReactivationCandidate(form, 'dismiss');
}

export async function scheduleReactivationCandidate(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const parsed = scheduleSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Choose a future visit time.' };
    const { tenantId, candidateId, date, time } = parsed.data;
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const plan = await getAuthoritativeWorkspacePlan(client, tenantId);
    if (plan === null || plan === 'free') return { status: 'error', message: FREE_PLAN_LOCKED_MESSAGE };
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
    if (!scheduleCommandResultSchema.safeParse(result.data).success) return { status: 'error', message: 'Unable to confirm the internal job and calendar visit.' };
    revalidatePath(`/workspaces/${tenantId}/reactivation`);
    revalidatePath(`/workspaces/${tenantId}/jobs`);
    revalidatePath(`/workspaces/${tenantId}/calendar`);
    return { status: 'success', message: 'Internal job and calendar visit created. No external calendar or message was written.' };
  } catch (error) {
    unstable_rethrow(error);
    return { status: 'error', message: 'Unable to schedule this visit.' };
  }
}
