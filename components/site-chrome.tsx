import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteBrand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className="group inline-flex items-center gap-3" href="/" aria-label="Prudential ISO home">
      <span className="grid size-11 place-items-center rounded-br-2xl bg-[#0d2a3d] font-serif text-2xl text-white shadow-sm transition-transform group-hover:-rotate-2">P</span>
      <span><strong className={`block font-serif text-xl font-medium ${inverse ? "text-white" : "text-[#0d2a3d]"}`}>Prudential</strong><small className={`mt-0.5 block text-[9px] font-bold uppercase tracking-[.16em] ${inverse ? "text-[#8fa8b3]" : "text-[#647983]"}`}>ISO Certification</small></span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#dfe7e7]/90 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/88">
      <div className="mx-auto flex min-h-20 w-[min(1180px,calc(100%-32px))] items-center justify-between gap-6">
        <SiteBrand />
        <nav className="!flex items-center gap-6 text-sm font-semibold text-[#4f6670]" aria-label="Main navigation">
          <Link className="hidden transition hover:text-[#0f9a8b] focus-visible:text-[#0f9a8b] md:block" href="/certifications">Certifications</Link>
          <Link className="hidden transition hover:text-[#0f9a8b] focus-visible:text-[#0f9a8b] lg:block" href="/certifications/iso-9001-quality-management">ISO 9001</Link>
          <Link className="transition hover:text-[#0f9a8b] focus-visible:text-[#0f9a8b]" href="/verify">Verify</Link>
          <Button asChild size="sm"><Link href="/enquire">Start an enquiry<ArrowRight /></Link></Button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#d8e2e2] bg-white">
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 py-10 sm:grid-cols-3 sm:items-center">
        <SiteBrand />
        <p className="m-0 text-sm text-[#647983] sm:text-center">Standards explained. Certificates verified.</p>
        <nav className="!flex flex-wrap gap-5 text-sm font-semibold text-[#4f6670] sm:justify-end" aria-label="Footer navigation"><Link href="/certifications">Certifications</Link><Link href="/verify">Verify</Link><Link href="/login">Admin</Link></nav>
      </div>
    </footer>
  );
}
