/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getCertificate, getCertificateSettings } from "../../../../../db/runtime";
import PrintButton from "./print-button";
import VerificationQr from "./verification-qr";

type PrintProps = { params: Promise<{ id: string }> };

function showDate(value: string | null) {
  if (!value) return "Pending issue";
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function CertificatePrintPage({ params }: PrintProps) {
  const { id } = await params;
  const [certificate, settings] = await Promise.all([
    getCertificate(id),
    getCertificateSettings(),
  ]);
  if (!certificate) return <p>Certificate not found.</p>;
  const isDraft = !certificate.certificate_number;
  const verificationUrl = certificate.certificate_number
    ? `https://prudentialiso.com/verify?certificate=${encodeURIComponent(certificate.certificate_number)}`
    : "https://prudentialiso.com/verify";

  return (
    <main className="print-page">
      <div className="print-toolbar"><Link href={`/admin/certificates/${id}`}>Back to record</Link><PrintButton /></div>
      <article className="final-certificate">
        {isDraft ? <div className="draft-watermark">DRAFT</div> : null}
        <div className="certificate-frame" aria-hidden="true" />
        <aside className="certificate-security-rail" aria-hidden="true">
          <strong>PAS</strong><span>PAS</span><span>PAS</span><span>PAS</span><span>PAS</span><span>PAS</span><span>PAS</span><span>PAS</span><span>PAS</span><i /><i /><i />
        </aside>

        <header className="certificate-premium-header">
          <div className="certificate-standard"><small>Certified standard</small><strong>{certificate.certification_name}</strong></div>
          <div className="certificate-document-type"><span>Certificate</span><small>of registration</small></div>
          <div className="certificate-edition"><small>Document</small><strong>{certificate.certificate_number ? "ORIGINAL" : "PREVIEW"}</strong></div>
        </header>

        <div className="certificate-premium-body">
          <div className="certificate-brand-lockup">
            <div className="certificate-logo">{settings.logo_key ? <img src="/api/certificate-assets/logo" alt={`${settings.brand_name} logo`} /> : <span>P</span>}</div>
            <div><strong>{settings.brand_name}</strong><small>{settings.office_address || "Independent certification services"}</small></div>
          </div>

          <div className="certificate-recipient">
            <p>{settings.intro_wording}</p>
            <h1>{certificate.company_name}</h1>
            <address>{certificate.address}</address>
            <p>{settings.conformity_wording}</p>
            <h2>{certificate.certification_name}</h2>
          </div>

          <section className="certificate-scope">
            <span>Approved certification scope</span>
            <p>{certificate.scope}</p>
          </section>

          <div className="certificate-identity-row">
            <div className="certificate-number"><small>Certificate number</small><strong>{certificate.certificate_number ?? "Assigned after approval"}</strong></div>
            <p>This certificate is valid subject to successful completion of the required surveillance assessments.</p>
          </div>

          <section className="certificate-date-grid" aria-label="Certificate dates">
            <p><span>Initial registration</span><strong>{showDate(certificate.issue_date)}</strong></p>
            <p><span>Issue date</span><strong>{showDate(certificate.issue_date)}</strong></p>
            <p><span>Expiry date</span><strong>{showDate(certificate.expiry_date)}</strong></p>
            <p><span>1st surveillance due</span><strong>{showDate(certificate.first_surveillance_date)}</strong></p>
            <p><span>2nd surveillance due</span><strong>{showDate(certificate.second_surveillance_date)}</strong></p>
            <p><span>3rd surveillance due</span><strong>{showDate(certificate.third_surveillance_date)}</strong></p>
          </section>

          <section className="certificate-approval-row">
            <div className="certificate-seal" aria-label="PAS verified seal"><b>PAS</b><small>REGISTERED</small><span>★</span></div>
            <div className="certificate-signature">
              {settings.signature_key ? <img src="/api/certificate-assets/signature" alt="Authorized signature" /> : <span className="signature-space" />}
              <strong>{settings.signatory_name || "Authorized Signatory"}</strong>
              <small>{settings.signatory_name ? settings.signatory_title : settings.brand_name}</small>
            </div>
            <div className="certificate-verification">
              <VerificationQr url={verificationUrl} />
              <div><strong>Verify this certificate</strong><small>prudentialiso.com/verify</small></div>
            </div>
          </section>
        </div>

        <footer className="certificate-premium-footer">
          <div><strong>{settings.brand_name}</strong><span>{settings.office_address || "Prudential ISO Certification Services"}</span></div>
          <p>{settings.footer_wording}</p>
        </footer>
      </article>
    </main>
  );
}
