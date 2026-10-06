/* eslint-disable @next/next/no-img-element */
import Link from "@/components/native-link";
import { notFound, redirect } from "next/navigation";
import { AdminNotice, AdminPageHeader, Field } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { CertificateDocument } from "@/components/certificate-document";
import { DownloadCertificatePdf } from "@/components/download-certificate-pdf";
import { getAdminUser } from "@/app/admin-user";
import { can } from "@/db/auth";
import { getCertificateDesignTemplate, getCertificateSettings } from "@/db/runtime";

type Props = { params: Promise<{ code: string }>; searchParams?: Promise<{ created?: string; saved?: string; uploaded?: string; error?: string }> };

export default async function CertificateTemplatePage({ params, searchParams }: Props) {
  const { code } = await params;
  const user = await getAdminUser(`/admin/templates/${encodeURIComponent(code)}`);
  if (!can(user, "settings")) redirect("/admin");
  const [template, settings] = await Promise.all([getCertificateDesignTemplate(code), getCertificateSettings()]);
  if (!template) notFound();
  const state = searchParams ? await searchParams : {};
  const sample = {
    company_name: "Example Company Limited",
    address: "25 Sample Road, Chennai, Tamil Nadu 600001",
    scope: "Provision of professional services and associated business operations.",
    certificate_number: null,
    issue_date: null,
    first_surveillance_date: null,
    second_surveillance_date: null,
    expiry_date: null,
  };
  return <>
    <div className="mb-5"><Link href="/admin/templates" className="text-sm font-semibold text-[#08766f] hover:underline">← All standard templates</Link></div>
    <AdminPageHeader eyebrow="Certificate design" title={template.standard_label} description="Edit this standard's certificate. Save changes to update the preview and future prints." />
    {state.created ? <AdminNotice>Standard created. Set its wording and upload its artwork below.</AdminNotice> : null}
    {state.saved ? <AdminNotice>Template saved.</AdminNotice> : null}
    {state.uploaded ? <AdminNotice>Artwork uploaded.</AdminNotice> : null}
    {state.error ? <AdminNotice tone="error">Check the fields and upload a PNG, JPG or WebP under 2 MB.</AdminNotice> : null}
    <div className="mt-7 grid gap-6 2xl:grid-cols-[minmax(330px,530px)_minmax(0,1fr)]">
      <div className="grid content-start gap-6">
        <Card><CardHeader><CardTitle>Text and color</CardTitle><CardDescription>All fields on this panel belong to {template.standard_label}.</CardDescription></CardHeader><CardContent>
          <form action={`/api/admin/templates/${encodeURIComponent(code)}`} method="post" className="grid gap-4">
            <Field label="Standard name"><Input name="standardLabel" defaultValue={template.standard_label} maxLength={120} required /></Field>
            <Field label="Certificate heading"><Input name="heading" defaultValue={template.heading} maxLength={120} required /></Field>
            <Field label="Opening content"><Textarea name="openingText" defaultValue={template.opening_text} maxLength={600} required /></Field>
            <Field label="Conformity content"><Textarea name="conformityText" defaultValue={template.conformity_text} maxLength={600} required /></Field>
            <Field label="Scope heading"><Input name="scopeHeading" defaultValue={template.scope_heading} maxLength={120} required /></Field>
            <Field label="Clarification content"><Textarea name="clarificationText" defaultValue={template.clarification_text} maxLength={600} required /></Field>
            <Field label="Footer content"><Textarea name="footerText" defaultValue={template.footer_text} maxLength={600} required /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary color"><Input type="color" name="primaryColor" defaultValue={template.primary_color} required /></Field>
              <Field label="Accent color"><Input type="color" name="accentColor" defaultValue={template.accent_color} required /></Field>
            </div>
            <Button className="w-fit" type="submit">Save template</Button>
          </form>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Standard artwork</CardTitle><CardDescription>Transparent PNG works best. The organization logo and signature are managed in Certificate settings.</CardDescription></CardHeader><CardContent>
          <div className="grid grid-cols-2 gap-3">
            {(["standard", "accreditation"] as const).map((kind) => {
              const present = kind === "standard" ? template.standard_logo_key : template.accreditation_logo_key;
              return <div key={kind} className="grid h-28 place-items-center rounded-xl border border-[#d9e4e1] bg-[#f8faf9]">
                {present ? <img className="max-h-20 max-w-28 object-contain" src={`/api/certificate-templates/${encodeURIComponent(code)}/assets/${kind}?v=${encodeURIComponent(template.updated_at)}`} alt={kind === "standard" ? "Standard logo" : "Accreditation logo"} /> : <span className="text-xs text-[#607880]">{kind === "standard" ? "No standard logo" : "No accreditation logo"}</span>}
              </div>;
            })}
          </div>
          <form action={`/api/admin/templates/${encodeURIComponent(code)}/assets`} method="post" encType="multipart/form-data" className="mt-4 grid gap-4">
            <Field label="Artwork type"><NativeSelect name="kind"><option value="standard">Standard logo</option><option value="accreditation">Accreditation / ANSSIA logo</option></NativeSelect></Field>
            <Field label="Image file"><Input type="file" name="asset" accept="image/png,image/jpeg,image/webp" required /></Field>
            <Button type="submit" variant="outline">Upload artwork</Button>
          </form>
        </CardContent></Card>
      </div>
      <div className="min-w-0"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-semibold text-[#607880]">Print preview · A4 portrait · sample company data</span><DownloadCertificatePdf filename={`preview-${code.toLowerCase()}.pdf`} label="Download preview PDF" /></div><div className="overflow-x-auto rounded-2xl bg-[#dfe7e7] p-4"><CertificateDocument data={sample} template={template} settings={settings} isFinal={false} preview /></div></div>
    </div>
  </>;
}
