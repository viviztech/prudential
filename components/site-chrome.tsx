/* eslint-disable @next/next/no-img-element */
import Link from "@/components/native-link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingShell } from "@/components/marketing-blocks";
import { CONTACT_DETAILS } from "@/lib/contact";

export function SiteBrand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className="group inline-flex items-center gap-3" href="/" aria-label="Prudential ISO home">
      <span className="relative size-12 overflow-hidden rounded-xl border border-[#c8ccff] bg-white shadow-sm transition-transform group-hover:-rotate-2"><img className="absolute left-1/2 top-0 h-[70px] w-[70px] max-w-none -translate-x-1/2 object-cover object-top" src="/ps-logo.jpg" alt="" /></span>
      <span><strong className={`block font-serif text-xl font-medium leading-none ${inverse ? "text-white" : "text-[#111a4d]"}`}>Prudential</strong><small className={`mt-1.5 block text-[9px] font-bold uppercase tracking-[.16em] ${inverse ? "text-[#b5b9e8]" : "text-[#626992]"}`}>Assessment Services LLP</small></span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#e1e3f2] bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <MarketingShell className="flex min-h-20 items-center justify-between gap-6">
        <SiteBrand />
        <nav className="!flex items-center gap-2 text-sm font-semibold text-[#555d86]" aria-label="Main navigation">
          <Button asChild variant="ghost" className="hidden md:inline-flex"><Link href="/certifications">Certifications</Link></Button>
          <Button asChild variant="ghost" className="hidden lg:inline-flex"><Link href="/certifications/iso-9001-quality-management">ISO 9001</Link></Button>
          <Button asChild variant="ghost"><Link href="/verify">Verify</Link></Button>
          <Button asChild size="sm"><Link href="/enquire">Enquire<ArrowRight /></Link></Button>
        </nav>
      </MarketingShell>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#dfe1f0] bg-white">
      <MarketingShell className="grid gap-10 py-12 lg:grid-cols-[1fr_1fr_auto] lg:items-start">
        <div><SiteBrand /><p className="mt-5 max-w-md text-sm leading-6 text-[#626992]">Clear guidance for choosing a certification, preparing the management system and verifying an issued record.</p></div>
        <address className="grid gap-3 text-sm not-italic leading-6 text-[#555d86]">
          <span className="flex items-start gap-3"><MapPin className="mt-1 size-4 shrink-0 text-[#202eff]" /><span>{CONTACT_DETAILS.address}</span></span>
          <a className="flex items-center gap-3 hover:text-[#202eff]" href={`tel:${CONTACT_DETAILS.phone}`}><Phone className="size-4 shrink-0 text-[#202eff]" />{CONTACT_DETAILS.phoneDisplay}</a>
          <a className="flex items-center gap-3 hover:text-[#202eff]" href={`mailto:${CONTACT_DETAILS.email}`}><Mail className="size-4 shrink-0 text-[#202eff]" />{CONTACT_DETAILS.email}</a>
        </address>
        <div className="sm:text-right"><Badge variant="outline">Standards explained</Badge><nav className="!mt-5 !flex flex-wrap gap-5 text-sm font-semibold text-[#555d86] sm:justify-end" aria-label="Footer navigation"><Link href="/certifications">Certifications</Link><Link href="/verify">Verify</Link><Link href="/enquire">Enquire</Link><Link href="/login">Admin</Link></nav></div>
      </MarketingShell>
    </footer>
  );
}
