"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireMembership } from "@/lib/server/authorization";
import type { ActionState } from "@/lib/server/action-state";
import { isCanonicalInvitationToken } from "@/lib/onboarding-validation";
import { acceptInvitationContinuation, INVITATION_CONTINUATION_COOKIE } from "@/lib/server/invitation-continuations";
import { passwordRecoveryOrigin } from "@/lib/server/password-recovery-origin";

const issueSchema = z.object({
  request_id: z.uuid(),
  operator_tenant_id: z.uuid(),
  client_tenant_id: z.uuid(),
  recipient_email: z.email().max(254).transform(value => value.trim().toLowerCase()),
});
const responseSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("created"), invitation_id: z.uuid(), recipient_email: z.email(), intended_role: z.literal("owner"), expires_at: z.iso.datetime({ precision: 6 }) }),
  z.object({ status: z.enum(["not_found", "membership_conflict", "already_pending", "unavailable", "validation_error", "conflict", "retryable_failure"]) }),
]);

type InvitationState = ActionState & { inviteUrl?: string; expiresAt?: string };

function invitationTokenDigest(token: string): string | null {
  if (!isCanonicalInvitationToken(token)) return null;
  const tokenBytes = Buffer.from(token, "base64url");
  if (tokenBytes.byteLength !== 32 || tokenBytes.toString("base64url") !== token) return null;
  return createHash("sha256").update(tokenBytes).digest("hex");
}

export async function issueClientInvitation(_previous: InvitationState, form: FormData): Promise<InvitationState> {
  const parsed = issueSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: "Enter a confirmed client account email and try again." };
  const token = randomBytes(32).toString("base64url");
  const tokenDigestHex = invitationTokenDigest(token);
  if (!tokenDigestHex) return { status: "error", message: "Could not prepare the invitation. Please retry." };
  let origin: string;
  try { origin = passwordRecoveryOrigin(); } catch { return { status: "error", message: "The application origin is not configured for invite links." }; }
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  try {
    const { client } = await requireMembership(parsed.data.operator_tenant_id, ["owner", "admin"]);
    const { data, error } = await client.rpc("issue_client_invitation", {
      input: {
        request_id: parsed.data.request_id,
        operator_tenant_id: parsed.data.operator_tenant_id,
        client_tenant_id: parsed.data.client_tenant_id,
        recipient_email: parsed.data.recipient_email,
        intended_role: "owner",
        token_digest_hex: tokenDigestHex,
        expires_at: expiresAt,
      },
    });
    if (error) return { status: "error", message: "The invitation could not be created. Check the account email and try again." };
    const response = responseSchema.safeParse(data);
    if (!response.success) return { status: "error", message: "The invitation could not be created. Please retry." };
    if (response.data.status !== "created") {
      const messages: Record<string, string> = {
        not_found: "That email must have a confirmed Cevanta account before it can be invited.",
        membership_conflict: "That account already has access to this workspace.",
        already_pending: "An invitation is already pending for that account.",
        unavailable: "Only an internal owner or admin can invite a client owner.",
        validation_error: "Check the invitation details and try again.",
        conflict: "This invitation request was already used. Start a new invitation.",
        retryable_failure: "The invitation service is temporarily unavailable. Please retry.",
      };
      return { status: "error", message: messages[response.data.status] ?? "The invitation could not be created." };
    }
    const inviteUrl = `${origin}/invite#v=1&r=${parsed.data.request_id}&t=${token}`;
    revalidatePath(`/workspaces/${parsed.data.operator_tenant_id}/clients`);
    return { status: "success", message: "Private invitation created. Copy it now; the token is shown only once.", inviteUrl, expiresAt: response.data.expires_at };
  } catch {
    return { status: "error", message: "The invitation could not be created. Check permissions and try again." };
  }
}

export async function acceptClientInvitation(_previous: ActionState, _form: FormData): Promise<ActionState> {
  void _previous;
  void _form;
  const cookieStore = await cookies();
  const continuation = cookieStore.get(INVITATION_CONTINUATION_COOKIE)?.value ?? "";
  cookieStore.delete(INVITATION_CONTINUATION_COOKIE);
  const result = await acceptInvitationContinuation(continuation);
  if (result.status === "accepted") redirect(`/workspaces/${result.workspace.id}/onboarding`);
  return { status: "error", message: "This invitation is unavailable. Ask the Cevanta operator for a new private invitation." };
}


