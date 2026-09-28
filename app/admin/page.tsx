import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, FileCheck2, Inbox, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin-ui";
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
      <AdminPageHeader eyebrow="Overview" title="Certificate desk" description="Everything that needs your attention today." actions={<Button asChild><Link href="/admin/enquiries">Open enquiries<ArrowRight /></Link></Button>} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon]) => <Card className="rounded-2xl border-[#dfe1f0] shadow-none" key={label}><CardContent className="flex items-start justify-between p-6"><div><span className="text-xs font-semibold text-[#626992]">{label}</span><strong className="mt-3 block font-serif text-4xl font-medium text-[#111a4d]">{value}</strong></div><span className="grid size-11 place-items-center rounded-xl bg-[#eef0ff] text-[#202eff]"><Icon className="size-5" /></span></CardContent></Card>)}</div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.55fr]">
        <Card className="rounded-2xl border-[#dfe1f0] shadow-none"><CardHeader><CardTitle>Current workflow</CardTitle><Button asChild variant="link" size="sm"><Link href="/admin/certificates">View all<ArrowRight /></Link></Button></CardHeader><CardContent className="p-0">
          {certificates.length ? certificates.slice(0, 6).map((certificate, index) => (
            <Link className="grid grid-cols-[38px_1fr_auto] items-center gap-3 border-b border-[#e3e5f2] px-6 py-4 transition last:border-0 hover:bg-[#f7fafa]" href={`/admin/certificates/${certificate.id}`} key={certificate.id}>
              <span className="grid size-8 place-items-center rounded-full bg-[#111a4d] text-[10px] text-white">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><strong className="block truncate text-sm text-[#111a4d]">{certificate.company_name}</strong><small className="mt-1 block text-[#626992]">{certificate.certification_name}</small></div><Badge variant="pending">{readableStatus(certificate.status)}</Badge>
            </Link>
          )) : <div className="p-12 text-center text-[#626992]"><strong className="font-serif text-2xl font-medium text-[#111a4d]">No certificates yet</strong><p className="mt-2">Convert an enquiry to create the first certificate draft.</p></div>}
        </CardContent></Card>
        <Card className="rounded-2xl border-[#dfe1f0] shadow-none"><CardHeader><CardTitle>Simple workflow</CardTitle></CardHeader><CardContent className="divide-y divide-[#e3e5f2] p-0">{[["1. Draft","Confirm company, address, scope, and standard."],["2. Approval","Record approval or requested changes."],["3. Issue","Generate dates and a unique certificate number."],["4. Print","Open the final print-ready certificate."]].map(([title,text]) => <div className="px-6 py-4" key={title}><strong className="text-sm text-[#111a4d]">{title}</strong><span className="mt-1 block text-xs leading-5 text-[#626992]">{text}</span></div>)}</CardContent></Card>
      </div>
    </>
  );
}
