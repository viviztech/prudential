import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FilePlus2, Inbox, Save } from "lucide-react";
import { AdminNotice, AdminPageHeader, Field } from "@/components/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CERTIFICATION_NAMES } from "@/lib/certifications";
import { getEnquiry, listCertifications } from "../../../../db/runtime";

export const metadata: Metadata = { title: "Enquiry details" };
type DetailProps = { searchParams?: Promise<{ id?: string; error?: string; saved?: string }> };

export default async function EnquiryDetailPage({ searchParams }: DetailProps) {
  const params = searchParams ? await searchParams : {};
  const [enquiry, certifications] = await Promise.all([params.id ? getEnquiry(params.id) : Promise.resolve(null), listCertifications()]);
  if (!enquiry) return <Card className="rounded-2xl"><CardContent className="p-10"><h1 className="font-serif text-4xl text-[#111a4d]">Enquiry not found</h1><Button asChild className="mt-6"><Link href="/admin/enquiries">Return to enquiries</Link></Button></CardContent></Card>;

  return <>
    <AdminPageHeader eyebrow="Enquiry details" title={enquiry.company_name} description={`${enquiry.certification} requested by ${enquiry.contact_person}`} actions={<Button asChild variant="outline"><Link href="/admin/enquiries"><ArrowLeft />Back to enquiries</Link></Button>} />
    {params.saved ? <AdminNotice>Enquiry details saved.</AdminNotice> : null}
    {params.error === "invalid" ? <AdminNotice tone="error">Complete all required fields and check their length before saving.</AdminNotice> : null}
    {params.error === "save" ? <AdminNotice tone="error">The enquiry could not be saved. Refresh the page and try again.</AdminNotice> : null}
    {params.error === "1" ? <AdminNotice tone="error">The certificate draft could not be created. Check the selected certification and try again.</AdminNotice> : null}
    <div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <Card className="rounded-2xl border-[#dfe1f0] shadow-none"><CardHeader><div><CardTitle>Edit enquiry information</CardTitle><CardDescription>Correct the submitted details before creating the certificate draft.</CardDescription></div><Badge variant="pending">{enquiry.status}</Badge></CardHeader><CardContent>
        {enquiry.status === "converted" ? <div className="mb-5"><AdminNotice>Changes here update the enquiry record only. The existing certificate draft will not be changed.</AdminNotice></div> : null}
        <form className="grid gap-5" action={`/api/admin/enquiries/${enquiry.id}`} method="post">
          <Field label="Company name"><Input name="companyName" defaultValue={enquiry.company_name} maxLength={200} required /></Field>
          <Field label="Company address"><Textarea name="address" defaultValue={enquiry.address} maxLength={2000} required /></Field>
          <Field label="Certification scope"><Textarea name="scope" defaultValue={enquiry.scope} maxLength={3000} required /></Field>
          <div className="grid gap-5 sm:grid-cols-2"><Field label="Contact person"><Input name="contactPerson" defaultValue={enquiry.contact_person} maxLength={200} required /></Field><Field label="Mobile number"><Input name="mobile" defaultValue={enquiry.mobile} maxLength={50} inputMode="tel" required /></Field></div>
          <div className="grid gap-5 sm:grid-cols-2"><Field label="Email address"><Input name="email" defaultValue={enquiry.email} maxLength={320} type="email" required /></Field><Field label="Requested certification"><NativeSelect name="certification" defaultValue={enquiry.certification} required>{CERTIFICATION_NAMES.includes(enquiry.certification as (typeof CERTIFICATION_NAMES)[number]) ? null : <option value={enquiry.certification}>{enquiry.certification}</option>}{CERTIFICATION_NAMES.map((name) => <option value={name} key={name}>{name}</option>)}</NativeSelect></Field></div>
          <Field label="Additional notes"><Textarea name="notes" defaultValue={enquiry.notes ?? ""} maxLength={3000} /></Field>
          <Button className="w-fit" type="submit"><Save />Save enquiry details</Button>
        </form>
      </CardContent></Card>
      <Card className="h-fit rounded-2xl border-[#dfe1f0] shadow-none"><CardHeader><div><CardTitle>Create certificate draft</CardTitle><CardDescription>Copy the company and scope details into a controlled draft.</CardDescription></div><Inbox className="size-6 text-[#202eff]" /></CardHeader><CardContent>{enquiry.status === "converted" ? <AdminNotice>This enquiry has already been converted.</AdminNotice> : <form className="grid gap-5" action="/api/admin/certificates" method="post"><input type="hidden" name="enquiryId" value={enquiry.id} /><Field label="Final certification standard" help="Choose the exact standard that should appear on the draft."><NativeSelect name="certificationId" required defaultValue=""><option value="" disabled>Select certification</option>{certifications.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</NativeSelect></Field><Button type="submit">Create draft<FilePlus2 /></Button></form>}</CardContent></Card>
    </div>
  </>;
}
