"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/server/action-state";
import { passwordRecoveryOrigin } from "@/lib/server/password-recovery-origin";
import { recoveryEmailSchema, recoveredPasswordSchema } from "@/lib/password-recovery-validation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const genericRequest: ActionState = { status: "success", message: "If an account matches that email, you will receive password reset instructions. Check your inbox and spam folder; if nothing arrives, wait a few minutes before trying again." };

export async function requestPasswordRecovery(_previous: ActionState, form: FormData): Promise<ActionState> {
  const parsed = recoveryEmailSchema.safeParse({ email: form.get("email") });
  if (!parsed.success) return { status: "error", message: "Enter a valid email address." };
  if (!isSupabaseConfigured()) return { status: "error", message: "Password recovery is temporarily unavailable." };
  let origin: string;
  try { origin = passwordRecoveryOrigin(); }
  catch { return { status: "error", message: "Password recovery is temporarily unavailable." }; }
  try {
    const client = await createClient();
    await client.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${origin}/auth/recovery` });
  } catch { /* Provider failures must not disclose account existence or payloads. */ }
  return { ...genericRequest };
}

export async function updateRecoveredPassword(_previous: ActionState, form: FormData): Promise<ActionState> {
  const parsed = recoveredPasswordSchema.safeParse({ password: form.get("password"), confirmPassword: form.get("confirmPassword") });
  if (!parsed.success) return { status: "error", message: "Enter matching passwords between 1 and 256 characters." };
  if (!isSupabaseConfigured()) return { status: "error", message: "Password updates are temporarily unavailable." };
  let updated = false;
  try {
    const client = await createClient();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return { status: "error", message: "Sign in or request a new reset link before changing your password." };
    const result = await client.auth.updateUser({ password: parsed.data.password });
    if (result.error) return { status: "error", message: "Unable to update your password. Check the password requirements and try again." };
    updated = true;
    const signedOut = await client.auth.signOut({ scope: "local" });
    if (signedOut.error) return { status: "error", message: "Your password changed, but this browser could not sign out. Sign out before signing in with your new password." };
  } catch {
    return { status: "error", message: updated ? "Your password changed, but this browser could not sign out. Sign out before signing in with your new password." : "Password updates are temporarily unavailable. Please try again." };
  }
  redirect("/sign-in?reset=success");
}
