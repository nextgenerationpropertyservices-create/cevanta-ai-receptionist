"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signInSchema, signUpSchema, workspaceProvisionSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ActionState } from "@/lib/server/action-state";
import { passwordRecoveryOrigin } from "@/lib/server/password-recovery-origin";

function signInFailure(error: unknown): ActionState {
  const metadata = error && typeof error === "object" ? error as { code?: unknown; status?: unknown } : {};
  const status = typeof metadata.status === "number" && Number.isInteger(metadata.status)
    && metadata.status >= 400 && metadata.status <= 599 ? metadata.status : undefined;
  let category = "unknown";
  let message = "Unable to sign in. Check your email and password.";
  if (metadata.code === "invalid_credentials") {
    category = "invalid_credentials";
  } else if (metadata.code === "email_not_confirmed") {
    category = "email_not_confirmed";
    message = "Confirm your email before signing in. Ask your administrator to check your account confirmation.";
  } else if (metadata.code === "over_request_rate_limit" || metadata.code === "over_email_send_rate_limit" || status === 429) {
    category = "rate_limited";
    message = "Too many sign-in attempts. Wait a few minutes before trying again.";
  } else if (metadata.code === "email_provider_disabled") {
    category = "email_provider_disabled";
    message = "Email sign-in is unavailable. Ask your administrator to check the authentication settings.";
  } else if (metadata.code === "request_timeout" || (status !== undefined && status >= 500)) {
    category = "unavailable";
    message = "Sign-in is temporarily unavailable. Please try again.";
  }
  // Never log provider messages, arbitrary codes, credentials, or account details.
  console.warn("[auth.signIn]", status === undefined ? { category } : { category, status });
  return { status: "error", message };
}

export async function signIn(_previous: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { status: "error", message: "Complete Supabase setup before signing in." };
  const parsed = signInSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: "Enter a valid email and password." };
  try {
    const client = await createClient();
    const result = await client.auth.signInWithPassword(parsed.data);
    if (result.error) return signInFailure(result.error);
  } catch {
    console.warn("[auth.signIn]", { category: "unavailable" });
    return { status: "error", message: "Sign-in is temporarily unavailable. Please try again." };
  }
  redirect("/workspaces");
}

function signUpFailure(error: unknown): ActionState {
  const metadata = error && typeof error === "object" ? error as { code?: unknown; status?: unknown } : {};
  const status = typeof metadata.status === "number" && Number.isInteger(metadata.status)
    && metadata.status >= 400 && metadata.status <= 599 ? metadata.status : undefined;
  let category = "unknown";
  let message = "Unable to create the account. Please try again.";
  if (metadata.code === "user_already_exists" || metadata.code === "email_exists") {
    category = "existing_account";
    message = "If that email already has an account, sign in or use password reset.";
  } else if (metadata.code === "over_request_rate_limit" || metadata.code === "over_email_send_rate_limit" || status === 429) {
    category = "rate_limited";
    message = "Too many signup attempts. Wait a few minutes before trying again.";
  } else if (metadata.code === "email_provider_disabled" || metadata.code === "signup_disabled") {
    category = "auth_unavailable";
    message = "New account signup is unavailable. Check the authentication settings before selling self-service access.";
  } else if (metadata.code === "request_timeout" || (status !== undefined && status >= 500)) {
    category = "unavailable";
    message = "Signup is temporarily unavailable. Please try again.";
  }
  console.warn("[auth.signUp]", status === undefined ? { category } : { category, status });
  return { status: "error", message };
}

export async function signUp(_previous: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { status: "error", message: "Complete Supabase setup before creating accounts." };
  const parsed = signUpSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: "Enter a valid email and matching password.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  try {
    const client = await createClient();
    const result = await client.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${passwordRecoveryOrigin()}/auth/callback` },
    });
    if (result.error) return signUpFailure(result.error);
  } catch {
    console.warn("[auth.signUp]", { category: "unavailable" });
    return { status: "error", message: "Signup is temporarily unavailable. Please try again." };
  }
  return {
    status: "success",
    message: "Check your email to confirm your account. After confirmation, sign in and create your workspace.",
  };
}

const provisionResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.union([z.literal("saved"), z.literal("replayed")]),
    workspace: z.object({ id: z.uuid(), name: z.string(), trade: z.string(), timezone: z.string() }),
  }),
  z.object({ status: z.literal("validation_error"), issues: z.array(z.object({ path: z.string(), message: z.string() })).optional() }),
  z.object({ status: z.literal("conflict"), reason: z.string().optional() }),
  z.object({ status: z.union([z.literal("unavailable"), z.literal("retryable_failure")]) }),
]);

export async function provisionWorkspace(_previous: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { status: "error", message: "Complete Supabase setup before creating a workspace." };
  const parsed = workspaceProvisionSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: "Fix the workspace details and try again.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  let destination: string | null = null;
  try {
    const client = await createClient();
    const { data: userResult, error: userError } = await client.auth.getUser();
    if (userError || !userResult.user) return { status: "error", message: "Sign in with a confirmed account before creating a workspace." };
    const { data, error } = await client.rpc("provision_owner_workspace", { input: parsed.data });
    if (error) {
      console.warn("[workspace.provision]", { category: "rpc_error" });
      return { status: "error", message: "Workspace creation is temporarily unavailable. Please try again." };
    }
    const response = provisionResponseSchema.safeParse(data);
    if (!response.success) {
      console.warn("[workspace.provision]", { category: "unexpected_response" });
      return { status: "error", message: "Workspace creation is temporarily unavailable. Please try again." };
    }
    if (response.data.status === "saved" || response.data.status === "replayed") {
      destination = `/workspaces/${response.data.workspace.id}/onboarding`;
    } else if (response.data.status === "validation_error") {
      return { status: "error", message: "Fix the workspace details and try again." };
    } else if (response.data.status === "conflict") {
      return { status: "error", message: "This setup request was already used with different details. Refresh and try again." };
    } else if (response.data.status === "unavailable") {
      return { status: "error", message: "Workspace creation is available only for a confirmed account that does not already belong to a workspace." };
    } else {
      return { status: "error", message: "Workspace creation is temporarily unavailable. Please try again." };
    }
  } catch {
    console.warn("[workspace.provision]", { category: "unavailable" });
    return { status: "error", message: "Workspace creation is temporarily unavailable. Please try again." };
  }
  redirect(destination);
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const client = await createClient();
    const { error } = await client.auth.signOut();
    if (error) throw new Error("Unable to sign out. Please try again.");
  }
  redirect("/sign-in");
}
