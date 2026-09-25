/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import report from "../../../data/legacy-import-report.json";
import { getCertificateSettings, getLegacyImportStats } from "../../../db/runtime";

export const metadata: Metadata = { title: "Certificate settings" };

type SettingsProps = { searchParams?: Promise<{ saved?: string; uploaded?: string; imported?: string; error?: string }> };

export default async function SettingsPage({ searchParams }: SettingsProps) {
  const [params, settings, importStats] = await Promise.all([
    searchParams ?? Promise.resolve({}),
    getCertificateSettings(),
    getLegacyImportStats(),
  ]);

  return (
    <>
      <header className="admin-top"><div><p className="admin-kicker">Configuration</p><h1>Certificate settings</h1><p>Control the wording and branding used on every new certificate.</p></div></header>
      {params.saved ? <p className="success settings-message">Certificate wording saved.</p> : null}
      {params.uploaded ? <p className="success settings-message">Certificate artwork uploaded.</p> : null}
      {params.imported ? <p className="success settings-message">Historical records imported successfully.</p> : null}
      {params.error ? <p className="error-banner settings-message">The requested update could not be completed.</p> : null}

      <div className="settings-grid">
        <section className="panel settings-panel"><h2>Certificate wording</h2><form action="/api/admin/settings" method="post" className="settings-form">
          <label className="field"><span>Brand name</span><input name="brandName" defaultValue={settings.brand_name} required /></label>
          <label className="field"><span>Office address</span><textarea name="officeAddress" defaultValue={settings.office_address} placeholder="Enter the address to print on the certificate" /></label>
          <label className="field"><span>Certificate heading</span><input name="registrationHeading" defaultValue={settings.registration_heading} required /></label>
          <label className="field"><span>Opening wording</span><textarea name="introWording" defaultValue={settings.intro_wording} required /></label>
          <label className="field"><span>Conformity wording</span><textarea name="conformityWording" defaultValue={settings.conformity_wording} required /></label>
          <label className="field"><span>Footer wording</span><textarea name="footerWording" defaultValue={settings.footer_wording} required /></label>
          <div className="field-grid"><label className="field"><span>Signatory name</span><input name="signatoryName" defaultValue={settings.signatory_name ?? ""} /></label><label className="field"><span>Signatory title</span><input name="signatoryTitle" defaultValue={settings.signatory_title} required /></label></div>
          <button className="button primary" type="submit">Save certificate wording</button>
        </form></section>

        <div className="settings-side">
          <section className="panel settings-panel"><h2>Logo and signature</h2><p>Upload PNG, JPG, or WebP files up to 2 MB. Transparent PNG files work best for printing.</p>
            <div className="asset-preview-grid"><div><span>Logo</span>{settings.logo_key ? <img src="/api/certificate-assets/logo" alt="Current certificate logo" /> : <div className="asset-placeholder">Current P mark</div>}</div><div><span>Signature</span>{settings.signature_key ? <img src="/api/certificate-assets/signature" alt="Current certificate signature" /> : <div className="asset-placeholder">Not uploaded</div>}</div></div>
            <form action="/api/admin/settings/assets" method="post" encType="multipart/form-data" className="asset-form"><label className="field"><span>Asset type</span><select name="kind"><option value="logo">Logo</option><option value="signature">Signature</option></select></label><label className="field"><span>Image file</span><input type="file" name="asset" accept="image/png,image/jpeg,image/webp" required /></label><button className="button secondary" type="submit">Upload artwork</button></form>
          </section>

          <section className="panel settings-panel"><div className="panel-head"><h2>Historical workbook</h2><span className="pill">{report.records} rows ready</span></div><p>The source workbook remains unchanged. Duplicate and missing certificate numbers are held for review.</p>
            <div className="import-stats"><p><span>Ready records</span><strong>{report.records}</strong></p><p><span>Companies</span><strong>{report.unique_companies}</strong></p><p><span>Public numbers</span><strong>{report.public_certificate_numbers}</strong></p><p><span>Needs review</span><strong>{report.records_with_duplicate_numbers + report.records_missing_certificate_number}</strong></p></div>
            <p className="import-current">Currently imported: <strong>{importStats.records}</strong> records across <strong>{importStats.companies}</strong> companies; <strong>{importStats.review}</strong> require number review.</p>
            <form action="/api/admin/import-legacy" method="post" encType="multipart/form-data" className="asset-form"><label className="field"><span>Prepared import file</span><input type="file" name="legacyFile" accept="application/json,.json" required /></label><button className="button primary" type="submit">Import historical records</button></form>
          </section>
        </div>
      </div>
    </>
  );
}
