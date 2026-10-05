import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signUp } from "@/app/actions/auth";
import { ActionForm, Field } from "@/components/action-form";
import { Brand, Setup } from "@/components/ui";

export default function SignUp() {
  if (!isSupabaseConfigured()) return <Setup />;
  return (
    <main id="main" className="auth-page">
      <Brand />
      <div className="auth-card panel">
        <span className="eyebrow">START YOUR WORKSPACE</span>
        <h1>Create your owner account.</h1>
        <p>Use this to set up the first workspace for an HVAC receptionist demo.</p>
        <ActionForm action={signUp} submitLabel="Create account">
          <Field label="Email address" name="email" type="email" required autoComplete="email" />
          <Field label="Password" name="password" type="password" required maxLength={256} autoComplete="new-password" />
          <Field label="Confirm password" name="confirmPassword" type="password" required maxLength={256} autoComplete="new-password" />
        </ActionForm>
        <p>
          <Link className="button secondary" href="/sign-in">I already have an account</Link>
        </p>
        <p className="small muted">After email confirmation, sign in and create your workspace.</p>
      </div>
    </main>
  );
}
