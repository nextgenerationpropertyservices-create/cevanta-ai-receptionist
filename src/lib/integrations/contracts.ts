/** Design-only ports. No verifier, webhook endpoint, or persistence adapter ships in M1. */
export type IntegrationProvider = "retell" | "telnyx" | "twilio" | "make" | "calendar" | "sms" | "email" | "maps";

export interface UntrustedDelivery {
  readonly rawBody: Uint8Array;
  readonly headers: Readonly<Record<string, string | undefined>>;
  /** Chosen by server configuration, never by request body. */
  readonly connectionId: string;
  readonly receivedAt: string;
}

declare const verifiedDelivery: unique symbol;
/** Only a real server-side provider verifier may produce this type.
 * Type branding is not cryptographic verification or a runtime security boundary. */
export interface VerifiedDelivery {
  readonly [verifiedDelivery]: true;
  readonly provider: IntegrationProvider;
  readonly connectionId: string;
  readonly providerAccountId: string;
  readonly providerEventId: string;
  readonly providerCallId: string;
  readonly occurredAt: string;
  readonly verifiedAt: string;
  readonly outcome: CallOutcome;
}

/** Minimal normalized state; exclude raw transcripts, recordings and contact details. */
export type CallOutcome = "received" | "completed" | "missed" | "handoff_requested" | "failed";
export type VerificationResult =
  | { readonly ok: true; readonly delivery: VerifiedDelivery }
  | { readonly ok: false; readonly reason: "invalid_signature" | "expired" | "invalid_payload" | "unconfigured" };

export interface ProviderVerifier {
  /** Verify exact raw bytes, signature, configured account, freshness and schema.
   * Throwing or inability to verify must reject ingestion; never return success by default. */
  verify(input: UntrustedDelivery): Promise<VerificationResult>;
}

export interface TrustedTenantRoute {
  readonly tenantId: string;
  readonly connectionId: string;
  readonly provider: IntegrationProvider;
  readonly providerAccountId: string;
}

export interface TenantRouteResolver {
  /** Look up enabled, unique server-owned connection/account mapping.
   * Never trust tenantId supplied by callers, call metadata, phone numbers or Make payloads.
   * Missing, disabled or ambiguous mappings return null. */
  resolve(delivery: VerifiedDelivery): Promise<TrustedTenantRoute | null>;
}

export type IngestionResult =
  | { readonly status: "applied" | "duplicate"; readonly eventReference: string }
  | { readonly status: "rejected"; readonly reason: "unmapped_tenant" | "route_mismatch" | "stale_event" }
  | { readonly status: "retryable_failure" };

export interface DurableEventIngestion {
  /** Revalidate active route inside transaction. Enforce durable unique key
   * (provider, connectionId, providerAccountId, providerEventId), also scoped to tenant.
   * Receipt + call outcome + lead linkage + handoff/outbox writes commit atomically.
   * Never acknowledge applied before commit. Existing committed receipts return duplicate.
   * Lock call projection and reject stale transitions; dedupe lead by trusted call reference.
   * External side effects require a transactional outbox with durable retry keys. */
  apply(delivery: VerifiedDelivery, route: TrustedTenantRoute): Promise<IngestionResult>;
}

export type HandoffStatus = "requested" | "assigned" | "acknowledged" | "resolved" | "failed";
export interface HumanHandoffRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly callReference: string;
  readonly leadReference: string | null;
  readonly status: HandoffStatus;
  readonly assignedUserId: string | null;
  readonly requestedAt: string;
  readonly acknowledgedAt: string | null;
  readonly resolvedAt: string | null;
  readonly failureCode: string | null;
}
