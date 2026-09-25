import type { Metadata } from "next";
import Link from "next/link";
import { getCertificate } from "../../../../db/runtime";

export const metadata: Metadata = { title: "Manage certificate" };

type CertificateProps = { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> };

const steps = ["draft_created", "waiting_approval", "approved", "issued", "printed"];

function dateLabel(value: string | null) {
  if (!value) return "Not set";
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export default async function CertificatePage({ params, searchParams }: CertificateProps) {
  const [{ id }, query] = await Promise.all([params, searchParams ?? Promise.resolve({})]);
  const certificate = await getCertificate(id);
  if (!certificate) return <section className="panel"><h1>Certificate not found</h1><Link href="/admin/certificates">Return to certificates</Link></section>;

  const activeIndex = certificate.status === "changes_requested" ? 1 : steps.indexOf(certificate.status);
  const canIssue = certificate.status === "approved" && !certificate.certificate_number;
  const canPrint = certificate.status === "issued" || certificate.status === "printed";

  return (
    <>
      <header className="admin-top"><div><p className="admin-kicker">Certificate record</p><h1>{certificate.company_name}</h1><p>{certificate.certification_name} · {certificate.certificate_number ?? "Draft certificate"}</p></div><div className="header-actions"><Link className="button secondary" href={`/admin/certificates/${id}/print`}>{canPrint ? "Open certificate" : "Preview draft"}</Link><Link className="button secondary" href="/admin/certificates">Back</Link></div></header>
      {query.error ? <p className="error-banner">The requested action could not be completed. Check the details and try again.</p> : null}
      <ol className="status-track">{steps.map((step, index) => <li className={index <= activeIndex ? "complete" : ""} key={step}><span>{index + 1}</span><small>{step.replaceAll("_", " ")}</small></li>)}</ol>
      <div className="record-grid wide">
        <section className="panel record-panel"><div className="panel-head"><h2>Certificate details</h2><span className="pill">{certificate.status.replaceAll("_", " ")}</span></div><dl><div><dt>Company</dt><dd>{certificate.company_name}</dd></div><div><dt>Address</dt><dd>{certificate.address}</dd></div><div><dt>Scope</dt><dd>{certificate.scope}</dd></div><div><dt>Standard</dt><dd>{certificate.certification_name}{certificate.original_standard ? <><br /><small>Workbook value: {certificate.original_standard}</small></> : null}</dd></div><div><dt>Contact</dt><dd>{certificate.contact_person}<br />{certificate.mobile}<br />{certificate.email}</dd></div><div><dt>Certificate number</dt><dd>{certificate.certificate_number ?? certificate.legacy_certificate_number ?? "Generated after approval"}{certificate.legacy_source_row && !certificate.certificate_number ? <><br /><small>Needs review from Clients row {certificate.legacy_source_row}</small></> : null}</dd></div>{certificate.associate_name ? <div><dt>Associate</dt><dd>{certificate.associate_name}</dd></div> : null}</dl></section>
        <aside className="panel action-panel"><h2>Next action</h2>
          {certificate.status === "draft_created" || certificate.status === "changes_requested" ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="waiting_approval" /><p>Open the draft preview, confirm the details, then send it to the customer for approval.</p><button className="button primary" type="submit">Mark waiting for approval</button></form> : null}
          {certificate.status === "waiting_approval" ? <div className="action-stack"><form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="approve" /><button className="button primary" type="submit">Mark approved</button></form><form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="changes_requested" /><button className="button secondary" type="submit">Changes requested</button></form></div> : null}
          {canIssue ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="issue" /><label className="field"><span>Issue date</span><input type="date" name="issueDate" required defaultValue={new Date().toISOString().slice(0, 10)} /></label><p className="form-help">The system will generate all three surveillance dates, the expiry date, and a unique certificate number.</p><button className="button primary" type="submit">Issue certificate</button></form> : null}
          {certificate.status === "issued" ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="print" /><p>The final certificate is ready. Open it, print it, then mark the record as printed.</p><button className="button primary" type="submit">Mark as printed</button></form> : null}
          {certificate.status === "printed" ? <div className="success">Certificate printed on {certificate.printed_at ? new Date(certificate.printed_at).toLocaleDateString("en-IN") : "the recorded date"}.</div> : null}
        </aside>
      </div>
      <section className="panel date-panel"><div className="panel-head"><h2>Certificate dates</h2></div><div className="certificate-dates"><p><span>Draft</span><strong>{dateLabel(certificate.draft_date)}</strong></p><p><span>Approved</span><strong>{dateLabel(certificate.approval_date)}</strong></p><p><span>Issued</span><strong>{dateLabel(certificate.issue_date)}</strong></p><p><span>1st surveillance</span><strong>{dateLabel(certificate.first_surveillance_date)}</strong></p><p><span>2nd surveillance</span><strong>{dateLabel(certificate.second_surveillance_date)}</strong></p><p><span>3rd surveillance</span><strong>{dateLabel(certificate.third_surveillance_date)}</strong></p><p><span>Expiry</span><strong>{dateLabel(certificate.expiry_date)}</strong></p></div></section>
    </>
  );
}
