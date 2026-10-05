import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { signIn } from '@/app/actions/auth';
import { ActionForm,Field } from '@/components/action-form';
import { Brand,Setup } from '@/components/ui';
export default async function SignIn({searchParams}: {searchParams:Promise<{reset?:string|string[]}>}) { const {reset}=await searchParams; if(!isSupabaseConfigured()) return <Setup/>; return <main id="main" className="auth-page"><Brand/><div className="auth-card panel"><span className="eyebrow">WELCOME BACK</span><h1>Your team.<br/>Your workspace.</h1><p>Sign in to keep your service business moving.</p>{reset === 'success' && <p className="notice" role="status">If your password change completed, sign in with your new password.</p>}<ActionForm action={signIn} submitLabel="Sign in"><Field label="Email address" name="email" type="email" required autoComplete="username"/><Field label="Password" name="password" type="password" required maxLength={256} autoComplete="current-password"/></ActionForm><p><Link className="button secondary" href="/forgot-password">Forgot password?</Link></p><p><Link className="button secondary" href="/sign-up">Create owner account</Link></p><p className="small muted">Need access to an existing company? Ask your workspace owner to create your account and assign membership.</p></div></main>; }



