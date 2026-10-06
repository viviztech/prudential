/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { FileImage, Settings2, Upload } from "lucide-react";
import { AdminNotice, AdminPageHeader, Field } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { getCertificateSettings } from "../../../db/runtime";
import { getAdminUser } from "@/app/admin-user";
import { can } from "@/db/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Certificate settings" };
type SettingsProps = { searchParams?: Promise<{ saved?: string; uploaded?: string; imported?: string; error?: string }> };

export default async function SettingsPage({ searchParams }: SettingsProps) {
  const user = await getAdminUser("/admin/settings");
  if (!can(user, "settings")) redirect("/admin");
  const settings = await getCertificateSettings();
  const params: { saved?: string; uploaded?: string; imported?: string; error?: string } = searchParams ? await searchParams : {};
  const artwork: Array<[string, string | null, string, string]> = [
    ["Logo", settings.logo_key, "/api/certificate-assets/logo", "Current certificate logo"],
    ["Signature", settings.signature_key, "/api/certificate-assets/signature", "Current certificate signature"],
  ];
  return <>
    <AdminPageHeader eyebrow="Configuration" title="Certificate settings" description="Control the wording and artwork used on final certificates." />
    {params.saved ? <AdminNotice>Certificate wording saved.</AdminNotice> : null}
    {params.uploaded ? <AdminNotice>Certificate artwork uploaded.</AdminNotice> : null}
    {params.error ? <AdminNotice tone="error">The requested update could not be completed.</AdminNotice> : null}

    <div className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>Certificate wording</CardTitle><CardDescription>Default organization, certification and signatory text.</CardDescription></div><Settings2 className="size-6 text-[#08766f]" /></CardHeader><CardContent><form action="/api/admin/settings" method="post" className="grid gap-5">
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
        <Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><div><CardTitle>Logo and signature</CardTitle><CardDescription>PNG, JPG or WebP up to 2 MB. Transparent PNG files work best for print.</CardDescription></div><FileImage className="size-6 text-[#08766f]" /></CardHeader><CardContent>
          <div className="grid gap-4 sm:grid-cols-2">{artwork.map(([label, key, src, alt]) => <div className="rounded-xl border border-[#dce7e3] bg-[#f8faf9] p-4" key={label}><span className="text-[10px] font-bold uppercase tracking-wide text-[#607880]">{label}</span><div className="mt-3 grid h-28 place-items-center overflow-hidden rounded-lg bg-white">{key ? <img className="max-h-24 max-w-full object-contain" src={src} alt={alt} /> : <span className="text-xs text-[#607880]">{label === "Logo" ? "Current P mark" : "Not uploaded"}</span>}</div></div>)}</div>
          <form action="/api/admin/settings/assets" method="post" encType="multipart/form-data" className="mt-5 grid gap-4"><Field label="Asset type"><NativeSelect name="kind"><option value="logo">Logo</option><option value="signature">Signature</option></NativeSelect></Field><Field label="Image file"><Input type="file" name="asset" accept="image/png,image/jpeg,image/webp" required /></Field><Button variant="outline" type="submit"><Upload />Upload artwork</Button></form>
        </CardContent></Card>

      </div>
    </div>
  </>;
}
