import Link from "next/link";
import { getCertificate, getCertificateSettings } from "../../../../../db/runtime";
import { getCertificateTemplate } from "../../../../../lib/certificate-templates";
import PrintButton from "./print-button";

type PrintProps = { params: Promise<{ id: string }> };

function showDate(value: string | null) {
  if (!value) return "Pending issue";
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
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

  const template = getCertificateTemplate(certificate.certification_code);
  if (!template) {
    return (
      <main className="print-page">
        <div className="print-toolbar"><Link href={`/admin/certificates/${id}`}>Back to record</Link></div>
        <section className="certificate-template-missing">
          <h1>Certificate background not configured</h1>
          <p>Add and map the background for {certificate.certification_name} before printing this certificate.</p>
        </section>
      </main>
    );
  }

  const isDraft = !certificate.certificate_number;

  return (
    <main className="print-page">
      <div className="print-toolbar"><Link href={`/admin/certificates/${id}`}>Back to record</Link><PrintButton /></div>
      <article
        className="final-certificate certificate-background-template"
        style={{ backgroundImage: `url(${template.backgroundUrl})` }}
      >
        {isDraft ? <div className="draft-watermark">DRAFT</div> : null}
        <div className="certificate-template-content">
          <section className="certificate-template-recipient">
            <p>This is to certify that the {template.systemName} of</p>
            <h2>{certificate.company_name}</h2>
            <address>{certificate.address}</address>
            <p>{settings.conformity_wording || "has been assessed and registered by PAS as conforming"}<br />to the requirements of :</p>
          </section>

          <section className="certificate-template-standard">
            <strong>{template.standardLabel}</strong>
            <span>For the following Scope</span>
          </section>

          <section className="certificate-template-scope">
            <p>{certificate.scope}</p>
          </section>

          <p className="certificate-template-clarification">
            Further clarifications regarding the scope of this certificate and applicability of {template.standardLabel}<br />
            requirements may be obtained by consulting the organization.
          </p>

          <div className="certificate-template-number">
            <span>Certificate Number :</span>
            <strong>{certificate.certificate_number ?? "Assigned after approval"}</strong>
          </div>

          <section className="certificate-template-dates" aria-label="Certificate dates">
            <div><span>Initial Registration Date</span><b>:</b><strong>{showDate(certificate.issue_date)}</strong></div>
            <div><span>Issue Date</span><b>:</b><strong>{showDate(certificate.issue_date)}</strong></div>
            <div><span>Certificate Expiry Date</span><b>:</b><strong>{showDate(certificate.expiry_date)}</strong></div>
            <div aria-hidden="true" />
            <div><span>1st Surveillance Due</span><b>:</b><strong>{showDate(certificate.first_surveillance_date)}</strong></div>
            <div><span>2nd Surveillance Due</span><b>:</b><strong>{showDate(certificate.second_surveillance_date)}</strong></div>
          </section>
        </div>
      </article>
    </main>
  );
}
