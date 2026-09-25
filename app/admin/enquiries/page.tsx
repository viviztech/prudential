import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listEnquiries } from "../../../db/runtime";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage() {
  const enquiries = await listEnquiries();
  return (
    <>
      <header className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div><p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.15em] text-[#0f9a8b]">Admin</p><h1 className="m-0 font-serif text-4xl font-medium text-[#0d2a3d]">Enquiries</h1><p className="mt-2 text-[#647983]">Review the details and turn an enquiry into a certificate draft.</p></div><Button asChild><Link href="/enquire"><Plus />New enquiry</Link></Button></header>
      <Card className="mt-8 overflow-x-auto"><CardContent className="min-w-[820px] p-0">
          <div className="grid grid-cols-[1.45fr_1fr_1fr_.7fr_70px] gap-5 border-b border-[#d8e2e2] px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[#647983]"><span>Company</span><span>Certification</span><span>Contact</span><span>Status</span><span /></div>
          {enquiries.length ? enquiries.map((enquiry) => (
            <div className="grid grid-cols-[1.45fr_1fr_1fr_.7fr_70px] items-center gap-5 border-b border-[#e1e8e8] px-6 py-4 text-sm last:border-0" key={enquiry.id}>
              <span className="min-w-0"><strong className="block truncate text-[#0d2a3d]">{enquiry.company_name}</strong><small className="mt-1 block text-[#647983]">{new Date(enquiry.created_at).toLocaleDateString("en-IN")}</small></span>
              <span>{enquiry.certification}</span><span>{enquiry.contact_person}<small className="mt-1 block text-[#647983]">{enquiry.mobile}</small></span><Badge variant="pending">{enquiry.status}</Badge>
              <Button asChild variant="link" size="sm"><Link href={`/admin/enquiries/detail?id=${enquiry.id}`}>Open<ArrowRight /></Link></Button>
            </div>
          )) : <div className="p-14 text-center text-[#647983]"><strong className="font-serif text-2xl font-medium text-[#0d2a3d]">No enquiries yet</strong><p className="mt-2">New website enquiries will appear here.</p></div>}
      </CardContent></Card>
    </>
  );
}
