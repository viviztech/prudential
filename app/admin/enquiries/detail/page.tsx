import type { Metadata } from "next";
import Link from "next/link";
import { getEnquiry, listCertifications } from "../../../../db/runtime";

export const metadata: Metadata = { title: "Enquiry details" };

type DetailProps = { searchParams?: Promise<{ id?: string; error?: string }> };

export default async function EnquiryDetailPage({ searchParams }: DetailProps) {
  const params = searchParams ? await searchParams : {};
  const [enquiry, certifications] = await Promise.all([
    params.id ? getEnquiry(params.id) : Promise.resolve(null),
    listCertifications(),
  ]);

  if (!enquiry) {
    return <section className="panel"><h1>Enquiry not found</h1><Link href="/admin/enquiries">Return to enquiries</Link></section>;
  }

  return (
    <>
      <header className="admin-top"><div><p className="admin-kicker">Enquiry details</p><h1>{enquiry.company_name}</h1><p>{enquiry.certification} requested by {enquiry.contact_person}</p></div><Link className="button secondary" href="/admin/enquiries">Back to enquiries</Link></header>
      {params.error ? <p className="error-banner">The certificate draft could not be created. Check the selected certification and try again.</p> : null}
      <div className="record-grid">
        <section className="panel record-panel"><h2>Company information</h2><dl><div><dt>Company name</dt><dd>{enquiry.company_name}</dd></div><div><dt>Address</dt><dd>{enquiry.address}</dd></div><div><dt>Scope</dt><dd>{enquiry.scope}</dd></div><div><dt>Contact</dt><dd>{enquiry.contact_person}<br />{enquiry.mobile}<br />{enquiry.email}</dd></div>{enquiry.notes ? <div><dt>Notes</dt><dd>{enquiry.notes}</dd></div> : null}</dl></section>
        <aside className="panel action-panel"><h2>Create certificate draft</h2><p>Select the final certification standard. The company and scope details will be copied into a new draft.</p>
          {enquiry.status === "converted" ? <div className="success">This enquiry has already been converted.</div> : (
            <form action="/api/admin/certificates" method="post">
              <input type="hidden" name="enquiryId" value={enquiry.id} />
              <label className="field"><span>Certification</span><select name="certificationId" required defaultValue=""><option value="" disabled>Select certification</option>{certifications.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
              <button className="button primary" type="submit">Create draft</button>
            </form>
          )}
        </aside>
      </div>
    </>
  );
}
