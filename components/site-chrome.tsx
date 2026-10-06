/* eslint-disable @next/next/no-img-element */
import Link from "@/components/native-link";
import { ActiveNavLink, ActiveNavSummary } from "@/components/active-nav-link";
import { ArrowRight, ChevronDown, Mail, MapPin, Menu, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarketingShell } from "@/components/marketing-blocks";
import { CONTACT_DETAILS } from "@/lib/contact";
import { CERTIFICATION_GROUPS, PUBLIC_CERTIFICATIONS } from "@/lib/public-certifications";

const certificateGroups = CERTIFICATION_GROUPS.map((name) => ({
  name,
  items: PUBLIC_CERTIFICATIONS.filter((item) => item.category === name),
}));

function CertificateLinks({ mobile = false }: { mobile?: boolean }) {
  return certificateGroups.map((group) => (
    <section className={mobile ? "mobile-certificate-group" : "certificate-mega-group"} key={group.name}>
      <h3>{group.name}</h3>
      <ul>
        {group.items.map((item) => (
          <li key={item.slug}>
            <Link href={`/certifications/${item.slug}`}>
              <strong>{item.code.replace(/:\d{4}$/, "")}</strong>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  ));
}

export function SiteBrand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className="group inline-flex items-center gap-3" href="/" aria-label="Prudential ISO home">
      <span className="relative size-12 overflow-hidden rounded-xl border border-[#c4ddd6] bg-white shadow-sm transition-transform group-hover:-rotate-2"><img className="absolute left-1/2 top-0 h-[70px] w-[70px] max-w-none -translate-x-1/2 object-cover object-top" src="/ps-logo.jpg" alt="" /></span>
      <span><strong className={`block font-serif text-xl font-medium leading-none ${inverse ? "text-white" : "text-[#0d2a3d]"}`}>Prudential</strong><small className={`mt-1.5 block text-[9px] font-bold uppercase tracking-[.16em] ${inverse ? "text-[#aec8c8]" : "text-[#526b73]"}`}>Assessment Services LLP</small></span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="site-navigation sticky top-0 z-30 border-b border-[#dce7e3] bg-white/95 backdrop-blur-xl">
      <MarketingShell className="flex min-h-20 items-center justify-between gap-6">
        <SiteBrand />
        <nav className="site-navigation-desktop hidden items-center gap-1 text-sm font-semibold lg:flex" aria-label="Main navigation">
          <ActiveNavLink className="site-navigation-link" href="/">Home</ActiveNavLink>
          <details className="nav-disclosure">
            <ActiveNavSummary section="/certifications" className="site-navigation-link cursor-pointer select-none">Certificates <ChevronDown className="size-4" aria-hidden="true" /></ActiveNavSummary>
            <div className="certificate-mega">
              <MarketingShell>
                <div className="certificate-mega-heading">
                  <div><span>Certificate directory</span><p>Find the standard that fits your work.</p></div>
                  <Link href="/certifications">Browse all {PUBLIC_CERTIFICATIONS.length} guides <ArrowRight className="size-4" aria-hidden="true" /></Link>
                </div>
                <div className="certificate-mega-grid"><CertificateLinks /></div>
              </MarketingShell>
            </div>
          </details>
          <ActiveNavLink className="site-navigation-link" href="/verify">Verify</ActiveNavLink>
          <ActiveNavLink className="site-navigation-cta" href="/enquire">Contact / Enquiry <ArrowRight className="size-4" aria-hidden="true" /></ActiveNavLink>
        </nav>
        <details className="nav-disclosure site-navigation-mobile lg:hidden">
          <summary className="mobile-menu-toggle"><Menu className="size-5" aria-hidden="true" /><span>Menu</span></summary>
          <nav className="mobile-menu-panel" aria-label="Mobile navigation">
            <ActiveNavLink className="mobile-menu-primary" href="/">Home</ActiveNavLink>
            <details className="nav-disclosure mobile-certificates">
              <ActiveNavSummary section="/certifications" className="mobile-menu-primary">Certificates <ChevronDown className="size-4" aria-hidden="true" /></ActiveNavSummary>
              <div className="mobile-certificate-directory">
                <Link className="mobile-browse-all" href="/certifications">Browse all certificates <ArrowRight className="size-4" aria-hidden="true" /></Link>
                <CertificateLinks mobile />
              </div>
            </details>
            <ActiveNavLink className="mobile-menu-primary" href="/verify">Verify</ActiveNavLink>
            <ActiveNavLink className="mobile-menu-contact" href="/enquire">Contact / Enquiry <ArrowRight className="size-4" aria-hidden="true" /></ActiveNavLink>
          </nav>
        </details>
      </MarketingShell>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#d9e4e1] bg-white">
      <MarketingShell className="grid gap-10 py-12 lg:grid-cols-[1fr_1fr_auto] lg:items-start">
        <div><SiteBrand /><p className="mt-5 max-w-md text-sm leading-6 text-[#526b73]">Clear guidance for choosing a certification, preparing the management system and verifying an issued record.</p></div>
        <address className="grid gap-3 text-sm not-italic leading-6 text-[#4d6870]">
          <span className="flex items-start gap-3"><MapPin className="mt-1 size-4 shrink-0 text-[#08766f]" /><span>{CONTACT_DETAILS.address}</span></span>
          <a className="flex items-center gap-3 hover:text-[#08766f]" href={`tel:${CONTACT_DETAILS.phone}`}><Phone className="size-4 shrink-0 text-[#08766f]" />{CONTACT_DETAILS.phoneDisplay}</a>
          <a className="flex items-center gap-3 hover:text-[#08766f]" href={`mailto:${CONTACT_DETAILS.email}`}><Mail className="size-4 shrink-0 text-[#08766f]" />{CONTACT_DETAILS.email}</a>
        </address>
        <div className="sm:text-right"><Badge variant="outline">Standards explained</Badge><nav className="!mt-5 !flex flex-wrap gap-5 text-sm font-semibold text-[#4d6870] sm:justify-end" aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/certifications">Certificates</Link><Link href="/verify">Verify</Link><Link href="/enquire">Contact / Enquiry</Link><Link href="/login">Admin</Link></nav></div>
      </MarketingShell>
    </footer>
  );
}
