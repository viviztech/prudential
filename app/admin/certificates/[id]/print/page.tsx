import Link from "@/components/native-link";
import QRCode from "qrcode";
import { getCertificate, getCertificateSettings } from "../../../../../db/runtime";
import { getCertificateTemplate } from "../../../../../lib/certificate-templates";
import PrintButton from "./print-button";
import { getAdminUser } from "@/app/admin-user";

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
  await getAdminUser(`/admin/certificates/${id}/print`);
  const [certificate, settings] = await Promise.all([
    getCertificate(id),
    getCertificateSettings(),
  ]);
  if (!certificate) return <p>Certificate not found.</p>;

  const template = getCertificateTemplate(certificate.certification_code);
  const isFinal = certificate.status === "printed" && Boolean(certificate.certificate_number);
  const isDraft = !isFinal;
  const qrCode = isFinal
    ? await QRCode.toDataURL(`https://prudentialiso.com/verify?certificate=${encodeURIComponent(certificate.certificate_number!)}`, { margin: 1, width: 240 })
    : null;

  if (!template) return <main className="print-page">
    <div className="print-toolbar"><Link href={`/admin/certificates/${id}`}>Back to record</Link><PrintButton /></div>
    <article className="final-certificate certificate-generic">
      {isDraft ? <div className="draft-watermark">DRAFT</div> : null}
      <div className="certificate-generic-header"><span>{settings.brand_name}</span><h1>{settings.registration_heading}</h1></div>
      <div className="certificate-generic-body"><p>{settings.intro_wording}</p><h2>{certificate.company_name}</h2><address>{certificate.address}</address><p>{settings.conformity_wording}</p><h3>{certificate.certification_name}</h3><p className="certificate-generic-scope">Scope: {certificate.scope}</p><p>Certificate number: <strong>{certificate.certificate_number ?? "Assigned after final copy print"}</strong></p>
        <dl><div><dt>Issue date</dt><dd>{showDate(certificate.issue_date)}</dd></div><div><dt>1st surveillance</dt><dd>{showDate(certificate.first_surveillance_date)}</dd></div><div><dt>2nd surveillance</dt><dd>{showDate(certificate.second_surveillance_date)}</dd></div><div><dt>Expiry date</dt><dd>{showDate(certificate.expiry_date)}</dd></div></dl>
      </div>
      {isFinal ? <div className="certificate-generic-footer"><div><img src="/api/certificate-assets/signature" alt="Authorized signature" /><span>{settings.signatory_name || settings.signatory_title}</span></div><div><img src={qrCode!} alt="QR code to verify this certificate" /><span>Scan to verify</span></div></div> : null}
      <p className="certificate-generic-note">{settings.footer_wording}</p>
    </article>
  </main>;

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
        {isFinal ? <div className="certificate-final-authentication">
          <div className="certificate-final-signature"><img src="/api/certificate-assets/signature" alt="Authorized signature" /><span>{settings.signatory_name || settings.signatory_title}</span></div>
          <div className="certificate-final-qr"><img src={qrCode!} alt="QR code to verify this certificate" /><span>Scan to verify</span></div>
        </div> : null}
      </article>
    </main>
  );
}
