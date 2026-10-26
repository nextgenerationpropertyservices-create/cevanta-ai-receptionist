import { z } from 'zod';
import { REACTIVATION_CHANNELS, REACTIVATION_SEASONS, REACTIVATION_TRIGGERS } from './reactivation-contracts';

export const campaignSchema = z.object({
  tenantId: z.uuid(),
  name: z.string().trim().min(1).max(160),
  season: z.enum(REACTIVATION_SEASONS),
  channel: z.enum(REACTIVATION_CHANNELS),
  triggerType: z.enum(REACTIVATION_TRIGGERS),
  weatherTrigger: z.string().trim().max(240).optional().or(z.literal('')),
}).superRefine((value, context) => {
  if (value.triggerType === 'weather' && !value.weatherTrigger) context.addIssue({ code: 'custom', path: ['weatherTrigger'], message: 'Add the weather event that should trigger this campaign.' });
});

export const candidateActionSchema = z.object({ tenantId: z.uuid(), candidateId: z.uuid() });

export const scheduleSchema = z.object({
  tenantId: z.uuid(),
  candidateId: z.uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid visit date.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Choose a valid visit time.'),
}).superRefine((value, context) => {
  const starts = new Date(`${value.date}T${value.time}:00Z`);
  if (Number.isNaN(starts.getTime()) || starts <= new Date()) context.addIssue({ code: 'custom', path: ['date'], message: 'Choose a future visit time.' });
});
