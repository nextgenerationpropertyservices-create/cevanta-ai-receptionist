import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isCanonicalInvitationToken } from "@/lib/onboarding-validation";
import { ActionForm } from "@/components/action-form";
import { acceptClientInvitation } from "@/app/actions/invitations";
import { Brand, Setup } from "@/components/ui";

export default async function InvitePage({ searchParams }: { searchParams: Promise<{ request_id?: string; token?: string }> }) {
  if (!isSupabaseConfigured()) return <Setup />;
  const params = await searchParams;
  const requestId = typeof params.request_id === "string" && /^[0-9a-f-]{36}$/i.test(params.request_id) ? params.request_id : "";
  const token = typeof params.token === "string" && isCanonicalInvitationToken(params.token) ? params.token : "";
  const validLink = !!requestId && !!token;
  let signedIn = false;
  if (validLink) {
    const client = await createClient();
    const identity = await client.auth.getUser();
    signedIn = !identity.error && !!identity.data.user;
  }
  return <main id="main" className="auth-page"><Brand /><div className="auth-card panel">
    <span className="eyebrow">PRIVATE CLIENT INVITATION</span>
    <h1>Join your service workspace.</h1>
    {!validLink ? <><p className="form-error" role="alert">This invitation link is incomplete or invalid. Ask the workspace owner for a new link.</p><p><Link className="button secondary" href="/sign-in">Go to sign in</Link></p></> : !signedIn ? <><p>Sign in with the confirmed Cevanta account that received this invitation, then open this link again to finish joining the workspace.</p><div className="button-row"><Link className="button" href="/sign-in">Sign in</Link><Link className="button secondary" href="/sign-up">Create account</Link></div><p className="small muted">The account email must match the invitation. This link expires after seven days and can be used once.</p></> : <><p>You are signed in. Accept this invitation to add your account as the client workspace owner. You will start in Setup before any live integrations are enabled.</p><ActionForm action={acceptClientInvitation} submitLabel="Accept invitation" hidden={{ request_id: requestId, token }}>{null}</ActionForm><p className="small muted">If this is not the account the owner invited, sign out and return with the correct confirmed account.</p></>}
  </div></main>;
}


