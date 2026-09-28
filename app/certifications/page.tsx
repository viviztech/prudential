import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { CERTIFICATION_GROUPS, PUBLIC_CERTIFICATIONS } from "@/lib/public-certifications";

export const metadata: Metadata = { title: "Certification Types and Standards", description: "Compare ISO management-system certifications, food-safety schemes, product compliance and personnel certification guidance.", alternates: { canonical: "/certifications" } };

export default function CertificationsPage() {
  return <main className="guide-site"><SiteHeader /><header className="directory-hero"><div className="guide-shell"><p className="guide-kicker">Certification directory</p><h1>Find the standard that fits the work.</h1><p>Compare purpose, business outcomes and assessment focus before deciding what your organization needs.</p></div></header><div className="guide-shell directory-groups">{CERTIFICATION_GROUPS.map((group) => { const items = PUBLIC_CERTIFICATIONS.filter((item) => item.category === group); const id = `group-${group.replaceAll(" ", "-")}`; return <section key={group} aria-labelledby={id}><div className="directory-group-head"><h2 id={id}>{group}</h2><span>{items.length} guides</span></div><div className="directory-list">{items.map((item) => <Link className={`directory-item accent-${item.accent}`} href={`/certifications/${item.slug}`} key={item.slug}><span>{item.code}</span><div><h3>{item.name}</h3><p>{item.purpose}</p>{item.status === "transition" ? <small>Migration guidance—not a current certification</small> : null}</div><ArrowRight /></Link>)}</div></section>; })}</div><SiteFooter /></main>;
}
