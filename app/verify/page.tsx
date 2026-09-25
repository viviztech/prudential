import type { Metadata } from "next";
import { CalendarDays, CircleX, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { findCertificateByNumber } from "../../db/runtime";

export const metadata: Metadata = { title: "Verify a certificate" };

type VerifyProps = { searchParams?: Promise<{ certificate?: string }> };

function showDate(value: string | null) {
  if (!value) return "Not available";
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export default async function VerifyPage({ searchParams }: VerifyProps) {
  const query = searchParams ? await searchParams : {};
  const requestedNumber = query.certificate?.trim() ?? "";
  const certificate = requestedNumber ? await findCertificateByNumber(requestedNumber) : null;

  return (
    <main className="min-h-screen bg-[#f4f7f6]">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#0d2a3d] text-white">
        <div className="absolute -right-32 -top-40 size-[420px] rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative mx-auto w-[min(980px,calc(100%-32px))] py-16 text-center sm:py-20"><span className="mx-auto grid size-14 place-items-center rounded-full border border-[#e0a63a]/60 text-[#e0a63a]"><ShieldCheck className="size-7" /></span><p className="mb-4 mt-6 text-xs font-extrabold uppercase tracking-[.18em] text-[#61cabe]">Public verification</p><h1 className="m-0 font-serif text-[clamp(44px,6vw,70px)] font-medium leading-none tracking-[-.04em]">Check a certificate.</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#a9bbc2]">Enter the complete certificate number exactly as it appears on the printed certificate.</p></div>
      </section>

      <section className="mx-auto -mt-7 w-[min(820px,calc(100%-32px))] pb-20">
        <Card className="relative shadow-xl"><CardContent className="p-6 sm:p-9">
          <form className="flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="certificate">Certificate number</label><Input id="certificate" name="certificate" defaultValue={requestedNumber} placeholder="Example: PASQM26090001" required className="h-12 font-mono uppercase tracking-wider" /><Button className="h-12" type="submit"><Search />Verify certificate</Button></form>
          {!requestedNumber ? <p className="mb-0 mt-4 flex items-center gap-2 text-xs text-[#647983]"><CalendarDays className="size-4 text-[#0f9a8b]" />The certificate number is printed near the issue and expiry dates.</p> : null}

          {requestedNumber && !certificate ? <div className="mt-8 border-l-4 border-[#c84b4b] bg-[#fff7f7] p-6"><div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fbe5e5] text-[#a83b3b]"><CircleX className="size-5" /></span><div><p className="m-0 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#a83b3b]">Not found</p><h2 className="mb-0 mt-2 font-serif text-3xl font-medium text-[#0d2a3d]">No matching certificate</h2><p className="mb-0 mt-2 text-sm text-[#647983]">Check the complete number and try again.</p></div></div></div> : null}

          {certificate ? <div className="mt-8 overflow-hidden rounded-lg border border-[#cfe1de]"><div className="flex flex-col gap-4 bg-[#e6f5f2] p-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded-full bg-[#0f9a8b] text-white"><ShieldCheck className="size-6" /></span><div><p className="m-0 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#08766b]">Verified record</p><h2 className="mb-0 mt-1 font-serif text-3xl font-medium text-[#0d2a3d]">{certificate.company_name}</h2></div></div><Badge>Active certificate</Badge></div><dl className="m-0 divide-y divide-[#e1e8e8] bg-white px-6">{[["Certificate number",certificate.certificate_number],["Standard",certificate.certification_name],["Scope",certificate.scope],["Issue date",showDate(certificate.issue_date)],["Expiry date",showDate(certificate.expiry_date)],["Status",certificate.status === "printed" || certificate.status === "issued" ? "Active" : certificate.status]].map(([label,value]) => <div className="grid gap-2 py-4 sm:grid-cols-[170px_1fr]" key={label}><dt className="text-xs font-bold uppercase tracking-wide text-[#718188]">{label}</dt><dd className="m-0 text-sm leading-6 text-[#18303d]">{value}</dd></div>)}</dl></div> : null}
        </CardContent></Card>
      </section>
      <SiteFooter />
    </main>
  );
}
