import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../chatgpt-auth";

export const metadata: Metadata = { title: "Admin login" };
export const dynamic = "force-dynamic";

type LoginProps = {
  searchParams?: Promise<{
    error?: string;
    return_to?: string;
    signed_out?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginProps) {
  const params = searchParams ? await searchParams : {};
  const returnTo = params.return_to?.startsWith("/") && !params.return_to.startsWith("//")
    ? params.return_to
    : "/admin";
  const user = await getChatGPTUser();
  const signInHref = import.meta.env.DEV ? "/admin" : chatGPTSignInPath(returnTo);
  const switchAccountHref = import.meta.env.DEV
    ? "/admin"
    : chatGPTSignOutPath(`/login?return_to=${encodeURIComponent(returnTo)}`);

  return (
    <main className="auth-page">
      <section className="auth-brand-panel" aria-label="Prudential ISO admin access">
        <Link className="brand auth-brand" href="/">
          <span className="brand-mark">P</span>
          <span><strong>Prudential</strong><small>ISO Certification</small></span>
        </Link>
        <div className="auth-brand-copy">
          <p className="eyebrow">Private administration</p>
          <h1>One secure place for every certificate.</h1>
          <p>Review enquiries, approve certificate details, issue numbers, and prepare the final print.</p>
        </div>
        <div className="auth-certificate-mark" aria-hidden="true"><span>PAS</span><small>ADMIN</small></div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <p className="auth-step">Authorized access only</p>
          <h2>Admin login</h2>
          <p className="auth-intro">Continue with the approved administrator account.</p>

          {params.error === "unauthorized" ? (
            <div className="auth-message error-banner">
              This account is not authorized. Sign out and continue with the approved admin email.
            </div>
          ) : null}
          {params.signed_out === "1" ? <div className="auth-message success">You have been logged out.</div> : null}

          {user && params.error !== "unauthorized" ? (
            <Button asChild className="auth-button"><Link href={returnTo}>Continue to admin</Link></Button>
          ) : params.error === "unauthorized" ? (
            <Button asChild className="auth-button"><a href={switchAccountHref}>Use another account</a></Button>
          ) : (
            <Button asChild className="auth-button"><a href={signInHref}>Sign in securely</a></Button>
          )}

          <div className="auth-links">
            <Link href={`/forgot-password?return_to=${encodeURIComponent(returnTo)}`}>Forgot password?</Link>
            <Link href="/">Return to website</Link>
          </div>
          <p className="auth-security-note"><span aria-hidden="true">✓</span> Access is restricted to one approved administrator.</p>
        </div>
      </section>
    </main>
  );
}
