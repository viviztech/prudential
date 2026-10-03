import type { Metadata } from "next";
import Link from "@/components/native-link";
import { ArrowRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin-ui";
import { listCertificates } from "../../../db/runtime";

export const metadata: Metadata = { title: "Certificates" };

type CertificatesProps = { searchParams?: Promise<{ q?: string; filter?: string }> };

export default async function CertificatesPage({ searchParams }: CertificatesProps) {
  const params = searchParams ? await searchParams : {};
  const filter = params.filter === "review" || params.filter === "issued" ? params.filter : undefined;
  const certificates = await listCertificates({ query: params.q, filter });
  return (
    <>
      <AdminPageHeader title="Certificates" description="Manage drafts, approvals, issue details, and printing." actions={<Button asChild><Link href="/admin/enquiries">Create from enquiry<ArrowRight /></Link></Button>} />
      <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><form className="flex w-full max-w-2xl gap-2"><Input name="q" defaultValue={params.q ?? ""} placeholder="Search company or certificate number" />{filter ? <input type="hidden" name="filter" value={filter} /> : null}<Button variant="outline" type="submit"><Search />Search</Button></form><div className="flex gap-1 rounded-lg border border-[#dfe1f0] bg-white p-1">{[["All",""],["Issued","issued"],["Needs review","review"]].map(([label,value]) => <Button asChild variant={filter === (value || undefined) ? "navy" : "ghost"} size="sm" key={label}><Link href={value ? `/admin/certificates?filter=${value}` : "/admin/certificates"}>{label}</Link></Button>)}</div></div>
      <Card className="mt-5 overflow-x-auto rounded-2xl border-[#dfe1f0] shadow-none"><CardContent className="min-w-[900px] p-0"><div className="grid grid-cols-[1.45fr_1fr_1fr_.7fr_78px] gap-5 border-b border-[#dfe1f0] bg-[#f8faf9] px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[#626992]"><span>Company</span><span>Standard</span><span>Certificate no.</span><span>Status</span><span /></div>
        {certificates.length ? certificates.map((certificate) => <div className="grid grid-cols-[1.45fr_1fr_1fr_.7fr_78px] items-center gap-5 border-b border-[#e3e5f2] px-6 py-4 text-sm last:border-0" key={certificate.id}><span className="min-w-0"><strong className="block truncate text-[#111a4d]">{certificate.company_name}</strong><small className="mt-1 block max-w-xs truncate text-[#626992]">{certificate.scope}</small></span><span>{certificate.certification_name}<small className="mt-1 block text-[#626992]">{certificate.original_standard && certificate.original_standard !== certificate.certification_name ? `Original: ${certificate.original_standard}` : ""}</small></span><span>{certificate.certificate_number ?? certificate.legacy_certificate_number ?? "Not issued"}{certificate.legacy_source_row && !certificate.certificate_number ? <small className="mt-1 block text-[#a06b22]">Review source row {certificate.legacy_source_row}</small> : null}</span><Badge variant={certificate.certificate_number ? "default" : "pending"}>{certificate.certificate_number ? certificate.status.replaceAll("_", " ") : "needs review"}</Badge><Button asChild variant="link" size="sm"><Link href={`/admin/certificates/${certificate.id}`}>Manage<ArrowRight /></Link></Button></div>) : <div className="p-14 text-center text-[#626992]"><strong className="font-serif text-2xl font-medium text-[#111a4d]">No matching certificates</strong><p className="mt-2">Change the search or filter and try again.</p></div>}
      </CardContent></Card>
    </>
  );
}
