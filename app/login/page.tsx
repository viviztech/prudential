/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "@/components/native-link";
import { Button } from "@/components/ui/button";
import { userCount } from "@/db/auth";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

type Props = { searchParams?: Promise<{ error?: string; return_to?: string; signed_out?: string }> };
export default async function LoginPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const returnTo = params.return_to?.startsWith("/") && !params.return_to.startsWith("//") ? params.return_to : "/admin";
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const firstAccount = hasDatabase ? (await userCount()) === 0 : false;
  return <main id="main-content" className="auth-page">
    <section className="auth-brand-panel" aria-label="Prudential ISO certificate workspace">
      <Link className="brand auth-brand" href="/">
        <span className="relative size-12 overflow-hidden rounded-xl border border-white/20 bg-white"><img className="absolute left-1/2 top-0 h-[70px] w-[70px] max-w-none -translate-x-1/2 object-cover object-top" src="/ps-logo.jpg" alt="" /></span>
        <span><strong>Prudential</strong><small>Assessment Services LLP</small></span>
      </Link>
      <div className="auth-brand-copy"><p className="eyebrow">Certificate workspace</p><h1>From checklist to final copy.</h1><p>Prepare, review, print and verify certificates in one clear flow.</p></div>
      <div className="auth-certificate-mark" aria-hidden="true"><span>PAS</span><small>CERTIFICATES</small></div>
    </section>
    <section className="auth-form-panel"><div className="auth-card">
      <p className="auth-step">{firstAccount ? "First account" : "Team access"}</p>
      <h2>{firstAccount ? "Set up administrator" : "Sign in"}</h2>
      <p className="auth-intro">{firstAccount ? "Create the first account, then add your team from User management." : "Use your assigned email and password."}</p>
      {!hasDatabase ? <div className="auth-message error-banner">Local admin access needs a PostgreSQL connection. Set <code>DATABASE_URL</code> in <code>.env.local</code>, then restart the app.</div> : null}
      {firstAccount && process.env.NODE_ENV === "production" && !process.env.ADMIN_SETUP_TOKEN ? <div className="auth-message error-banner">Set <code>ADMIN_SETUP_TOKEN</code> on the server before creating the first account.</div> : null}
      {params.error === "invalid" ? <div className="auth-message error-banner">Email or password is incorrect.</div> : null}
      {params.error === "setup" ? <div className="auth-message error-banner">The account could not be created. Check the details and try again.</div> : null}
      {params.signed_out === "1" ? <div className="auth-message success">You have been signed out.</div> : null}
      {hasDatabase ? <form action={firstAccount ? "/api/auth/setup" : "/api/auth/login"} method="post" className="grid gap-4">
        {!firstAccount ? <input type="hidden" name="return_to" value={returnTo} /> : null}
        {firstAccount ? <label className="grid gap-2"><span>Your name</span><input className="h-11 rounded-md border border-slate-300 px-3" name="name" autoComplete="name" required maxLength={120} /></label> : null}
        <label className="grid gap-2"><span>Email address</span><input className="h-11 rounded-md border border-slate-300 px-3" name="email" type="email" autoComplete="email" required maxLength={320} /></label>
        <label className="grid gap-2"><span>Password</span><input className="h-11 rounded-md border border-slate-300 px-3" name="password" type="password" autoComplete={firstAccount ? "new-password" : "current-password"} minLength={firstAccount ? 12 : undefined} required /></label>
        {firstAccount && process.env.NODE_ENV === "production" ? <label className="grid gap-2"><span>Setup token</span><input className="h-11 rounded-md border border-slate-300 px-3" name="setupToken" type="password" required /></label> : null}
        <Button className="auth-button" type="submit">{firstAccount ? "Create administrator account" : "Sign in"}</Button>
      </form> : null}
      <div className="auth-links"><Link href="/verify">Verify a certificate</Link></div>
      <p className="auth-security-note">Access is assigned to individual team members.</p>
    </div></section>
  </main>;
}
