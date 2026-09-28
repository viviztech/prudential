import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, SearchCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { PUBLIC_CERTIFICATIONS } from "@/lib/public-certifications";

export const metadata: Metadata = {
  title: "Certification Standards Explained",
  description: "Compare ISO and assurance certifications, understand their benefits, prepare for assessment, and verify Prudential ISO certificate records.",
  alternates: { canonical: "/" },
};

const featured = PUBLIC_CERTIFICATIONS.filter((item) => ["ISO 9001:2026", "ISO 14001:2026", "ISO 45001:2018", "ISO/IEC 27001:2022", "ISO 22000:2018", "ISO 13485:2016"].includes(item.code));
const goals = [
  ["Consistent quality", "ISO 9001", "iso-9001-quality-management"],
  ["Environmental control", "ISO 14001", "iso-14001-environmental-management"],
  ["Safer workplaces", "ISO 45001", "iso-45001-health-safety"],
  ["Information protection", "ISO/IEC 27001", "iso-iec-27001-information-security"],
] as const;

export default function Home() {
  return <main className="guide-site"><SiteHeader />
    <section className="guide-hero"><div className="guide-shell guide-hero-grid"><div><p className="guide-kicker">Prudential standards field guide</p><h1>Choose the certification your business can use.</h1><p className="guide-lead">Understand what each standard controls, where it creates value and what your organization should prepare before requesting certification.</p><div className="guide-actions"><Button asChild size="lg"><Link href="/certifications">Explore certifications <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline"><Link href="/verify"><SearchCheck /> Verify a certificate</Link></Button></div></div><aside className="standard-finder" aria-label="Choose a certification by business goal"><div className="standard-finder-head"><span>Choose by outcome</span><small>04 common starting points</small></div>{goals.map(([goal, standard, slug]) => <Link href={`/certifications/${slug}`} key={standard}><span>{goal}</span><strong>{standard}</strong><ArrowRight aria-hidden="true" /></Link>)}<Link className="standard-finder-all" href="/certifications">View the complete register <ArrowRight /></Link></aside></div></section>
    <section className="guide-proof" aria-label="How this site helps"><div className="guide-shell"><p><strong>Compare</strong><span>Choose by business outcome</span></p><p><strong>Prepare</strong><span>See focus areas and readiness evidence</span></p><p><strong>Verify</strong><span>Check an issued certificate record</span></p></div></section>
    <section className="guide-section guide-shell" aria-labelledby="featured-heading"><div className="guide-section-head"><div><p className="guide-kicker">Core management systems</p><h2 id="featured-heading">Start with the risk you need to control.</h2></div><p>A certification should fit a real operational need. Each guide explains the standard in plain language before you begin an enquiry.</p></div><div className="standards-matrix">{featured.map((item) => <Link className={`matrix-row accent-${item.accent}`} href={`/certifications/${item.slug}`} key={item.slug}><strong>{item.code}</strong><div><h3>{item.name}</h3><p>{item.purpose}</p></div><span>Read guide <ArrowRight /></span></Link>)}</div><Link className="guide-text-link" href="/certifications">Browse all certification and compliance guides <ArrowRight /></Link></section>
    <section className="guide-decision"><div className="guide-shell guide-decision-grid"><div><p className="guide-kicker">A useful certificate starts with scope</p><h2>Define what will be assessed before discussing the document.</h2></div><ol><li><span>1</span><div><strong>Choose the relevant standard</strong><p>Connect the certification to a customer, regulatory, operational or market requirement.</p></div></li><li><span>2</span><div><strong>Set a precise scope</strong><p>Identify the activities, locations, products or services the management system covers.</p></div></li><li><span>3</span><div><strong>Prepare operating evidence</strong><p>Show that processes are implemented, measured, internally audited and reviewed.</p></div></li></ol></div></section>
    <section className="guide-section guide-shell"><div className="verification-callout"><div><ShieldCheck aria-hidden="true" /><p className="guide-kicker">Public certificate register</p><h2>Check the record behind the certificate.</h2><p>Use the complete certificate number to confirm the organization, certified scope, standard, issue date and current record status.</p></div><Button asChild size="lg" variant="outline"><Link href="/verify">Verify certificate <ArrowRight /></Link></Button></div></section>
    <section className="guide-closing"><div className="guide-shell"><div><p className="guide-kicker">Ready to discuss certification?</p><h2>Begin with your organization, scope and intended standard.</h2><ul><li><Check /> Clear certificate type</li><li><Check /> Reviewable company scope</li><li><Check /> Traceable enquiry record</li></ul></div><Button asChild size="lg"><Link href="/enquire">Start an enquiry <ArrowRight /></Link></Button></div></section>
    <SiteFooter />
  </main>;
}
