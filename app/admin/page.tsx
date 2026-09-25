import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, FileCheck2, Inbox, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardCounts, listCertificates } from "../../db/runtime";

export const metadata: Metadata = { title: "Admin dashboard" };

function readableStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default async function AdminPage() {
  const [counts, certificates] = await Promise.all([getDashboardCounts(), listCertificates()]);
  const metrics = [
    ["New enquiries", counts.enquiries, Inbox],
    ["Waiting approval", counts.waiting, Clock3],
    ["Issued this month", counts.issued, FileCheck2],
    ["Printing queue", counts.printing, Printer],
  ] as const;

  return (
    <>
      <header className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div><p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.15em] text-[#0f9a8b]">Overview</p><h1 className="m-0 font-serif text-4xl font-medium text-[#0d2a3d]">Certificate desk</h1><p className="mt-2 text-[#647983]">Everything that needs your attention today.</p></div><Button asChild><Link href="/admin/enquiries">Open enquiries<ArrowRight /></Link></Button></header>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon]) => <Card className="border-t-4 border-t-[#1f6f91]" key={label}><CardContent className="flex items-start justify-between p-5"><div><span className="text-xs text-[#647983]">{label}</span><strong className="mt-2 block font-serif text-4xl font-medium text-[#0d2a3d]">{value}</strong></div><span className="grid size-10 place-items-center rounded-full bg-[#e7f2f2] text-[#1f6f91]"><Icon className="size-5" /></span></CardContent></Card>)}</div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.55fr]">
        <Card><CardHeader><CardTitle>Current workflow</CardTitle><Button asChild variant="link" size="sm"><Link href="/admin/certificates">View all<ArrowRight /></Link></Button></CardHeader><CardContent className="p-0">
          {certificates.length ? certificates.slice(0, 6).map((certificate, index) => (
            <Link className="grid grid-cols-[38px_1fr_auto] items-center gap-3 border-b border-[#e1e8e8] px-6 py-4 transition last:border-0 hover:bg-[#f7fafa]" href={`/admin/certificates/${certificate.id}`} key={certificate.id}>
              <span className="grid size-8 place-items-center rounded-full bg-[#0d2a3d] text-[10px] text-white">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><strong className="block truncate text-sm text-[#0d2a3d]">{certificate.company_name}</strong><small className="mt-1 block text-[#647983]">{certificate.certification_name}</small></div><Badge variant="pending">{readableStatus(certificate.status)}</Badge>
            </Link>
          )) : <div className="p-12 text-center text-[#647983]"><strong className="font-serif text-2xl font-medium text-[#0d2a3d]">No certificates yet</strong><p className="mt-2">Convert an enquiry to create the first certificate draft.</p></div>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Simple workflow</CardTitle></CardHeader><CardContent className="divide-y divide-[#e1e8e8] p-0">{[["1. Draft","Confirm company, address, scope, and standard."],["2. Approval","Record approval or requested changes."],["3. Issue","Generate dates and a unique certificate number."],["4. Print","Open the final print-ready certificate."]].map(([title,text]) => <div className="px-6 py-4" key={title}><strong className="text-sm text-[#0d2a3d]">{title}</strong><span className="mt-1 block text-xs leading-5 text-[#647983]">{text}</span></div>)}</CardContent></Card>
      </div>
    </>
  );
}
