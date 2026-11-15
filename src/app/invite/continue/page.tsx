import Link from "next/link";
import { cookies } from "next/headers";
import { acceptClientInvitation } from "@/app/actions/invitations";
import { ActionForm } from "@/components/action-form";
import { Brand, Setup } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { INVITATION_CONTINUATION_COOKIE } from "@/lib/server/invitation-continuations";

export const dynamic = "force-dynamic";

export default async function InvitationContinuePage() {
  if (!isSupabaseConfigured()) return <Setup />;

  const continuationReady = (await cookies()).has(INVITATION_CONTINUATION_COOKIE);
  if (!continuationReady) {
    return (
      <main id="main" className="auth-page">
        <Brand />
        <div className="auth-card panel" aria-labelledby="invitation-title">
          <span className="eyebrow">PRIVATE CLIENT ACCESS</span>
          <h1 id="invitation-title">This invitation is unavailable.</h1>
          <p className="form-error" role="alert">
            Ask the Cevanta operator for a new private invitation, then open the new link in this browser.
          </p>
        </div>
      </main>
    );
  }

  const client = await createClient();
  const identity = await client.auth.getUser();
  const signedIn = !identity.error && !!identity.data.user;

  return (
    <main id="main" className="auth-page">
      <Brand />
      <div className="auth-card panel" aria-labelledby="invitation-title">
        <span className="eyebrow">PRIVATE CLIENT ACCESS</span>
        <h1 id="invitation-title">Finish joining your workspace.</h1>
        {!signedIn ? (
          <>
            <p>Sign in with the confirmed Cevanta account that received this invitation.</p>
            <p><Link className="button" href="/sign-in">Sign in to continue</Link></p>
            <p className="small muted">For your security, this invitation cannot create a new account or be moved to a different account.</p>
          </>
        ) : (
          <>
            <p>You are signed in. Accept the invitation to open the guided workspace setup.</p>
            <ActionForm action={acceptClientInvitation} submitLabel="Accept invitation">{null}</ActionForm>
            <p className="small muted">If this is not the account that received the invitation, sign out before accepting.</p>
          </>
        )}
      </div>
    </main>
  );
}

