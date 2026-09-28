import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingShell } from "@/components/marketing-blocks";

export function SiteBrand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className="group inline-flex items-center gap-3" href="/" aria-label="Prudential ISO home">
      <span className="grid size-10 place-items-center rounded-xl bg-[#0d2a3d] text-white shadow-sm transition-transform group-hover:-rotate-2"><BadgeCheck className="size-5" /></span>
      <span><strong className={`block font-serif text-xl font-medium leading-none ${inverse ? "text-white" : "text-[#0d2a3d]"}`}>Prudential ISO</strong><small className={`mt-1.5 block text-[9px] font-bold uppercase tracking-[.16em] ${inverse ? "text-[#8fa8b3]" : "text-[#647983]"}`}>Certification guidance</small></span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#e2e9e8] bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <MarketingShell className="flex min-h-20 items-center justify-between gap-6">
        <SiteBrand />
        <nav className="!flex items-center gap-2 text-sm font-semibold text-[#4f6670]" aria-label="Main navigation">
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
    <footer className="border-t border-[#d8e2e2] bg-white">
      <MarketingShell className="grid gap-10 py-12 sm:grid-cols-[1fr_auto] sm:items-center">
        <div><SiteBrand /><p className="mt-5 max-w-md text-sm leading-6 text-[#647983]">Clear guidance for choosing a certification, preparing the management system and verifying an issued record.</p></div>
        <div className="sm:text-right"><Badge variant="outline">Standards explained</Badge><nav className="!mt-5 !flex flex-wrap gap-5 text-sm font-semibold text-[#4f6670] sm:justify-end" aria-label="Footer navigation"><Link href="/certifications">Certifications</Link><Link href="/verify">Verify</Link><Link href="/enquire">Enquire</Link><Link href="/login">Admin</Link></nav></div>
      </MarketingShell>
    </footer>
  );
}
