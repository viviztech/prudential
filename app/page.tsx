import type { Metadata } from "next";
import Link from "@/components/native-link";
import { ArrowRight, BadgeCheck, Check, ClipboardCheck, FileSearch, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import { MarketingCta, MarketingShell, SectionHeading, StandardCard } from "@/components/marketing-blocks";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PUBLIC_CERTIFICATIONS } from "@/lib/public-certifications";

export const metadata: Metadata = {
  title: "Certification Standards Explained",
  description: "Compare ISO and assurance certifications, understand their benefits, prepare for assessment, and verify Prudential ISO certificate records.",
  alternates: { canonical: "/" },
};

const featuredCodes = new Set(["ISO 9001:2026", "ISO 14001:2026", "ISO 45001:2018", "ISO/IEC 27001:2022", "ISO 22000:2018", "ISO 13485:2016"]);
const featured = PUBLIC_CERTIFICATIONS.filter((item) => featuredCodes.has(item.code));
const goals = [
  ["Improve consistency", "ISO 9001", "iso-9001-quality-management"],
  ["Control environmental impact", "ISO 14001", "iso-14001-environmental-management"],
  ["Protect people at work", "ISO 45001", "iso-45001-health-safety"],
  ["Secure business information", "ISO/IEC 27001", "iso-iec-27001-information-security"],
] as const;

const assurance = [
  { icon: FileSearch, title: "Compare clearly", text: "See the purpose, scope and business value of each standard before choosing." },
  { icon: ClipboardCheck, title: "Prepare practically", text: "Understand the controls, evidence and internal reviews assessors will expect." },
  { icon: SearchCheck, title: "Verify confidently", text: "Use the public register to confirm an issued certificate and its current record." },
];

export default function Home() {
  return <main className="min-h-screen bg-[#f7f8ff] text-[#1b2352]">
    <SiteHeader />
    <section className="relative overflow-hidden border-b border-[#e1e3f2] bg-[radial-gradient(circle_at_75%_15%,#e8eaff_0,transparent_35%),linear-gradient(180deg,#ffffff_0%,#f5f6ff_100%)]">
      <MarketingShell className="grid min-h-[690px] items-center gap-14 py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
        <div className="max-w-3xl">
          <Badge className="mb-6 gap-2 bg-[#eef0ff] px-3 py-1.5 text-[#1b27d9]"><Sparkles className="size-3.5" /> Certification, made understandable</Badge>
          <h1 className="text-balance font-serif text-5xl font-medium leading-[.98] tracking-[-.055em] text-[#111a4d] sm:text-6xl lg:text-[78px]">Choose the certification your business can use.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#626992]">Compare standards by business outcome, understand what assessment involves and prepare a scope that reflects how your organization actually works.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link href="/certifications">Explore certifications <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline"><Link href="/verify"><SearchCheck /> Verify a certificate</Link></Button></div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#555d86]">{["15 certification guides", "Plain-language preparation", "Public record verification"].map((value) => <span className="flex items-center gap-2" key={value}><Check className="size-4 text-[#202eff]" />{value}</span>)}</div>
        </div>
        <Card className="overflow-hidden rounded-3xl border-[#d7daf5] bg-white/95 shadow-[0_28px_90px_rgba(13,42,61,.13)]">
          <CardHeader className="items-center bg-[#111a4d] text-white"><div><Badge className="bg-white/10 text-[#c8ccff]">Standard selector</Badge><CardTitle className="mt-4 text-3xl text-white">Start with the outcome</CardTitle><CardDescription className="text-[#afc1c7]">Choose the operational result you need to strengthen.</CardDescription></div><BadgeCheck className="size-8 text-[#9da4ff]" /></CardHeader>
          <CardContent className="p-2 sm:p-3">{goals.map(([goal, standard, slug]) => <Link className="group grid grid-cols-[1fr_auto] items-center gap-5 rounded-xl px-5 py-4 transition hover:bg-[#f2f3ff]" href={`/certifications/${slug}`} key={standard}><span><small className="block text-xs text-[#70779d]">{goal}</small><strong className="mt-1 block font-serif text-xl font-medium text-[#111a4d]">{standard}</strong></span><ArrowRight className="size-5 text-[#8ca0a6] transition group-hover:translate-x-1 group-hover:text-[#202eff]" /></Link>)}</CardContent>
          <div className="border-t border-[#e0e8e8] p-4"><Button asChild variant="ghost" className="w-full justify-between"><Link href="/certifications">View all certificate types <ArrowRight /></Link></Button></div>
        </Card>
      </MarketingShell>
    </section>

    <MarketingShell className="grid gap-4 py-8 md:grid-cols-3">{assurance.map(({ icon: Icon, title, text }) => <Card className="rounded-2xl border-[#e1e3f2] shadow-none" key={title}><CardContent className="flex gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eef0ff] text-[#202eff]"><Icon className="size-5" /></span><div><h2 className="font-semibold text-[#111a4d]">{title}</h2><p className="mt-1 text-sm leading-6 text-[#626992]">{text}</p></div></CardContent></Card>)}</MarketingShell>

    <section className="py-20 sm:py-28"><MarketingShell><SectionHeading eyebrow="Popular management systems" title="Start with the risk you need to control." description="Each guide translates the standard into business outcomes, assessment focus areas and a practical readiness checklist." /><div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{featured.map((item) => <StandardCard item={item} key={item.slug} />)}</div><div className="mt-9 text-center"><Button asChild variant="outline" size="lg"><Link href="/certifications">Browse all certification guides <ArrowRight /></Link></Button></div></MarketingShell></section>

    <section className="border-y border-[#dfe1f0] bg-white py-20 sm:py-28"><MarketingShell className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div className="lg:sticky lg:top-28"><SectionHeading eyebrow="A useful certificate starts with scope" title="Prepare the system before the document." description="Certification works best when the standard, scope and operating evidence describe the same real business." /><Button asChild className="mt-8" variant="outline"><Link href="/enquire">Discuss your scope <ArrowRight /></Link></Button></div><div className="grid gap-4">{[
      ["01", "Choose the relevant standard", "Connect certification to a customer, regulatory, operational or market requirement."],
      ["02", "Define a precise scope", "Identify the activities, locations, products or services the management system covers."],
      ["03", "Build operating evidence", "Show that processes are implemented, measured, internally audited and reviewed."],
      ["04", "Maintain the certificate", "Continue surveillance, corrective action and improvement throughout the certification cycle."],
    ].map(([number, title, text]) => <Card className="rounded-2xl border-[#dfe1f0] shadow-none" key={number}><CardContent className="grid gap-4 p-6 sm:grid-cols-[52px_1fr]"><span className="grid size-11 place-items-center rounded-xl bg-[#111a4d] font-serif text-lg text-white">{number}</span><div><h3 className="font-serif text-2xl font-medium text-[#111a4d]">{title}</h3><p className="mt-2 text-sm leading-7 text-[#626992]">{text}</p></div></CardContent></Card>)}</div></MarketingShell></section>

    <section className="py-20 sm:py-28"><MarketingShell><Card className="grid overflow-hidden rounded-3xl border-[#c8ccff] bg-[#f0f1ff] shadow-none lg:grid-cols-[1fr_auto] lg:items-center"><CardContent className="p-8 sm:p-12"><span className="grid size-12 place-items-center rounded-2xl bg-white text-[#202eff] shadow-sm"><ShieldCheck className="size-6" /></span><Badge className="mt-7">Public certificate register</Badge><h2 className="mt-5 max-w-3xl font-serif text-4xl font-medium tracking-[-.035em] text-[#111a4d] sm:text-5xl">Check the record behind the certificate.</h2><p className="mt-5 max-w-2xl text-base leading-8 text-[#5b638e]">Enter the complete certificate number to confirm the organization, certified scope, applicable standard, issue date and record status.</p></CardContent><div className="p-8 pt-0 sm:p-12 sm:pt-0 lg:pt-12"><Button asChild size="lg" variant="navy"><Link href="/verify">Verify certificate <ArrowRight /></Link></Button></div></Card></MarketingShell></section>

    <MarketingCta eyebrow="Ready to begin?" title="Start with your organization, scope and intended standard." description="Send the essential details once. We will use them to understand the certification type and scope you want to discuss." primaryHref="/enquire" primaryLabel="Start an enquiry" secondaryHref="/certifications" secondaryLabel="Compare standards" />
    <SiteFooter />
  </main>;
}
