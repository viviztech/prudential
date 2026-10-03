import type { Metadata } from "next";
import Link from "@/components/native-link";
import { ArrowLeft, ArrowRight, CalendarDays, FileCheck2, Printer, ShieldCheck } from "lucide-react";
import { AdminNotice, AdminPageHeader, DetailList, Field, StatusSteps } from "@/components/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCertificate } from "../../../../db/runtime";

export const metadata: Metadata = { title: "Manage certificate" };
type CertificateProps = { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> };
const steps = ["draft_created", "waiting_approval", "approved", "issued", "printed"] as const;

function dateLabel(value: string | null) {
  if (!value) return "Not set";
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export default async function CertificatePage({ params, searchParams }: CertificateProps) {
  const { id } = await params;
  const query: { error?: string } = searchParams ? await searchParams : {};
  const certificate = await getCertificate(id);
  if (!certificate) return <Card className="rounded-2xl"><CardContent className="p-10"><h1 className="font-serif text-4xl text-[#111a4d]">Certificate not found</h1><Button asChild className="mt-6"><Link href="/admin/certificates">Return to certificates</Link></Button></CardContent></Card>;

  const activeIndex = certificate.status === "changes_requested" ? 1 : steps.indexOf(certificate.status as (typeof steps)[number]);
  const canIssue = certificate.status === "approved" && !certificate.certificate_number;
  const canPrint = certificate.status === "issued" || certificate.status === "printed";
  const detailItems = [
    { label: "Company", value: certificate.company_name },
    { label: "Address", value: certificate.address },
    { label: "Scope", value: certificate.scope },
    { label: "Standard", value: <>{certificate.certification_name}{certificate.original_standard ? <small className="mt-1 block text-[#7c82a8]">Workbook value: {certificate.original_standard}</small> : null}</> },
    { label: "Contact", value: <>{certificate.contact_person}<br />{certificate.mobile}<br />{certificate.email}</> },
    { label: "Certificate number", value: <>{certificate.certificate_number ?? certificate.legacy_certificate_number ?? "Generated after approval"}{certificate.legacy_source_row && !certificate.certificate_number ? <small className="mt-1 block text-[#a06b22]">Needs review from Clients row {certificate.legacy_source_row}</small> : null}</> },
    ...(certificate.associate_name ? [{ label: "Associate", value: certificate.associate_name }] : []),
  ];
  const dates = [["Draft", certificate.draft_date], ["Approved", certificate.approval_date], ["Issued", certificate.issue_date], ["1st surveillance", certificate.first_surveillance_date], ["2nd surveillance", certificate.second_surveillance_date], ["3rd surveillance", certificate.third_surveillance_date], ["Expiry", certificate.expiry_date]] as const;

  return <>
    <AdminPageHeader eyebrow="Certificate record" title={certificate.company_name} description={`${certificate.certification_name} · ${certificate.certificate_number ?? "Draft certificate"}`} actions={<><Button asChild variant="outline"><Link href="/admin/certificates"><ArrowLeft />Back</Link></Button><Button asChild variant="navy"><Link href={`/admin/certificates/${id}/print`}>{canPrint ? "Open certificate" : "Preview draft"}<Printer /></Link></Button></>} />
    {query.error ? <AdminNotice tone="error">The requested action could not be completed. Check the details and try again.</AdminNotice> : null}
    <StatusSteps steps={steps} activeIndex={activeIndex} />

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <Card className="rounded-2xl border-[#dfe1f0] shadow-none"><CardHeader><div><CardTitle>Certificate details</CardTitle><CardDescription>Information that will appear on the issued record.</CardDescription></div><Badge variant={certificate.certificate_number ? "default" : "pending"}>{certificate.status.replaceAll("_", " ")}</Badge></CardHeader><CardContent><DetailList items={detailItems} /></CardContent></Card>
      <Card className="h-fit rounded-2xl border-[#dfe1f0] shadow-none"><CardHeader><div><CardTitle>Next action</CardTitle><CardDescription>Move this record through its controlled workflow.</CardDescription></div><FileCheck2 className="size-6 text-[#202eff]" /></CardHeader><CardContent>
        {certificate.status === "draft_created" || certificate.status === "changes_requested" ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="waiting_approval" /><p className="mb-5 text-sm leading-7 text-[#626992]">Open the draft preview, confirm the details, then send it to the customer for approval.</p><Button className="w-full" type="submit">Mark waiting for approval<ArrowRight /></Button></form> : null}
        {certificate.status === "waiting_approval" ? <div className="grid gap-3"><form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="approve" /><Button className="w-full" type="submit">Mark approved</Button></form><form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="changes_requested" /><Button className="w-full" variant="outline" type="submit">Changes requested</Button></form></div> : null}
        {canIssue ? <form className="grid gap-5" action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="issue" /><Field label="Issue date" help="Surveillance and expiry dates will be generated automatically."><Input type="date" name="issueDate" required defaultValue={new Date().toISOString().slice(0, 10)} /></Field><Button className="w-full" type="submit">Issue certificate<ShieldCheck /></Button></form> : null}
        {certificate.status === "issued" ? <form action={`/api/admin/certificates/${id}`} method="post"><input type="hidden" name="action" value="print" /><p className="mb-5 text-sm leading-7 text-[#626992]">The final certificate is ready. Open it, print it, then mark the record as printed.</p><Button className="w-full" type="submit">Mark as printed<Printer /></Button></form> : null}
        {certificate.status === "printed" ? <AdminNotice>Certificate printed on {certificate.printed_at ? new Date(certificate.printed_at).toLocaleDateString("en-IN") : "the recorded date"}.</AdminNotice> : null}
      </CardContent></Card>
    </div>

    <Card className="mt-6 rounded-2xl border-[#dfe1f0] shadow-none"><CardHeader><div><CardTitle>Certificate dates</CardTitle><CardDescription>Key milestones in this certification cycle.</CardDescription></div><CalendarDays className="size-6 text-[#202eff]" /></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{dates.map(([label, value]) => <div className="rounded-xl border border-[#e2e4f2] bg-[#f8faf9] p-4" key={label}><span className="text-[10px] font-bold uppercase tracking-wide text-[#7c82a8]">{label}</span><strong className="mt-2 block text-sm text-[#111a4d]">{dateLabel(value)}</strong></div>)}</CardContent></Card>
  </>;
}
