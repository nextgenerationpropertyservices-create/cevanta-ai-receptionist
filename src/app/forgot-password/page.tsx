import Link from 'next/link';
import { requestPasswordRecovery } from '@/app/actions/password-recovery';
import { ActionForm, Field } from '@/components/action-form';
import { Brand, Setup } from '@/components/ui';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function ForgotPassword() {
  if (!isSupabaseConfigured()) return <Setup />;
  return <main id="main" className="auth-page"><Brand /><div className="auth-card panel">
    <span className="eyebrow">ACCOUNT ACCESS</span><h1>Forgot your password?</h1>
    <p>Enter your account email to request a password recovery link. Check your inbox and spam folder if a link arrives.</p>
    <ActionForm action={requestPasswordRecovery} submitLabel="Request recovery link">
      <Field label="Email address" name="email" type="email" required maxLength={254} autoComplete="email" />
    </ActionForm>
    <p className="small muted">For your privacy, the response does not confirm whether an account exists.</p>
    <Link className="button secondary" href="/sign-in">Back to sign in</Link>
  </div></main>;
}
