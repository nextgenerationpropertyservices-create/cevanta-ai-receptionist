import "server-only";
import { z } from "zod";
import { unstable_rethrow } from "next/navigation";
import { ROLES } from "@/lib/contracts";
import { ONBOARDING_RPC, ONBOARDING_STEPS, PENDING_ONBOARDING_READINESS, VALIDATION_CODES, MAX_ONBOARDING_VERSION, type ConfigurationCommand, type ConfigurationResult, type InvitationAcceptanceResult, type OnboardingHistoryListResult, type OnboardingHistoryReenableResult, type OnboardingSnapshotResult } from "@/lib/onboarding-contracts";
import { validateConfiguration, validateResume, validateInvitationAcceptance, validateOnboardingHistoryList, validateOnboardingHistoryReenable, isOnboardingDate } from "@/lib/onboarding-validation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const uuid = z.uuid();
const version = z.number().int().min(1).max(MAX_ONBOARDING_VERSION);
const revision = z.number().int().min(0).max(MAX_ONBOARDING_VERSION);
const text = (max: number) => z.string().refine(v => !v.includes("\0") && [...v].length <= max);
const field = z.string().max(160).refine(v => /^(input|payload|command|tenant_id|request_id|expected_config_revision|expected_version|step_id|name|trade|timezone|business_contact_name|business_email|business_phone|items|days|date|closed|intervals|lead_time_minutes|buffer_before_minutes|buffer_after_minutes|horizon_days|notes|acknowledged|kind|state|limit|cursor|search|sort|direction|row_id|description|label|contact_name|email|phone|position)(\.(\d{1,3}|id|name|description|enabled|position|label|contact_name|email|phone|weekday|closed|intervals|start_minute|end_minute|tenant_id|request_id|expected_config_revision|expected_version|payload|step_id))*$/.test(v));
const unavailable = z.object({ status: z.literal("unavailable") }).strict();
const retryable = z.object({ status: z.literal("retryable_failure") }).strict();
const failure = z.union([unavailable, retryable, z.object({status:z.literal("conflict"),reason:z.enum(["revision","request_reuse","version_exhausted"])}).strict(),z.object({status:z.literal("validation_error"),issues:z.array(z.object({field,code:z.enum(VALIDATION_CODES)}).strict()).min(1).max(32)}).strict()]);
const saved = z.object({status:z.enum(["saved","replayed"]),entity:z.enum(["setup","exception","resume"]),id:uuid.nullable(),version,config_revision:revision}).strict();
const configuration = z.union([saved,failure]);
const invitation = z.union([unavailable,retryable,z.object({status:z.literal("membership_conflict")}).strict(),z.object({status:z.literal("conflict"),reason:z.literal("request_reuse")}).strict(),z.object({status:z.enum(["accepted","already_accepted","replayed"]),acceptance:z.object({invitation_id:uuid,accepted_at:z.iso.datetime({precision:6})}).strict(),workspace:z.object({id:uuid,name:text(160)}).strict(),role:z.enum(ROLES),entry:z.enum(["setup","dashboard"])}).strict()]);
const interval = z.object({start_minute:z.number().int().min(0).max(1439),end_minute:z.number().int().min(1).max(1440)}).strict().refine(v=>v.start_minute<v.end_minute);
const intervals = z.array(interval).max(8);
const historyKind = z.enum(["services","escalation_contacts","date_exceptions"]);
const historyPage = z.object({limit:z.number().int().min(1).max(50),next_cursor:text(512).nullable(),has_more:z.boolean()}).strict();
const historyService = z.object({id:uuid,kind:z.literal("service"),state:z.enum(["disabled","active"]),version,name:text(120),description:text(2000),position:z.number().int().min(0).max(9999),updated_at:z.iso.datetime({precision:6}),can_reenable:z.boolean()}).strict();
const historyContact = z.object({id:uuid,kind:z.literal("escalation_contact"),state:z.enum(["disabled","active"]),version,label:text(120),contact_name:text(160),email:text(254).nullable(),phone:text(40).nullable(),position:z.number().int().min(0).max(9999),updated_at:z.iso.datetime({precision:6}),can_reenable:z.boolean()}).strict();
const historyException = z.object({id:uuid,kind:z.literal("date_exception"),state:z.enum(["inactive","active"]),version,date:z.string().refine(isOnboardingDate),closed:z.boolean(),intervals,updated_at:z.iso.datetime({precision:6}),can_reenable:z.boolean()}).strict();
const historyList = z.union([unavailable,retryable,z.object({status:z.literal("validation_error"),issues:z.array(z.object({field,code:z.enum(VALIDATION_CODES)}).strict()).min(1).max(32)}).strict(),z.object({status:z.literal("available"),tenant_id:uuid,kind:historyKind,config_revision:revision,items:z.array(z.union([historyService,historyContact,historyException])).max(50),page:historyPage}).strict()]);
const historyReenable = z.union([failure,z.object({status:z.enum(["saved","replayed"]),entity:z.literal("history_reenable"),kind:historyKind,id:uuid,version,config_revision:revision}).strict()]);
const day = z.object({weekday:z.number().int().min(0).max(6),closed:z.boolean(),intervals}).strict();
const days = z.array(day).max(7);
const workspace = z.object({id:uuid,name:text(160),trade:text(80),timezone:text(100)}).strict();
const contact = {business_contact_name:text(160),business_email:text(254).nullable(),business_phone:text(40).nullable()};
const service = z.object({id:uuid,name:text(120),description:text(2000),enabled:z.literal(true),position:z.number().int().min(0).max(9999),version}).strict();
const exception = {id:uuid,date:z.string().refine(isOnboardingDate),closed:z.boolean(),intervals};
const booking = z.object({mode:z.literal("request_only"),lead_time_minutes:z.number().int().min(0).max(525600).nullable(),buffer_before_minutes:z.number().int().min(0).max(1440).nullable(),buffer_after_minutes:z.number().int().min(0).max(1440).nullable(),horizon_days:z.number().int().min(1).max(730).nullable(),notes:text(2000),acknowledged:z.boolean()}).strict().nullable();
const readiness = z.object({configuration_state:z.literal(PENDING_ONBOARDING_READINESS.configuration_state),manual_workspace_state:z.literal("not_evaluated"),reason:z.literal("setup_policy_pending"),next_action:z.literal("platform_operator"),booking_state:z.literal("blocked"),release_state:z.literal("not_evaluated"),hostedReady:z.literal(false),providerConnectionAuthorized:z.literal(false)}).strict();
const owner = z.object({projection:z.literal("owner_setup"),workspace,flow_version:z.literal("onboarding-v1"),config_revision:revision,profile:z.object(contact).strict().nullable(),services:z.array(service).max(100),weekly_hours:days,exceptions:z.array(z.object({...exception,active:z.literal(true),version}).strict()).max(366),booking,escalation:z.array(z.object({id:uuid,label:text(120),contact_name:text(160),email:text(254).nullable(),phone:text(40).nullable(),enabled:z.literal(true),position:z.number().int().min(0).max(9999),version}).strict()).max(20),resume_step:z.enum(ONBOARDING_STEPS),resume_version:revision,readiness}).strict();
const dispatcher = z.object({projection:z.literal("dispatcher_operations"),workspace,config_revision:revision,services:z.array(z.object({id:uuid,name:text(120),enabled:z.literal(true)}).strict()).max(100),weekly_hours:days,exceptions:z.array(z.object(exception).strict()).max(366),booking}).strict();
const basic = z.object({projection:z.literal("workspace"),workspace:z.object({id:uuid,name:text(160)}).strict(),role:z.enum(["technician","viewer"])}).strict();
const snapshot = z.union([unavailable,retryable,z.object({status:z.literal("available"),snapshot:z.union([owner,dispatcher,basic])}).strict()]);

// Returned data is parsed, never cast or logged. Gateway errors never enter responses.
async function invoke<T>(name: string, args: Record<string, unknown>, schema: z.ZodType<T>, tenant?: string, office = false): Promise<{ result: T | {status:"unavailable"|"retryable_failure"}; role?: string }> {
  try {
    if (!isSupabaseConfigured()) return {result:{status:"retryable_failure"}};
    const client = await createClient();
    const identity = await client.auth.getUser();
    if (identity.error || !identity.data.user) return {result:{status:"unavailable"}};
    let role: string | undefined;
    if (tenant) {
      const member = await client.from("memberships").select("role").eq("tenant_id",tenant).eq("user_id",identity.data.user.id).maybeSingle();
      if (member.error) return {result:{status:"retryable_failure"}};
      const parsed = z.enum(ROLES).safeParse(member.data?.role);
      if (!parsed.success || (office && parsed.data !== "owner" && parsed.data !== "admin")) return {result:{status:"unavailable"}};
      role = parsed.data;
    }
    const response = await client.rpc(name,args);
    if (response.error) return {result:{status:"retryable_failure"}};
    const decoded = schema.safeParse(response.data);
    return {result:decoded.success ? decoded.data : {status:"retryable_failure"},role};
  } catch (error) { unstable_rethrow(error); return {result:{status:"retryable_failure"}}; }
}

export async function configureOnboarding(command: ConfigurationCommand, input: unknown): Promise<ConfigurationResult> {
  const checked = validateConfiguration(command,input);
  if (!checked.ok) return {status:"validation_error",issues:checked.issues};
  const {result} = await invoke(ONBOARDING_RPC.configure,{command,input:checked.value},configuration,checked.value.tenant_id,true);
  if (result.status === "saved" || result.status === "replayed") {
    const entity = command === "upsert_hours_exception" || command === "remove_hours_exception" ? "exception" : "setup";
    if (result.entity !== entity || result.version !== result.config_revision || (entity === "setup" && result.id !== checked.value.tenant_id) || (command === "upsert_hours_exception" && !result.id)) return {status:"retryable_failure"};
  }
  return result;
}
export async function saveOnboardingResume(input: unknown): Promise<ConfigurationResult> {
  const checked=validateResume(input); if (!checked.ok) return {status:"validation_error",issues:checked.issues};
  const {result}=await invoke(ONBOARDING_RPC.saveResume,{input:checked.value},configuration,checked.value.tenant_id,true);
  if ((result.status === "saved" || result.status === "replayed") && (result.entity !== "resume" || !result.id)) return {status:"retryable_failure"};
  return result;
}
export async function acceptOnboardingInvitation(input: unknown): Promise<InvitationAcceptanceResult> {
  const checked=validateInvitationAcceptance(input); if (!checked.ok) return {status:"unavailable"};
  return (await invoke(ONBOARDING_RPC.acceptInvitation,{input:checked.value},invitation)).result;
}
export async function getOnboardingSnapshot(tenantId: string): Promise<OnboardingSnapshotResult> {
  if (!uuid.safeParse(tenantId).success) return {status:"unavailable"};
  tenantId=tenantId.toLowerCase();
  const {result,role}=await invoke(ONBOARDING_RPC.snapshot,{target:tenantId},snapshot,tenantId);
  if (result.status === "available") {
    const data=result.snapshot;
    const expected=role === "owner" || role === "admin" ? "owner_setup" : role === "dispatcher" ? "dispatcher_operations" : "workspace";
    if (data.workspace.id !== tenantId || data.projection !== expected || (data.projection === "workspace" && data.role !== role)) return {status:"retryable_failure"};
  }
  return result;
}


export async function listOnboardingHistory(input: unknown): Promise<OnboardingHistoryListResult> {
  const checked = validateOnboardingHistoryList(input);
  if (!checked.ok) return {status:"validation_error",issues:checked.issues};
  const {result} = await invoke(ONBOARDING_RPC.historyList,{input:checked.value},historyList,checked.value.tenant_id,true);
  if (result.status === "available") {
    if (result.tenant_id !== checked.value.tenant_id || result.kind !== checked.value.kind || result.page.limit !== checked.value.limit) return {status:"retryable_failure"};
    if (result.items.some(item => (checked.value.kind === "services" && item.kind !== "service") || (checked.value.kind === "escalation_contacts" && item.kind !== "escalation_contact") || (checked.value.kind === "date_exceptions" && item.kind !== "date_exception"))) return {status:"retryable_failure"};
  }
  return result;
}
export async function reenableOnboardingHistoryItem(input: unknown): Promise<OnboardingHistoryReenableResult> {
  const checked = validateOnboardingHistoryReenable(input);
  if (!checked.ok) return {status:"validation_error",issues:checked.issues};
  const {result} = await invoke(ONBOARDING_RPC.historyReenable,{input:checked.value},historyReenable,checked.value.tenant_id,true);
  if ((result.status === "saved" || result.status === "replayed") && (result.entity !== "history_reenable" || result.kind !== checked.value.kind || result.id !== checked.value.row_id)) return {status:"retryable_failure"};
  return result;
}
