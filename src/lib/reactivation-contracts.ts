export const REACTIVATION_SEASONS = ['spring', 'fall', 'custom'] as const;
export const REACTIVATION_CHANNELS = ['email', 'sms', 'both'] as const;
export const REACTIVATION_TRIGGERS = ['seasonal', 'weather', 'manual'] as const;
export const CAMPAIGN_STATUSES = ['draft', 'review', 'approved', 'paused', 'completed'] as const;
export const CANDIDATE_STATUSES = ['draft', 'approved', 'dismissed', 'scheduled', 'booked'] as const;

export type ReactivationSeason = typeof REACTIVATION_SEASONS[number];
export type ReactivationChannel = typeof REACTIVATION_CHANNELS[number];
export type ReactivationTrigger = typeof REACTIVATION_TRIGGERS[number];
export type CampaignStatus = typeof CAMPAIGN_STATUSES[number];
export type CandidateStatus = typeof CANDIDATE_STATUSES[number];

export interface ReactivationCampaign {
  id: string;
  tenant_id: string;
  name: string;
  season: ReactivationSeason;
  channel: ReactivationChannel;
  trigger_type: ReactivationTrigger;
  weather_trigger: string | null;
  status: CampaignStatus;
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReactivationCandidate {
  id: string;
  tenant_id: string;
  campaign_id: string;
  customer_id: string;
  lead_id: string | null;
  last_service_at: string | null;
  reason: string;
  channel: ReactivationChannel;
  subject: string;
  message: string;
  status: CandidateStatus;
  preferred_date: string | null;
  preferred_time: string | null;
  job_id: string | null;
  appointment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReactivationCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  lastServiceAt: string | null;
  latestLeadId: string | null;
  latestLeadSummary: string | null;
  eligible: boolean;
  reason: string;
}

export interface ReactivationInbox {
  ready: boolean;
  campaigns: ReactivationCampaign[];
  candidates: ReactivationCandidate[];
  eligibleCustomers: ReactivationCustomer[];
}
