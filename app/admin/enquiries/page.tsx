import type { Metadata } from "next";
import Link from "@/components/native-link";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin-ui";
import { listEnquiries } from "../../../db/runtime";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage() {
  const enquiries = await listEnquiries();
  return (
    <>
      <AdminPageHeader title="Enquiries" description="Review the details and turn an enquiry into a certificate draft." actions={<Button asChild><Link href="/enquire"><Plus />New enquiry</Link></Button>} />
      <Card className="mt-8 overflow-x-auto rounded-2xl border-[#dfe1f0] shadow-none"><CardContent className="min-w-[820px] p-0">
          <div className="grid grid-cols-[1.45fr_1fr_1fr_.7fr_70px] gap-5 border-b border-[#dfe1f0] bg-[#f8faf9] px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[#626992]"><span>Company</span><span>Certification</span><span>Contact</span><span>Status</span><span /></div>
          {enquiries.length ? enquiries.map((enquiry) => (
            <div className="grid grid-cols-[1.45fr_1fr_1fr_.7fr_70px] items-center gap-5 border-b border-[#e3e5f2] px-6 py-4 text-sm last:border-0" key={enquiry.id}>
              <span className="min-w-0"><strong className="block truncate text-[#111a4d]">{enquiry.company_name}</strong><small className="mt-1 block text-[#626992]">{new Date(enquiry.created_at).toLocaleDateString("en-IN")}</small></span>
              <span>{enquiry.certification}</span><span>{enquiry.contact_person}<small className="mt-1 block text-[#626992]">{enquiry.mobile}</small></span><Badge variant="pending">{enquiry.status}</Badge>
              <Button asChild variant="link" size="sm"><Link href={`/admin/enquiries/detail?id=${enquiry.id}`}>Open<ArrowRight /></Link></Button>
            </div>
          )) : <div className="p-14 text-center text-[#626992]"><strong className="font-serif text-2xl font-medium text-[#111a4d]">No enquiries yet</strong><p className="mt-2">New website enquiries will appear here.</p></div>}
      </CardContent></Card>
    </>
  );
}
