import Link from 'next/link';
import { updateRecoveredPassword } from '@/app/actions/password-recovery';
import { ActionForm, Field } from '@/components/action-form';
import { Brand, Setup } from '@/components/ui';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  if (!isSupabaseConfigured()) return <Setup />;
  const query = await searchParams;
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  const unavailable = !!query.error || !!error || !user;
  return <main id="main" className="auth-page"><Brand /><div className="auth-card panel">
    <span className="eyebrow">ACCOUNT SECURITY</span>
    {unavailable ? <>
      <h1>Request a new link.</h1>
      <p role="alert" className="form-error">We could not verify access. Your recovery link may be invalid or expired, or your session may have ended.</p>
      <Link className="button" href="/forgot-password">Request recovery link</Link>
    </> : <>
      <h1>Change your password.</h1>
      <p>This changes the password for your currently signed-in account. You can also use this page after opening a verified recovery link.</p>
      <p id="password-guidance" className="small muted">Use a unique password and enter it twice to confirm.</p>
      <ActionForm action={updateRecoveredPassword} submitLabel="Change password">
        <Field label="New password" name="password" type="password" required maxLength={256} autoComplete="new-password" />
        <Field label="Confirm new password" name="confirmPassword" type="password" required maxLength={256} autoComplete="new-password" />
      </ActionForm>
    </>}
    <p><Link className="button secondary" href="/sign-in">Back to sign in</Link></p>
  </div></main>;
}
