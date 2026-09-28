import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FilePlus2, Inbox } from "lucide-react";
import { AdminNotice, AdminPageHeader, DetailList, Field } from "@/components/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { getEnquiry, listCertifications } from "../../../../db/runtime";

export const metadata: Metadata = { title: "Enquiry details" };
type DetailProps = { searchParams?: Promise<{ id?: string; error?: string }> };

export default async function EnquiryDetailPage({ searchParams }: DetailProps) {
  const params = searchParams ? await searchParams : {};
  const [enquiry, certifications] = await Promise.all([params.id ? getEnquiry(params.id) : Promise.resolve(null), listCertifications()]);
  if (!enquiry) return <Card className="rounded-2xl"><CardContent className="p-10"><h1 className="font-serif text-4xl text-[#0d2a3d]">Enquiry not found</h1><Button asChild className="mt-6"><Link href="/admin/enquiries">Return to enquiries</Link></Button></CardContent></Card>;

  const details = [
    { label: "Company name", value: enquiry.company_name },
    { label: "Address", value: enquiry.address },
    { label: "Requested certification", value: enquiry.certification },
    { label: "Scope", value: enquiry.scope },
    { label: "Contact", value: <>{enquiry.contact_person}<br />{enquiry.mobile}<br />{enquiry.email}</> },
    ...(enquiry.notes ? [{ label: "Notes", value: enquiry.notes }] : []),
  ];

  return <>
    <AdminPageHeader eyebrow="Enquiry details" title={enquiry.company_name} description={`${enquiry.certification} requested by ${enquiry.contact_person}`} actions={<Button asChild variant="outline"><Link href="/admin/enquiries"><ArrowLeft />Back to enquiries</Link></Button>} />
    {params.error ? <AdminNotice tone="error">The certificate draft could not be created. Check the selected certification and try again.</AdminNotice> : null}
    <div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <Card className="rounded-2xl border-[#d8e3e1] shadow-none"><CardHeader><div><CardTitle>Company information</CardTitle><CardDescription>Details submitted through the public enquiry form.</CardDescription></div><Badge variant="pending">{enquiry.status}</Badge></CardHeader><CardContent><DetailList items={details} /></CardContent></Card>
      <Card className="h-fit rounded-2xl border-[#d8e3e1] shadow-none"><CardHeader><div><CardTitle>Create certificate draft</CardTitle><CardDescription>Copy the company and scope details into a controlled draft.</CardDescription></div><Inbox className="size-6 text-[#0f887b]" /></CardHeader><CardContent>{enquiry.status === "converted" ? <AdminNotice>This enquiry has already been converted.</AdminNotice> : <form className="grid gap-5" action="/api/admin/certificates" method="post"><input type="hidden" name="enquiryId" value={enquiry.id} /><Field label="Final certification standard" help="Choose the exact standard that should appear on the draft."><NativeSelect name="certificationId" required defaultValue=""><option value="" disabled>Select certification</option>{certifications.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</NativeSelect></Field><Button type="submit">Create draft<FilePlus2 /></Button></form>}</CardContent></Card>
    </div>
  </>;
}
