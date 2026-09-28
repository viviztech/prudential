/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Database, FileImage, Settings2, Upload } from "lucide-react";
import { AdminNotice, AdminPageHeader, Field } from "@/components/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import report from "../../../data/legacy-import-report.json";
import { getCertificateSettings, getLegacyImportStats } from "../../../db/runtime";

export const metadata: Metadata = { title: "Certificate settings" };
type SettingsProps = { searchParams?: Promise<{ saved?: string; uploaded?: string; imported?: string; error?: string }> };

export default async function SettingsPage({ searchParams }: SettingsProps) {
  const [params, settings, importStats] = await Promise.all([searchParams ?? Promise.resolve({}), getCertificateSettings(), getLegacyImportStats()]);
  return <>
    <AdminPageHeader eyebrow="Configuration" title="Certificate settings" description="Control the wording, artwork and historical data used by certificate operations." />
    {params.saved ? <AdminNotice>Certificate wording saved.</AdminNotice> : null}
    {params.uploaded ? <AdminNotice>Certificate artwork uploaded.</AdminNotice> : null}
    {params.imported ? <AdminNotice>Historical records imported successfully.</AdminNotice> : null}
    {params.error ? <AdminNotice tone="error">The requested update could not be completed.</AdminNotice> : null}

    <div className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <Card className="rounded-2xl border-[#dfe1f0] shadow-none"><CardHeader><div><CardTitle>Certificate wording</CardTitle><CardDescription>Default organization, certification and signatory text.</CardDescription></div><Settings2 className="size-6 text-[#202eff]" /></CardHeader><CardContent><form action="/api/admin/settings" method="post" className="grid gap-5">
        <Field label="Brand name"><Input name="brandName" defaultValue={settings.brand_name} required /></Field>
        <Field label="Office address"><Textarea name="officeAddress" defaultValue={settings.office_address} placeholder="Enter the address to print on the certificate" /></Field>
        <Field label="Certificate heading"><Input name="registrationHeading" defaultValue={settings.registration_heading} required /></Field>
        <Field label="Opening wording"><Textarea name="introWording" defaultValue={settings.intro_wording} required /></Field>
        <Field label="Conformity wording"><Textarea name="conformityWording" defaultValue={settings.conformity_wording} required /></Field>
        <Field label="Footer wording"><Textarea name="footerWording" defaultValue={settings.footer_wording} required /></Field>
        <div className="grid gap-5 sm:grid-cols-2"><Field label="Signatory name"><Input name="signatoryName" defaultValue={settings.signatory_name ?? ""} /></Field><Field label="Signatory title"><Input name="signatoryTitle" defaultValue={settings.signatory_title} required /></Field></div>
        <Button className="w-fit" type="submit">Save certificate wording</Button>
      </form></CardContent></Card>

      <div className="grid content-start gap-6">
        <Card className="rounded-2xl border-[#dfe1f0] shadow-none"><CardHeader><div><CardTitle>Logo and signature</CardTitle><CardDescription>PNG, JPG or WebP up to 2 MB. Transparent PNG files work best for print.</CardDescription></div><FileImage className="size-6 text-[#202eff]" /></CardHeader><CardContent>
          <div className="grid gap-4 sm:grid-cols-2">{[["Logo", settings.logo_key, "/api/certificate-assets/logo", "Current certificate logo"], ["Signature", settings.signature_key, "/api/certificate-assets/signature", "Current certificate signature"]].map(([label, key, src, alt]) => <div className="rounded-xl border border-[#e2e4f2] bg-[#f8faf9] p-4" key={label}><span className="text-[10px] font-bold uppercase tracking-wide text-[#7c82a8]">{label}</span><div className="mt-3 grid h-28 place-items-center overflow-hidden rounded-lg bg-white">{key ? <img className="max-h-24 max-w-full object-contain" src={src} alt={alt} /> : <span className="text-xs text-[#9297b5]">{label === "Logo" ? "Current P mark" : "Not uploaded"}</span>}</div></div>)}</div>
          <form action="/api/admin/settings/assets" method="post" encType="multipart/form-data" className="mt-5 grid gap-4"><Field label="Asset type"><NativeSelect name="kind"><option value="logo">Logo</option><option value="signature">Signature</option></NativeSelect></Field><Field label="Image file"><Input type="file" name="asset" accept="image/png,image/jpeg,image/webp" required /></Field><Button variant="outline" type="submit"><Upload />Upload artwork</Button></form>
        </CardContent></Card>

        <Card className="rounded-2xl border-[#dfe1f0] shadow-none"><CardHeader><div><CardTitle>Historical workbook</CardTitle><CardDescription>Import prepared legacy certificate records for lookup and review.</CardDescription></div><Badge variant="pending">{report.records} rows ready</Badge></CardHeader><CardContent>
          <div className="grid grid-cols-2 gap-3">{[["Ready records", report.records], ["Companies", report.unique_companies], ["Public numbers", report.public_certificate_numbers], ["Needs review", report.records_with_duplicate_numbers + report.records_missing_certificate_number]].map(([label, value]) => <div className="rounded-xl bg-[#f5f6ff] p-4" key={label}><span className="text-[10px] font-bold uppercase tracking-wide text-[#7c82a8]">{label}</span><strong className="mt-2 block font-serif text-2xl font-medium text-[#111a4d]">{value}</strong></div>)}</div>
          <p className="mt-5 rounded-xl border border-[#e2e4f2] p-4 text-xs leading-6 text-[#626992]">Currently imported: <strong>{importStats.records}</strong> records across <strong>{importStats.companies}</strong> companies; <strong>{importStats.review}</strong> require number review.</p>
          <form action="/api/admin/import-legacy" method="post" encType="multipart/form-data" className="mt-5 grid gap-4"><Field label="Prepared import file"><Input type="file" name="legacyFile" accept="application/json,.json" required /></Field><Button type="submit"><Database />Import historical records</Button></form>
        </CardContent></Card>
      </div>
    </div>
  </>;
}
