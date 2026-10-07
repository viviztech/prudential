/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { CertificateDesignTemplate, CertificateSettings } from "@/db/runtime";

export type CertificateDocumentData = {
  company_name: string;
  address: string;
  scope: string;
  certificate_number: string | null;
  issue_date: string | null;
  first_surveillance_date: string | null;
  second_surveillance_date: string | null;
  expiry_date: string | null;
};

function showDate(value: string | null) {
  if (!value) return "Pending issue";
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
  });
}

function CertificateCornerArt({ primary, accent }: { primary: string; accent: string }) {
  return <svg className="certificate-designed-art" viewBox="0 0 210 297" preserveAspectRatio="none" aria-hidden="true">
    <path fill={primary} d="M180 0H210V35L186 11Q180 5 180 0Z" />
    <path fill={accent} d="M202 27L210 35V48Z" />
    <path fill={primary} d="M30 297H0V262L24 286Q30 292 30 297Z" />
    <path fill={accent} d="M8 270L0 262V249Z" />
    {Array.from({ length: 6 }, (_, row) => Array.from({ length: 7 }, (_, column) =>
      <circle fill={primary} opacity="0.42" key={`top-${row}-${column}`} cx={10 + column * 3.4} cy={13 + row * 3.4} r="0.31" />))}
    {Array.from({ length: 6 }, (_, row) => Array.from({ length: 7 }, (_, column) =>
      <circle fill={primary} opacity="0.42" key={`bottom-${row}-${column}`} cx={178 + column * 3.4} cy={265 + row * 3.4} r="0.31" />))}
  </svg>;
}

export function CertificateDocument({ data, template, settings, isFinal, qrCode, preview = false }: {
  data: CertificateDocumentData;
  template: CertificateDesignTemplate;
  settings: CertificateSettings;
  isFinal: boolean;
  qrCode?: string | null;
  preview?: boolean;
}) {
  const style = {
    "--template-primary": template.primary_color,
    "--template-accent": template.accent_color,
  } as CSSProperties;
  const assetVersion = encodeURIComponent(template.updated_at);
  return <article className="final-certificate certificate-designed" style={style} aria-label={`${template.standard_label} certificate`}>
    <CertificateCornerArt primary={template.primary_color} accent={template.accent_color} />
    {!isFinal ? <div className="draft-watermark">{preview ? "PREVIEW" : "DRAFT"}</div> : null}
    <header className="certificate-designed-header">
      <p className="certificate-designed-kicker">{template.standard_label}</p>
      <h1>{template.heading}</h1>
    </header>

    <div className="certificate-designed-main">
      <p className="certificate-designed-opening">{template.opening_text}</p>
      <h2>{data.company_name}</h2>
      <address>{data.address}</address>
      <p className="certificate-designed-conformity">{template.conformity_text}</p>
      <h3>{template.standard_label}</h3>
      <div className="certificate-designed-scope"><span>{template.scope_heading}</span><p>{data.scope}</p></div>
      <p className="certificate-designed-clarification">{template.clarification_text}</p>
      <div className="certificate-designed-number"><span>Certificate number</span><strong>{data.certificate_number ?? "Assigned after final copy print"}</strong></div>
      <dl className="certificate-designed-dates">
        <div><dt>Issue date</dt><dd>{showDate(data.issue_date)}</dd></div>
        <div><dt>1st surveillance</dt><dd>{showDate(data.first_surveillance_date)}</dd></div>
        <div><dt>2nd surveillance</dt><dd>{showDate(data.second_surveillance_date)}</dd></div>
        <div><dt>Expiry date</dt><dd>{showDate(data.expiry_date)}</dd></div>
      </dl>
    </div>

    <footer className="certificate-designed-footer">
      <div className="certificate-designed-brand">
        {settings.logo_key
          ? <img src="/api/certificate-assets/logo" alt={`${settings.brand_name} logo`} />
          : <strong>{settings.brand_name}</strong>}
      </div>
      <div className="certificate-designed-signatory">
        {isFinal && settings.signature_key ? <img src="/api/certificate-assets/signature" alt="Authorized signature" /> : <span className="certificate-designed-signature-space" />}
        <strong>{settings.signatory_name || settings.signatory_title}</strong>
        {settings.signatory_name ? <small>{settings.signatory_title}</small> : null}
      </div>
      <div className="certificate-designed-standard-mark">
        {template.standard_logo_key ? <img src={`/api/certificate-templates/${encodeURIComponent(template.standard_code)}/assets/standard?v=${assetVersion}`} alt={`${template.standard_label} logo`} /> : <strong>{template.standard_label}</strong>}
      </div>
      <div className="certificate-designed-accreditation-mark">
        {template.accreditation_logo_key ? <img src={`/api/certificate-templates/${encodeURIComponent(template.standard_code)}/assets/accreditation?v=${assetVersion}`} alt="ANSSIA accreditation logo" /> : null}
      </div>
    </footer>
    {isFinal && qrCode ? <div className="certificate-designed-verification">
      <img src={qrCode} alt="QR code to verify this certificate" />
      <small>Scan to verify</small>
    </div> : null}
    <div className="certificate-designed-bottom"><span>{settings.office_address}</span><p>{template.footer_text}</p></div>
  </article>;
}
