import type { Metadata } from "next";
import Link from "@/components/native-link";
import { ArrowLeft, CalendarDays, Printer } from "lucide-react";
import { AdminNotice, AdminPageHeader, DetailList, Field } from "@/components/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCertificate, getCertificateSettings, listCompanyCertificates } from "../../../../db/runtime";
import { getAdminUser } from "@/app/admin-user";
import { can } from "@/db/auth";

export const metadata: Metadata = { title: "Manage certificate" };
type CertificateProps = { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> };

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
  const related = await listCompanyCertificates(certificate.company_id);

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
  const editable = !certificate.certificate_number;
  const canEditChecklist = can(user, "prepare") && editable && ["draft_created", "changes_requested"].includes(certificate.status);

  return <>
    <AdminPageHeader eyebrow="Certificate record" title={certificate.company_name} description={`${certificate.certification_name} · ${certificate.certificate_number ?? "In progress"}`} actions={<><Button asChild variant="outline"><Link href="/admin/certificates"><ArrowLeft />Back</Link></Button><Button asChild variant="navy"><Link href={`/admin/certificates/${id}/print`}>{certificate.status === "printed" ? "Open final copy" : "Preview draft"}<Printer /></Link></Button></>} />
    {query.error ? <AdminNotice tone="error">The action could not be completed. Complete the earlier checklist and draft steps first, or check the selected date.</AdminNotice> : null}
    <div className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <div className="grid content-start gap-6">
        <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>1. Document checklist</CardTitle><CardDescription>Record each received item before marking the draft complete.</CardDescription></div><Badge variant={allChecked ? "default" : "pending"}>{checks.filter(([, , value]) => value).length}/4 complete</Badge></CardHeader><CardContent><form action={`/api/admin/certificates/${id}`} method="post" className="grid gap-3"><input type="hidden" name="action" value="checklist" />{checks.map(([name, label, value]) => <label className="flex items-center gap-3 rounded-xl border border-[#dce7e3] p-3 text-sm" key={name}><input type="checkbox" name={name} defaultChecked={Boolean(value)} disabled={!canEditChecklist} className="size-4" />{label}</label>)}{canEditChecklist ? <Button className="w-fit" type="submit">Save checklist</Button> : null}</form></CardContent></Card>
        <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>2. Company and standard</CardTitle><CardDescription>Details used in the certificate preview.</CardDescription></div></CardHeader><CardContent><DetailList items={details} /></CardContent></Card>
        {related.length > 1 ? <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><CardTitle>Other standards for this company</CardTitle></CardHeader><CardContent className="grid gap-2">{related.filter((item) => item.id !== id).map((item) => <Button asChild variant="outline" className="justify-start" key={item.id}><Link href={`/admin/certificates/${item.id}`}>{item.certification_name}</Link></Button>)}</CardContent></Card> : null}
      </div>
      <div className="grid content-start gap-6">
        <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>3. Draft and final copy</CardTitle><CardDescription>Mark each milestone as it happens.</CardDescription></div></CardHeader><CardContent className="grid gap-3">
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(certificate.draft_date)} readOnly className="size-4" />Draft</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(certificate.draft_sent_at)} readOnly className="size-4" />Draft sent</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(certificate.approval_date)} readOnly className="size-4" />Draft confirmed</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={certificate.status === "printed"} readOnly className="size-4" />Final copy print</label>
          {can(user, "prepare") && editable && !certificate.draft_date ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="draft" /><Button disabled={!allChecked} type="submit">Mark draft complete</Button></form> : null}
          {can(user, "prepare") && editable && certificate.draft_date && ["draft_created", "changes_requested"].includes(certificate.status) ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="waiting_approval" /><Button type="submit">Mark draft sent</Button></form> : null}
          {can(user, "review") && certificate.status === "waiting_approval" ? <div className="flex flex-wrap gap-2"><form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="approve" /><Button type="submit">Mark draft confirmed</Button></form><form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="changes_requested" /><Button variant="outline" type="submit">Changes requested</Button></form></div> : null}
          {can(user, "print") && certificate.status === "approved" ? <form className="grid gap-4 border-t border-[#dce7e3] pt-4" action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="print" /><Field label="Final copy print date" help="This becomes the issue date. Surveillance and expiry dates are calculated automatically."><Input type="date" name="issueDate" required /></Field>{!settings.signature_key ? <p className="text-sm text-[#9b3e32]">Upload the authorized signature in <Link className="underline" href="/admin/settings">certificate settings</Link> before final printing.</p> : null}<Button disabled={!settings.signature_key} type="submit">Mark final copy printed<Printer /></Button></form> : null}
          {can(user, "print") && certificate.status === "issued" ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="print" />{!settings.signature_key ? <p className="text-sm text-[#9b3e32]">Upload the authorized signature in <Link className="underline" href="/admin/settings">certificate settings</Link> before final printing.</p> : null}<Button disabled={!settings.signature_key} type="submit">Mark final copy printed<Printer /></Button></form> : null}
          {certificate.status === "printed" ? <AdminNotice>Final copy printed. The signature and verification QR code appear on the certificate.</AdminNotice> : null}
        </CardContent></Card>
        <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>4. Certificate dates</CardTitle><CardDescription>Calculated from the final copy print date.</CardDescription></div><CalendarDays className="size-6 text-[#08766f]" /></CardHeader><CardContent className="grid grid-cols-2 gap-3">{dates.map(([label, value]) => <div className="rounded-xl border border-[#dce7e3] bg-[#f8faf9] p-4" key={label}><span className="text-[10px] font-bold uppercase tracking-wide text-[#607880]">{label}</span><strong className="mt-2 block text-sm text-[#0d2a3d]">{dateLabel(value)}</strong></div>)}</CardContent></Card>
      </div>
    </div>
  </>;
}
