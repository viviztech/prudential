/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "@/components/native-link";
import { Button } from "@/components/ui/button";
import { chatGPTSignInPath } from "../chatgpt-auth";

export const metadata: Metadata = { title: "Forgot password" };

type ForgotPasswordProps = { searchParams?: Promise<{ return_to?: string }> };

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordProps) {
  const params = searchParams ? await searchParams : {};
  const returnTo = params.return_to?.startsWith("/") && !params.return_to.startsWith("//")
    ? params.return_to
    : "/admin";
  const recoveryHref = process.env.NODE_ENV === "development" ? "/login" : chatGPTSignInPath(returnTo);

  return (
    <main className="auth-page">
      <section className="auth-brand-panel" aria-label="Prudential ISO account recovery">
        <Link className="brand auth-brand" href="/">
          <span className="relative size-12 overflow-hidden rounded-xl border border-white/20 bg-white"><img className="absolute left-1/2 top-0 h-[70px] w-[70px] max-w-none -translate-x-1/2 object-cover object-top" src="/ps-logo.jpg" alt="" /></span>
          <span><strong>Prudential</strong><small>Assessment Services LLP</small></span>
        </Link>
        <div className="auth-brand-copy">
          <p className="eyebrow">Account recovery</p>
          <h1>Regain access without weakening security.</h1>
          <p>Your password stays with the secure sign-in service and is never stored by Prudential ISO.</p>
        </div>
        <div className="auth-certificate-mark" aria-hidden="true"><span>PAS</span><small>SECURE</small></div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <p className="auth-step">Password assistance</p>
          <h2>Forgot password?</h2>
          <p className="auth-intro">Open the secure sign-in service, enter the approved admin email, and choose its password-recovery option.</p>
          <Button asChild className="auth-button"><a href={recoveryHref}>Continue to account recovery</a></Button>
          <div className="auth-links stacked">
            <Link href={`/login?return_to=${encodeURIComponent(returnTo)}`}>Back to admin login</Link>
            <Link href="/">Return to website</Link>
          </div>
          <p className="auth-security-note"><span aria-hidden="true">✓</span> Recovery details are handled by the secure identity provider.</p>
        </div>
      </section>
    </main>
  );
}
