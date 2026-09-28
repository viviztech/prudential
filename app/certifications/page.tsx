import type { Metadata } from "next";
import { Layers3 } from "lucide-react";
import { MarketingCta, MarketingShell, StandardCard } from "@/components/marketing-blocks";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CERTIFICATION_GROUPS, PUBLIC_CERTIFICATIONS } from "@/lib/public-certifications";

export const metadata: Metadata = { title: "Certification Types and Standards", description: "Compare ISO management-system certifications, food-safety schemes, product compliance and personnel certification guidance.", alternates: { canonical: "/certifications" } };

export default function CertificationsPage() {
  return <main className="min-h-screen bg-[#f7f8ff] text-[#1b2352]">
    <SiteHeader />
    <header className="border-b border-[#e1e3f2] bg-[radial-gradient(circle_at_85%_0%,#e8eaff_0,transparent_32%),linear-gradient(180deg,#fff_0%,#f5f6ff_100%)]">
      <MarketingShell className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_320px] lg:items-end">
        <div className="max-w-4xl"><Badge className="mb-6">Certification directory</Badge><h1 className="text-balance font-serif text-5xl font-medium leading-[.98] tracking-[-.05em] text-[#111a4d] sm:text-6xl lg:text-7xl">Find the standard that fits the work.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#626992]">Compare purpose, business outcomes and assessment focus before deciding what your organization needs.</p></div>
        <Card className="rounded-2xl border-[#d7daf5] shadow-none"><CardContent className="flex items-center gap-5 p-6"><span className="grid size-12 place-items-center rounded-xl bg-[#eef0ff] text-[#202eff]"><Layers3 className="size-6" /></span><div><strong className="block font-serif text-3xl font-medium text-[#111a4d]">{PUBLIC_CERTIFICATIONS.length}</strong><span className="text-sm text-[#626992]">standards and schemes explained</span></div></CardContent></Card>
      </MarketingShell>
    </header>
    <MarketingShell className="py-20 sm:py-24">{CERTIFICATION_GROUPS.map((group, groupIndex) => { const items = PUBLIC_CERTIFICATIONS.filter((item) => item.category === group); const id = `group-${group.replaceAll(" ", "-")}`; return <section className={groupIndex ? "mt-20" : ""} key={group} aria-labelledby={id}><div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#d9dcf1] pb-5"><div><Badge variant="outline">Collection {String(groupIndex + 1).padStart(2, "0")}</Badge><h2 className="mt-4 font-serif text-4xl font-medium tracking-[-.035em] text-[#111a4d] sm:text-5xl" id={id}>{group}</h2></div><span className="text-sm font-semibold text-[#70779d]">{items.length} guides</span></div><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div className="relative" key={item.slug}><StandardCard item={item} compact />{item.status === "transition" ? <Badge variant="pending" className="absolute bottom-5 right-5">Migration guidance</Badge> : null}</div>)}</div></section>; })}</MarketingShell>
    <MarketingCta eyebrow="Not sure where to start?" title="Describe the result you need, not only the certificate name." description="Tell us about your organization, customer requirement and intended scope. We can use that context to discuss the most relevant path." primaryHref="/enquire" primaryLabel="Ask about certification" secondaryHref="/verify" secondaryLabel="Verify a certificate" />
    <SiteFooter />
  </main>;
}
