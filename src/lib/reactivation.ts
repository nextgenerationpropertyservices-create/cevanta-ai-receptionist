import type { Customer } from '@/lib/contracts';
import type { Lead } from '@/lib/intake-contracts';
import type { Job } from '@/lib/jobs-contracts';
import type { ReactivationChannel, ReactivationSeason, ReactivationTrigger } from './reactivation-contracts';

export interface ReactivationDraftInput {
  customer: Customer;
  lastServiceAt: string | null;
  latestLead: Lead | null;
  season: ReactivationSeason;
  channel: ReactivationChannel;
  triggerType: ReactivationTrigger;
  weatherTrigger?: string | null;
}

export function serviceDateForJob(job: Job): string | null {
  if (job.status !== 'completed' || !job.scheduled_date) return null;
  return job.scheduled_date;
}

export function latestCompletedService(customerId: string, jobs: Job[]): string | null {
  const dates = jobs
    .filter(job => job.customer_id === customerId)
    .map(serviceDateForJob)
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => b.localeCompare(a));
  return dates[0] ?? null;
}

export function isOlderThanTwelveMonths(value: string | null, now = new Date()): boolean {
  if (!value) return false;
  const service = new Date(`${value}T00:00:00Z`);
  const cutoff = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate()));
  return service < cutoff;
}

export function campaignSeasonLabel(season: ReactivationSeason): string {
  if (season === 'spring') return 'spring maintenance';
  if (season === 'fall') return 'fall maintenance';
  return 'seasonal maintenance';
}

export function candidateReason(lastServiceAt: string | null): string {
  return lastServiceAt
    ? `Last completed service was ${lastServiceAt}; this account is beyond the 12-month maintenance window.`
    : 'No completed service date is recorded for this account; review the history before contacting them.';
}

export function isEligibleForReactivation(lastServiceAt: string | null, now = new Date()): boolean {
  return isOlderThanTwelveMonths(lastServiceAt, now);
}

export function buildReactivationDraft(input: ReactivationDraftInput): { subject: string; message: string; reason: string } {
  const seasonLabel = campaignSeasonLabel(input.season);
  const historyLine = input.lastServiceAt
    ? `Our records show the last completed service was ${input.lastServiceAt}.`
    : 'We are reviewing accounts that may be due for a maintenance visit.';
  const issueLine = input.latestLead?.description
    ? ` We also have a prior service request noted as: ${input.latestLead.description.slice(0, 220)}.`
    : '';
  const weatherLine = input.triggerType === 'weather' && input.weatherTrigger
    ? ` This outreach is timed around ${input.weatherTrigger}.`
    : '';
  const subject = input.season === 'fall'
    ? `${input.customer.name}: prepare your equipment for the heating season`
    : `${input.customer.name}: plan your ${seasonLabel} maintenance visit`;
  const message = `Hi ${input.customer.name},\n\n${historyLine}${issueLine}${weatherLine} We would like to help you plan a maintenance visit before a small issue becomes an interruption.\n\nReply with a preferred day or ask a question, and our office will review the request and confirm the next step. This message does not confirm an appointment or price.\n\n— Cevanta service team`;
  return { subject, message, reason: candidateReason(input.lastServiceAt) };
}
