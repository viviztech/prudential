import type { Metadata } from "next";
import Link from "@/components/native-link";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import { AdminNotice, AdminPageHeader, Field } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listCertifications } from "../../../../db/runtime";
import { getAdminUser } from "@/app/admin-user";
import { can } from "@/db/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Create certificates" };

export default async function NewCertificatesPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const user = await getAdminUser("/admin/certificates/new");
  if (!can(user, "create")) redirect("/admin");
  const standards = await listCertifications();
  const params: { error?: string } = searchParams ? await searchParams : {};
  const checks = [
    ["applicationChecked", "Application"],
    ["legalChecked", "Legal / documents"],
    ["continuityChecked", "Business continuity proof"],
    ["documentationChecked", "Documentation"],
  ];
  return <>
    <AdminPageHeader eyebrow="New certificate" title="Create certificates" description="Complete the document checklist, enter company details, and select every standard needed." actions={<Button asChild variant="outline"><Link href="/admin/certificates"><ArrowLeft />Back</Link></Button>} />
    {params.error ? <AdminNotice tone="error">The certificate records could not be created. Check the required details and selected standards.</AdminNotice> : null}
    <form action="/api/admin/certificates" method="post" className="mt-7 grid gap-6">
      <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>1. Document checklist</CardTitle><CardDescription>Mark the documents received. Any outstanding item can be completed on the certificate record.</CardDescription></div></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{checks.map(([name, label]) => <label className="flex items-center gap-3 rounded-xl border border-[#dce7e3] p-4 text-sm text-[#31515a]" key={name}><input type="checkbox" name={name} className="size-4" />{label}</label>)}</CardContent></Card>
      <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>2. Company and standards</CardTitle><CardDescription>Each selected standard creates its own certificate for this company.</CardDescription></div></CardHeader><CardContent className="grid gap-5">
        <Field label="Company name"><Input name="companyName" maxLength={200} required /></Field>
        <Field label="Company address"><Textarea name="address" maxLength={2000} required /></Field>
        <Field label="Scope"><Textarea name="scope" maxLength={3000} required /></Field>
        <div className="grid gap-5 sm:grid-cols-2"><Field label="Company email"><Input name="email" type="email" maxLength={320} required /></Field><Field label="Customer phone"><Input name="mobile" type="tel" maxLength={50} required /></Field></div>
        <Field label="Contact person name"><Input name="contactPerson" maxLength={200} required /></Field>
        <fieldset className="grid gap-3"><legend className="mb-3 text-xs font-bold text-[#31515a]">Standards (select one or more)</legend><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{standards.map((standard) => <label className="flex items-center gap-3 rounded-xl border border-[#dce7e3] p-3 text-sm text-[#31515a]" key={standard.id}><input type="checkbox" name="certificationIds" value={standard.id} className="size-4" />{standard.name}</label>)}</div></fieldset>
        <Button className="w-fit" type="submit">Create certificate records<FilePlus2 /></Button>
      </CardContent></Card>
    </form>
  </>;
}
