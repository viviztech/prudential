import type { Metadata } from "next";
import Link from "@/components/native-link";
import { ArrowLeft, CalendarDays, Printer } from "lucide-react";
import { AdminNotice, AdminPageHeader, DetailList, Field } from "@/components/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CertificateDetailsEditor } from "@/components/certificate-details-editor";
import { CertificateOutputControls, CertificateOutputRequestDecision } from "@/components/certificate-output-controls";
import { getCertificateOutputAccess, listCertificateOutputRequests } from "@/db/certificate-outputs";
import { getCertificate, getCertificateSettings, listCompanyCertificates } from "../../../../db/runtime";
import { getAdminUser } from "@/app/admin-user";
import { can } from "@/db/auth";

export const metadata: Metadata = { title: "Manage certificate" };
type CertificateProps = { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string; saved?: string; edit_error?: string; output_requested?: string; output_decision?: string; output_error?: string; output_complete?: string }> };

function dateLabel(value: string | null) {
  if (!value) return "Not set";
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export default async function CertificatePage({ params, searchParams }: CertificateProps) {
  const { id } = await params;
  const user = await getAdminUser(`/admin/certificates/${id}`);
  const query = searchParams ? await searchParams : {};
  const [certificate, settings] = await Promise.all([getCertificate(id), getCertificateSettings()]);
  if (!certificate) return <Card className="rounded-2xl"><CardContent className="p-10"><h1 className="font-serif text-4xl text-[#0d2a3d]">Certificate not found</h1><Button asChild className="mt-6"><Link href="/admin/certificates">Return to certificates</Link></Button></CardContent></Card>;
  const isFinal = certificate.status === "printed" && Boolean(certificate.certificate_number);
  const [related, outputAccess, pendingOutputRequests] = await Promise.all([
    listCompanyCertificates(certificate.company_id),
    isFinal && can(user, "print") ? getCertificateOutputAccess(id, user) : null,
    isFinal && user.role === "admin" ? listCertificateOutputRequests(user, { certificateId: id, pendingOnly: true }) : [],
  ]);

  const checks = [
    ["applicationChecked", "Application", certificate.application_checked],
    ["legalChecked", "Legal / documents", certificate.legal_checked],
    ["continuityChecked", "Business continuity proof", certificate.continuity_checked],
    ["documentationChecked", "Documentation", certificate.documentation_checked],
  ] as const;
  const allChecked = checks.every(([, , value]) => Boolean(value));
  const details = [
    { label: "Company name", value: certificate.company_name },
    { label: "Company address", value: certificate.address },
    { label: "Scope", value: certificate.scope },
    { label: "Company email", value: certificate.email },
    { label: "Customer phone", value: certificate.mobile },
    { label: "Contact person", value: certificate.contact_person },
    { label: "Standard", value: certificate.certification_name },
    { label: "Certificate number", value: certificate.certificate_number ?? "Assigned at final copy print" },
  ];
  const dates = [["Issue date", certificate.issue_date], ["1st surveillance", certificate.first_surveillance_date], ["2nd surveillance", certificate.second_surveillance_date], ["Expiry", certificate.expiry_date]] as const;
  const editable = !certificate.certificate_number && !["issued", "printed"].includes(certificate.status);
  const canEditDetails = can(user, "prepare") && (editable || user.role === "admin");
  const canEditChecklist = can(user, "prepare") && editable && ["draft_created", "changes_requested"].includes(certificate.status);

  return <>
    <AdminPageHeader eyebrow="Certificate record" title={certificate.company_name} description={`${certificate.certification_name} · ${certificate.certificate_number ?? "In progress"}`} actions={<><Button asChild variant="outline"><Link href="/admin/certificates"><ArrowLeft />Back</Link></Button>{!isFinal || can(user, "print") ? <Button asChild variant="navy"><Link href={`/admin/certificates/${id}/print`}>{isFinal ? "Open final copy" : "Preview draft"}<Printer /></Link></Button> : null}</>} />
    {query.error ? <AdminNotice tone="error">The action could not be completed. Complete the earlier checklist and draft steps first, or check the selected date.</AdminNotice> : null}
    {query.saved ? <AdminNotice>{editable ? "Certificate details saved. Updated drafts must be sent and confirmed again before finalization." : "Final certificate details updated. Future copies use the corrected details."}</AdminNotice> : null}
    {query.edit_error ? <AdminNotice tone="error">Details could not be saved. Check the entered values. Only admins can edit finalized certificates.</AdminNotice> : null}
    {query.output_requested ? <AdminNotice>Your request for one additional final copy has been sent to the admin.</AdminNotice> : null}
    {query.output_decision ? <AdminNotice>The download request has been reviewed.</AdminNotice> : null}
    {query.output_error ? <AdminNotice tone="error">This final copy requires admin approval. Request another download below.</AdminNotice> : null}
    {query.output_complete ? <AdminNotice>Your final copy was opened. Another operator print or download will require admin approval.</AdminNotice> : null}
    <div className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <div className="grid content-start gap-6">
        <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>1. Document checklist</CardTitle><CardDescription>Record each received item before marking the draft complete.</CardDescription></div><Badge variant={allChecked ? "default" : "pending"}>{checks.filter(([, , value]) => value).length}/4 complete</Badge></CardHeader><CardContent><form action={`/api/admin/certificates/${id}`} method="post" className="grid gap-3"><input type="hidden" name="action" value="checklist" />{checks.map(([name, label, value]) => <label className="flex items-center gap-3 rounded-xl border border-[#dce7e3] p-3 text-sm" key={name}><input type="checkbox" name={name} defaultChecked={Boolean(value)} disabled={!canEditChecklist} className="size-4" />{label}</label>)}{canEditChecklist ? <Button className="w-fit" type="submit">Save checklist</Button> : null}</form></CardContent></Card>
        <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>2. Company and standard</CardTitle><CardDescription>{canEditDetails ? editable ? "Edit application details until this certificate is finalized." : "Admins can correct the details used for this final certificate." : "Details used for this certificate."}</CardDescription></div></CardHeader><CardContent>{canEditDetails && editable ? <><p className="mb-4 text-sm font-semibold text-[#0d2a3d]">{certificate.certification_name}</p><CertificateDetailsEditor certificate={certificate} /></> : <><DetailList items={details} />{canEditDetails ? <details className="mt-5 border-t border-[#dce7e3] pt-5"><summary className="cursor-pointer text-sm font-semibold text-[#08766f]">Edit finalized certificate</summary><div className="mt-5"><CertificateDetailsEditor certificate={certificate} finalized /></div></details> : null}</>}</CardContent></Card>
        {related.length > 1 ? <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><CardTitle>Other standards for this company</CardTitle></CardHeader><CardContent className="grid gap-2">{related.filter((item) => item.id !== id).map((item) => <Button asChild variant="outline" className="justify-start" key={item.id}><Link href={`/admin/certificates/${item.id}`}>{item.certification_name}</Link></Button>)}</CardContent></Card> : null}
      </div>
      <div className="grid content-start gap-6">
        <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>3. Draft and final copy</CardTitle><CardDescription>Mark each milestone as it happens.</CardDescription></div></CardHeader><CardContent className="grid gap-3">
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(certificate.draft_date)} readOnly className="size-4" />Draft</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(certificate.draft_sent_at)} readOnly className="size-4" />Draft sent</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(certificate.approval_date)} readOnly className="size-4" />Draft confirmed</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={certificate.final_output_count > 0} readOnly className="size-4" />First final copy opened</label>
          {can(user, "prepare") && editable && !certificate.draft_date ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="draft" /><Button disabled={!allChecked} type="submit">Mark draft complete</Button></form> : null}
          {can(user, "prepare") && editable && certificate.draft_date && ["draft_created", "changes_requested"].includes(certificate.status) ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="waiting_approval" /><Button type="submit">Mark draft sent</Button></form> : null}
          {can(user, "review") && editable && certificate.status === "waiting_approval" ? <div className="flex flex-wrap gap-2"><form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="approve" /><Button type="submit">Mark draft confirmed</Button></form><form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="changes_requested" /><Button variant="outline" type="submit">Changes requested</Button></form></div> : null}
          {can(user, "print") && certificate.status === "approved" ? <form className="grid gap-4 border-t border-[#dce7e3] pt-4" action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="print" /><Field label="Final copy print date" help="This sets the issue date and locks operator editing. Open the final copy after finalization."><Input type="date" name="issueDate" required /></Field>{!settings.signature_key ? <p className="text-sm text-[#9b3e32]">Upload the authorized signature in <Link className="underline" href="/admin/settings">certificate settings</Link> before final printing.</p> : null}<Button disabled={!settings.signature_key} type="submit">Finalize certificate<Printer /></Button></form> : null}
          {can(user, "print") && certificate.status === "issued" ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="print" />{!settings.signature_key ? <p className="text-sm text-[#9b3e32]">Upload the authorized signature in <Link className="underline" href="/admin/settings">certificate settings</Link> before final printing.</p> : null}<Button disabled={!settings.signature_key} type="submit">Mark final copy printed<Printer /></Button></form> : null}
          {certificate.status === "printed" ? <AdminNotice>Certificate finalized. Only admins can correct its details. The final copy includes the signature and verification QR code.</AdminNotice> : null}
        </CardContent></Card>
        {outputAccess ? <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><CardTitle>Final print and download</CardTitle><CardDescription>Open a final copy or request approval for another copy.</CardDescription></CardHeader><CardContent className="grid gap-5"><CertificateOutputControls certificateId={id} access={outputAccess} />{pendingOutputRequests.map((request) => <div key={request.id} className="grid gap-3 border-t border-[#dce7e3] pt-4"><p className="m-0 text-sm"><strong>{request.requester_name ?? "Operator"}</strong> requested another final copy.</p><CertificateOutputRequestDecision request={request} /></div>)}</CardContent></Card> : null}
        <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>4. Certificate dates</CardTitle><CardDescription>Calculated from the final copy print date.</CardDescription></div><CalendarDays className="size-6 text-[#08766f]" /></CardHeader><CardContent className="grid grid-cols-2 gap-3">{dates.map(([label, value]) => <div className="rounded-xl border border-[#dce7e3] bg-[#f8faf9] p-4" key={label}><span className="text-[10px] font-bold uppercase tracking-wide text-[#607880]">{label}</span><strong className="mt-2 block text-sm text-[#0d2a3d]">{dateLabel(value)}</strong></div>)}</CardContent></Card>
      </div>
    </div>
  </>;
}
