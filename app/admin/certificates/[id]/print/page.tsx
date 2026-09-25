/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getCertificate, getCertificateSettings } from "../../../../../db/runtime";
import PrintButton from "./print-button";
import VerificationQr from "./verification-qr";

type PrintProps = { params: Promise<{ id: string }> };

function showDate(value: string | null) {
  if (!value) return "Pending issue";
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
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
        <div className="certificate-v2-frame" aria-hidden="true" />
        <aside className="certificate-v2-security-rail" aria-hidden="true">
          <strong>PAS</strong>
          <span>CONTROLLED CERTIFICATE</span>
          <b>{certificate.certificate_number ?? "DRAFT RECORD"}</b>
          <i /><i /><i />
        </aside>

        <header className="certificate-v2-masthead">
          <div className="certificate-v2-brand">
            <div className="certificate-v2-logo">
              {settings.logo_key ? <img src="/api/certificate-assets/logo" alt={`${settings.brand_name} logo`} /> : <span>P</span>}
            </div>
            <div><strong>{settings.brand_name}</strong><small>Management system certification</small></div>
          </div>
          <dl className="certificate-v2-document-meta">
            <div><dt>Document</dt><dd>{certificate.certificate_number ? "Original" : "Preview"}</dd></div>
            <div><dt>Record state</dt><dd>{certificate.certificate_number ? "Issued" : "Draft"}</dd></div>
          </dl>
        </header>

        <div className="certificate-v2-body">
          <div className="certificate-v2-title">
            <p>Certificate of registration</p>
            <h1>{certificate.certification_name}</h1>
            <span>Management system certification</span>
          </div>

          <div className="certificate-v2-recipient">
            <p>{settings.intro_wording}</p>
            <h2>{certificate.company_name}</h2>
            <address>{certificate.address}</address>
            <p>{settings.conformity_wording}</p>
          </div>

          <section className="certificate-v2-scope">
            <span>Certified scope</span>
            <p>{certificate.scope}</p>
          </section>

          <div className="certificate-v2-control-row">
            <div><small>Certificate number</small><strong>{certificate.certificate_number ?? "Assigned after approval"}</strong></div>
            <p>This certificate remains valid subject to successful completion of required surveillance assessments and confirmation through the public register.</p>
          </div>

          <section className="certificate-v2-date-ledger" aria-label="Certificate dates">
            <div><span>Initial registration</span><strong>{showDate(certificate.issue_date)}</strong></div>
            <div><span>Issue date</span><strong>{showDate(certificate.issue_date)}</strong></div>
            <div><span>Expiry date</span><strong>{showDate(certificate.expiry_date)}</strong></div>
            <div><span>1st surveillance</span><strong>{showDate(certificate.first_surveillance_date)}</strong></div>
            <div><span>2nd surveillance</span><strong>{showDate(certificate.second_surveillance_date)}</strong></div>
            <div><span>3rd surveillance</span><strong>{showDate(certificate.third_surveillance_date)}</strong></div>
          </section>

          <section className="certificate-v2-authentication">
            <div className="certificate-v2-marks" aria-label="Certificate artwork placeholders">
              <div className="certificate-v2-mark" data-artwork-slot="certification-emblem"><b>PAS</b><small>Registered</small></div>
              <div className="certificate-v2-mark secondary" data-artwork-slot="accreditation-emblem"><b>ISO</b><small>Certified</small></div>
            </div>
            <div className="certificate-v2-signature">
              {settings.signature_key ? <img src="/api/certificate-assets/signature" alt="Authorized signature" /> : <span className="signature-space" />}
              <strong>{settings.signatory_name || "Authorized Signatory"}</strong>
              <small>{settings.signatory_name ? settings.signatory_title : settings.brand_name}</small>
            </div>
            <div className="certificate-v2-verification">
              <VerificationQr url={verificationUrl} />
              <div><strong>Verify this record</strong><small>prudentialiso.com/verify</small></div>
            </div>
          </section>
        </div>

        <footer className="certificate-v2-footer">
          <div><strong>{settings.brand_name}</strong><span>{settings.office_address || "Prudential ISO Certification Services"}</span></div>
          <p>{settings.footer_wording}</p>
        </footer>
      </article>
    </main>
  );
}
