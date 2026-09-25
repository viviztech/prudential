import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { CERTIFICATION_NAMES } from "../../lib/certifications";

export const metadata: Metadata = { title: "Start an enquiry" };

type EnquireProps = { searchParams?: Promise<{ submitted?: string }> };

const fieldLabel = "mb-2 block text-xs font-bold text-[#0d2a3d]";

export default async function EnquirePage({ searchParams }: EnquireProps) {
  const params = searchParams ? await searchParams : {};
  return (
    <main className="min-h-screen bg-[#f4f7f6]">
      <SiteHeader />
      <section className="border-b border-[#d8e2e2] bg-white">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-14 sm:py-20"><p className="mb-4 text-xs font-extrabold uppercase tracking-[.18em] text-[#0f9a8b]">Certification enquiry</p><h1 className="m-0 max-w-3xl font-serif text-[clamp(44px,6vw,72px)] font-medium leading-[1.02] tracking-[-.04em] text-[#0d2a3d]">Tell us about your company.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#647983]">Share the essential details. We will use them to prepare the correct certification and approval draft.</p></div>
      </section>

      <section className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-6 py-12 lg:grid-cols-[1.3fr_.7fr] lg:gap-10 lg:py-16">
        <Card><CardContent className="p-6 sm:p-9">
          <form action="/api/enquiries" method="post">
            {params.submitted === "1" ? <div className="mb-7 flex items-start gap-3 border-l-4 border-[#0f9a8b] bg-[#dff6f1] p-4 text-sm text-[#075a50]"><CheckCircle2 className="mt-0.5 size-5 shrink-0" /><span><strong className="block">Enquiry received</strong>We will review your details shortly.</span></div> : null}
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2" htmlFor="companyName"><span className={fieldLabel}>Company name</span><Input id="companyName" name="companyName" required /></label>
              <label className="sm:col-span-2" htmlFor="address"><span className={fieldLabel}>Company address</span><Textarea id="address" name="address" required /></label>
              <label className="sm:col-span-2" htmlFor="scope"><span className={fieldLabel}>Certification scope</span><Textarea id="scope" name="scope" placeholder="Describe the activities to be covered" required /></label>
              <label htmlFor="contactPerson"><span className={fieldLabel}>Contact person</span><Input id="contactPerson" name="contactPerson" required /></label>
              <label htmlFor="mobile"><span className={fieldLabel}>Mobile number</span><Input id="mobile" name="mobile" inputMode="tel" required /></label>
              <label htmlFor="email"><span className={fieldLabel}>Email address</span><Input id="email" name="email" type="email" required /></label>
              <label htmlFor="certification"><span className={fieldLabel}>Certification</span><NativeSelect id="certification" name="certification" required defaultValue=""><option value="" disabled>Select certification</option>{CERTIFICATION_NAMES.map((name) => <option key={name}>{name}</option>)}</NativeSelect></label>
              <label className="sm:col-span-2" htmlFor="notes"><span className={fieldLabel}>Additional notes <em className="font-normal not-italic text-[#819198]">(optional)</em></span><Textarea id="notes" name="notes" /></label>
            </div>
            <Button className="mt-7" size="lg" type="submit">Send enquiry<ArrowRight /></Button>
          </form>
        </CardContent></Card>

        <aside className="self-start overflow-hidden rounded-lg bg-[#0d2a3d] text-white shadow-sm">
          <div className="border-b border-white/10 p-7"><p className="mb-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#61cabe]">What happens next?</p><h2 className="m-0 font-serif text-3xl font-medium">A simple path to issue.</h2></div>
          <ol className="m-0 list-none divide-y divide-white/10 p-0">{[[ClipboardCheck,"Review","We confirm the certification requirement."],[FileText,"Draft","We prepare the company and scope details."],[CheckCircle2,"Approval","You approve the certificate information."],[Printer,"Issue & print","We create the dates, number, and final certificate."]].map(([Icon,title,text], index) => { const ItemIcon = Icon as typeof ClipboardCheck; return <li className="grid grid-cols-[42px_1fr] gap-4 p-6" key={String(title)}><span className="grid size-10 place-items-center rounded-full bg-white/8 text-[#e0a63a]"><ItemIcon className="size-5" /></span><div><strong className="text-sm">{index + 1}. {String(title)}</strong><p className="mb-0 mt-1 text-xs leading-5 text-[#a9bbc2]">{String(text)}</p></div></li>; })}</ol>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
