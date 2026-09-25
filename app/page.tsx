import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  ClipboardCheck,
  FileCheck2,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { CERTIFICATION_CATALOG } from "../lib/certifications";

const processSteps = [
  {
    number: "01",
    title: "Define the record",
    text: "Share the legal company name, operating address, requested standard, and exact certification scope.",
  },
  {
    number: "02",
    title: "Approve the evidence",
    text: "Review the prepared certificate draft and confirm every detail before the record can move forward.",
  },
  {
    number: "03",
    title: "Issue and verify",
    text: "The approved record receives its dates, certificate number, printable document, and public verification entry.",
  },
] as const;

const controls = [
  [ClipboardCheck, "Draft approval", "Company, scope, and standard stay reviewable before issue."],
  [CalendarClock, "Date control", "Issue, surveillance, reissue, and expiry dates remain visible."],
  [ShieldCheck, "Public verification", "A certificate number connects the document to its live record."],
] as const;

export default function Home() {
  return (
    <main className="home-page">
      <SiteHeader />

      <section className="home-hero" aria-labelledby="home-heading">
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-kicker">Certification control, from enquiry to issue</p>
            <h1 id="home-heading">Every certificate should withstand scrutiny.</h1>
            <p className="home-intro">
              Prudential ISO turns scope, approvals, dates, and identity into one traceable record—clear to your team and simple for anyone to verify.
            </p>
            <div className="home-actions">
              <Button asChild size="lg">
                <Link href="/enquire">Request certification <ArrowRight aria-hidden="true" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/verify"><SearchCheck aria-hidden="true" /> Verify a certificate</Link>
              </Button>
            </div>
            <dl className="home-hero-facts">
              <div><dt>Record</dt><dd>Company + scope</dd></div>
              <div><dt>Control</dt><dd>Draft approval</dd></div>
              <div><dt>Proof</dt><dd>Number + QR</dd></div>
            </dl>
          </div>

          <div className="dossier-scene" aria-label="Controlled certificate record preview">
            <div className="dossier-rail" aria-hidden="true">
              <span>PAS / CONTROLLED RECORD</span>
              <strong>01</strong>
            </div>
            <div className="dossier-meta" aria-hidden="true">
              <span>Certificate register</span>
              <span>Issue control / 2026</span>
            </div>
            <article className="certificate-proof">
              <div className="certificate-proof-head">
                <span className="certificate-monogram">P</span>
                <p><strong>Prudential ISO</strong><small>Certificate of registration</small></p>
                <BadgeCheck aria-hidden="true" />
              </div>
              <div className="certificate-proof-body">
                <p>This is to certify that</p>
                <h2>Your Company Name</h2>
                <p>has established and maintains a management system for its approved scope of activities.</p>
                <div className="certificate-standard">
                  <span>Certified standard</span>
                  <strong>ISO 9001</strong>
                </div>
              </div>
              <dl className="certificate-proof-foot">
                <div><dt>Issue date</dt><dd>Confirmed</dd></div>
                <div><dt>Certificate no.</dt><dd>PASQM••••</dd></div>
              </dl>
            </article>
            <div className="verification-ticket">
              <span><ShieldCheck aria-hidden="true" /></span>
              <p><small>Verification state</small><strong>Record ready</strong></p>
              <Check aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className="control-strip" aria-label="Certificate controls">
        <div className="control-strip-grid">
          {controls.map(([Icon, title, text]) => (
            <div className="control-item" key={title}>
              <Icon aria-hidden="true" />
              <p><strong>{title}</strong><span>{text}</span></p>
            </div>
          ))}
        </div>
      </section>

      <section className="standards-section" id="certifications" aria-labelledby="standards-heading">
        <div className="standards-heading">
          <p className="home-kicker">Standards register</p>
          <h2 id="standards-heading">Choose the standard that matches your work.</h2>
          <p>Start with the certification you need. We collect the company and scope details required to prepare an accurate approval draft.</p>
        </div>
        <div className="standards-register">
          {CERTIFICATION_CATALOG.map((item, index) => (
            <article className="standard-entry" key={item.code}>
              <span className="standard-index">{String(index + 1).padStart(2, "0")}</span>
              <div><p>{item.code}</p><h3>{item.name}</h3></div>
              <p>{item.description}</p>
              <FileCheck2 aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="process-section-new" id="process" aria-labelledby="process-heading">
        <div className="process-grid">
          <div className="process-intro">
            <p className="home-kicker">Controlled workflow</p>
            <h2 id="process-heading">Nothing is issued by guesswork.</h2>
            <p>Each stage has one clear job, one visible outcome, and a record that carries forward.</p>
            <Link className="process-link" href="/enquire">Start your record <ArrowRight aria-hidden="true" /></Link>
          </div>
          <ol className="process-ledger">
            {processSteps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
                <Check aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="assurance-section" aria-labelledby="assurance-heading">
        <div className="assurance-card">
          <div>
            <p className="home-kicker">Built for confidence</p>
            <h2 id="assurance-heading">The document and the record stay connected.</h2>
          </div>
          <div className="assurance-copy">
            <p>A certificate is useful only when its details can be checked. The workflow keeps the approved scope, dates, status, and identifying number together from issue through verification.</p>
            <ul>
              <li><Check aria-hidden="true" /> Human approval before issue</li>
              <li><Check aria-hidden="true" /> Unique certificate identity</li>
              <li><Check aria-hidden="true" /> Public status lookup</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="home-closing" aria-labelledby="closing-heading">
        <div>
          <p className="home-kicker">Open a certification record</p>
          <h2 id="closing-heading">Begin with the details you already know.</h2>
        </div>
        <Button asChild size="lg" variant="outline">
          <Link href="/enquire">Create an enquiry <ArrowRight aria-hidden="true" /></Link>
        </Button>
      </section>

      <SiteFooter />
    </main>
  );
}
