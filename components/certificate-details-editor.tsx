import type { CertificateRecord } from "@/db/runtime";
import { Field } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CertificateDetailsEditor({ certificate, finalized = false }: { certificate: CertificateRecord; finalized?: boolean }) {
  return <form action={`/api/admin/certificates/${encodeURIComponent(certificate.id)}/details`} method="post" className="grid gap-4">
    <Field label="Company name"><Input name="companyName" defaultValue={certificate.company_name} maxLength={200} required /></Field>
    <Field label="Company address"><Textarea name="address" defaultValue={certificate.address} maxLength={2000} required /></Field>
    <Field label="Scope"><Textarea name="scope" defaultValue={certificate.scope} maxLength={3000} required /></Field>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Contact person"><Input name="contactPerson" defaultValue={certificate.contact_person} maxLength={200} required /></Field>
      <Field label="Mobile"><Input type="tel" name="mobile" defaultValue={certificate.mobile} maxLength={40} required /></Field>
    </div>
    <Field label="Email"><Input type="email" name="email" defaultValue={certificate.email ?? ""} maxLength={254} /></Field>
    <p className="m-0 text-xs leading-6 text-[#607880]">{finalized ? "Corrections update this certificate's future final copies and verification details. Its number, dates and finalization status stay the same. Other certificates are unaffected, and additional operator copies still require admin approval." : "Changing company details updates other drafts for this company. Confirmed drafts return for draft confirmation. Issued certificates retain their printed copy details."}</p>
    <Button type="submit" className="w-fit">{finalized ? "Save final certificate corrections" : "Save certificate details"}</Button>
  </form>;
}
