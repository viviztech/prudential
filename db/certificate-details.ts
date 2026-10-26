import { calculateCertificateDates } from "../lib/certificate-dates";
import { allocateCertificateNumber } from "../lib/certificate-numbering";
import type { Database, DatabaseTransaction } from "./postgres";

export const CERTIFICATE_DETAILS_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS certificate_details_snapshots (
    certificate_id TEXT PRIMARY KEY NOT NULL REFERENCES certificates(id),
    company_name TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    scope TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
];

export const CERTIFICATE_DETAILS_MIGRATIONS = [
  // Existing numbered certificates have already used their original final copy.
  // Adding the column without a default distinguishes those rows from new ones.
  `ALTER TABLE certificates ADD COLUMN IF NOT EXISTS final_output_count INTEGER`,
  `UPDATE certificates SET final_output_count = CASE
     WHEN certificate_number IS NOT NULL THEN 1 ELSE 0 END
   WHERE final_output_count IS NULL`,
  `ALTER TABLE certificates ALTER COLUMN final_output_count SET DEFAULT 0`,
  `ALTER TABLE certificates ALTER COLUMN final_output_count SET NOT NULL`,
  `INSERT INTO certificate_details_snapshots
    (certificate_id, company_name, address, contact_person, mobile, email, scope, created_at)
   SELECT cert.id, company.name, company.address, company.contact_person,
     company.mobile, company.email, cert.scope, CURRENT_TIMESTAMP::TEXT
   FROM certificates cert JOIN companies company ON company.id = cert.company_id
   WHERE cert.certificate_number IS NOT NULL OR cert.status IN ('issued', 'printed')
   ON CONFLICT(certificate_id) DO NOTHING`,
];

export type CertificateDetailsActor = { id: string; role: string };
export type CertificateDetailsInput = {
  companyName: string;
  address: string;
  scope: string;
  contactPerson: string;
  mobile: string;
  email: string;
};

type LockedCertificate = {
  id: string;
  company_id: string;
  company_name: string;
  address: string;
  contact_person: string;
  mobile: string;
  email: string | null;
  scope: string;
  status: string;
  certificate_number: string | null;
  certification_code: string;
  certificate_prefix: string;
  draft_date: string | null;
  application_checked: number;
  legal_checked: number;
  continuity_checked: number;
  documentation_checked: number;
};

function validateDetails(input: CertificateDetailsInput): CertificateDetailsInput {
  const limits = { companyName: 200, address: 2000, scope: 3000, contactPerson: 200, mobile: 40, email: 254 };
  const values = {} as CertificateDetailsInput;
  for (const key of Object.keys(limits) as (keyof CertificateDetailsInput)[]) {
    const value = typeof input[key] === "string" ? input[key].trim() : "";
    if ((!value && key !== "email") || value.length > limits[key]) throw new Error("Complete the company details within the allowed field lengths.");
    values[key] = value;
  }
  if (values.email && !/^[^\s@]+@[^\s@]+$/.test(values.email)) throw new Error("Enter a valid company email address.");
  return values;
}

async function lockCertificate(transaction: DatabaseTransaction, id: string) {
  const reference = await transaction.prepare(`SELECT company_id FROM certificates WHERE id = ? AND deleted_at IS NULL`)
    .bind(id).first<{ company_id: string }>();
  if (!reference) throw new Error("Certificate not found.");

  // Every detail edit and workflow transition locks the shared company first.
  // This serializes sibling edits and finalization without reversing lock order.
  await transaction.prepare(`SELECT id FROM companies WHERE id = ? FOR UPDATE`)
    .bind(reference.company_id).first();
  const certificate = await transaction.prepare(
    `SELECT cert.*, COALESCE(snapshot.scope, cert.scope) AS scope,
       COALESCE(snapshot.company_name, company.name) AS company_name,
       COALESCE(snapshot.address, company.address) AS address,
       COALESCE(snapshot.contact_person, company.contact_person) AS contact_person,
       COALESCE(snapshot.mobile, company.mobile) AS mobile,
       CASE WHEN snapshot.certificate_id IS NOT NULL THEN snapshot.email ELSE company.email END AS email,
       standard.code AS certification_code, standard.certificate_prefix
     FROM certificates cert
     JOIN companies company ON company.id = cert.company_id
     JOIN certifications standard ON standard.id = cert.certification_id
     LEFT JOIN certificate_details_snapshots snapshot ON snapshot.certificate_id = cert.id
     WHERE cert.id = ? AND cert.deleted_at IS NULL FOR UPDATE OF cert`,
  ).bind(id).first<LockedCertificate>();
  if (!certificate) throw new Error("Certificate not found.");
  return certificate;
}

async function snapshotFinalizedSiblings(transaction: DatabaseTransaction, companyId: string) {
  await transaction.prepare(
    `INSERT INTO certificate_details_snapshots
      (certificate_id, company_name, address, contact_person, mobile, email, scope, created_at)
     SELECT cert.id, company.name, company.address, company.contact_person,
       company.mobile, company.email, cert.scope, ?
     FROM certificates cert JOIN companies company ON company.id = cert.company_id
     WHERE cert.company_id = ? AND cert.deleted_at IS NULL
       AND (cert.certificate_number IS NOT NULL OR cert.status IN ('issued', 'printed'))
     ON CONFLICT(certificate_id) DO NOTHING`,
  ).bind(new Date().toISOString(), companyId).run();
}

async function snapshotCertificate(transaction: DatabaseTransaction, certificate: LockedCertificate) {
  await transaction.prepare(
    `INSERT INTO certificate_details_snapshots
      (certificate_id, company_name, address, contact_person, mobile, email, scope, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(certificate_id) DO NOTHING`,
  ).bind(certificate.id, certificate.company_name, certificate.address, certificate.contact_person,
    certificate.mobile, certificate.email, certificate.scope, new Date().toISOString()).run();
}

export async function updateCertificateDetailsInDatabase(
  database: Database,
  id: string,
  actor: CertificateDetailsActor,
  input: CertificateDetailsInput,
): Promise<void> {
  if (!actor.id || !["admin", "operator"].includes(actor.role)) {
    throw new Error("You do not have permission to edit certificate details.");
  }
  const values = validateDetails(input);
  await database.transaction(async (transaction) => {
    const certificate = await lockCertificate(transaction, id);
    const finalized = Boolean(certificate.certificate_number) || ["issued", "printed"].includes(certificate.status);
    if (finalized && actor.role !== "admin") {
      throw new Error("Finalized certificate details cannot be changed.");
    }
    const companyChanged = certificate.company_name !== values.companyName
      || certificate.address !== values.address || certificate.contact_person !== values.contactPerson
      || certificate.mobile !== values.mobile || (certificate.email ?? "") !== values.email;
    const scopeChanged = certificate.scope !== values.scope;
    if (!companyChanged && !scopeChanged) return;

    if (finalized) {
      // Corrections belong to this issued document, not the shared company or
      // its other certificates. Retain numbering, dates, workflow and copy access.
      await transaction.prepare(
        `INSERT INTO certificate_details_snapshots
          (certificate_id, company_name, address, contact_person, mobile, email, scope, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(certificate_id) DO UPDATE SET
           company_name = EXCLUDED.company_name, address = EXCLUDED.address,
           contact_person = EXCLUDED.contact_person, mobile = EXCLUDED.mobile,
           email = EXCLUDED.email, scope = EXCLUDED.scope`,
      ).bind(id, values.companyName, values.address, values.contactPerson, values.mobile,
        values.email || null, values.scope, new Date().toISOString()).run();
      if (scopeChanged) {
        await transaction.prepare(`UPDATE certificates SET scope = ? WHERE id = ?`)
          .bind(values.scope, id).run();
      }
      return;
    }

    if (companyChanged) {
      await snapshotFinalizedSiblings(transaction, certificate.company_id);
      await transaction.prepare(
        `UPDATE companies SET name = ?, address = ?, contact_person = ?, mobile = ?, email = ? WHERE id = ?`,
      ).bind(values.companyName, values.address, values.contactPerson, values.mobile, values.email || null,
        certificate.company_id).run();
    }
    if (scopeChanged) {
      await transaction.prepare(`UPDATE certificates SET scope = ? WHERE id = ?`)
        .bind(values.scope, id).run();
    }
    await transaction.prepare(
      `UPDATE certificates SET status = 'draft_created', draft_date = NULL,
        draft_sent_at = NULL, approval_date = NULL
       WHERE ${companyChanged ? "company_id" : "id"} = ?
         AND deleted_at IS NULL AND certificate_number IS NULL AND status NOT IN ('issued', 'printed')`,
    ).bind(companyChanged ? certificate.company_id : id).run();
  });
}

export async function setCertificateStatusInDatabase(
  database: Database,
  id: string,
  action: string,
  issueDate?: string,
  checklist?: boolean[],
): Promise<void> {
  await database.transaction(async (transaction) => {
    const certificate = await lockCertificate(transaction, id);
    const finalized = Boolean(certificate.certificate_number) || ["issued", "printed"].includes(certificate.status);
    const allChecked = [certificate.application_checked, certificate.legal_checked,
      certificate.continuity_checked, certificate.documentation_checked].every(Boolean);
    if (action === "print" && certificate.status === "issued" && certificate.certificate_number) {
      await snapshotCertificate(transaction, certificate);
      await transaction.prepare(
        `UPDATE certificates SET status = 'printed', printed_at = COALESCE(printed_at, ?) WHERE id = ?`,
      ).bind(new Date().toISOString(), id).run();
      return;
    }
    if (finalized) throw new Error("Finalized certificates cannot be changed.");
    if (action === "checklist") {
      if (!["draft_created", "changes_requested"].includes(certificate.status) || !checklist
        || checklist.length !== 4 || checklist.some((value) => typeof value !== "boolean")) {
        throw new Error("Checklist cannot be updated.");
      }
      await transaction.prepare(`UPDATE certificates SET application_checked = ?, legal_checked = ?, continuity_checked = ?, documentation_checked = ? WHERE id = ?`)
        .bind(...checklist.map(Number), id).run();
      return;
    }
    if (action === "draft") {
      if (!["draft_created", "changes_requested"].includes(certificate.status)) throw new Error("Draft cannot be marked now.");
      if (!allChecked) throw new Error("Complete the document checklist first.");
      await transaction.prepare(`UPDATE certificates SET status = 'draft_created', draft_date = ? WHERE id = ?`)
        .bind(new Date().toISOString().slice(0, 10), id).run();
      return;
    }
    if (action === "waiting_approval") {
      if (!certificate.draft_date || !["draft_created", "changes_requested"].includes(certificate.status)) throw new Error("Mark the draft first.");
      if (!allChecked) throw new Error("Complete the document checklist first.");
      await transaction.prepare(`UPDATE certificates SET status = 'waiting_approval', draft_sent_at = ? WHERE id = ?`)
        .bind(new Date().toISOString(), id).run();
      return;
    }
    if (action === "changes_requested") {
      if (certificate.status !== "waiting_approval") throw new Error("Draft is not awaiting confirmation.");
      await transaction.prepare(`UPDATE certificates SET status = 'changes_requested' WHERE id = ?`).bind(id).run();
      return;
    }
    if (action === "approve") {
      if (certificate.status !== "waiting_approval") throw new Error("Draft is not awaiting confirmation.");
      await transaction.prepare(`UPDATE certificates SET status = 'approved', approval_date = ? WHERE id = ?`)
        .bind(new Date().toISOString().slice(0, 10), id).run();
      return;
    }
    if (action !== "print" || !issueDate || certificate.status !== "approved") throw new Error("Unsupported certificate action.");

    const dates = calculateCertificateDates(issueDate);
    const number = await allocateCertificateNumber(transaction, certificate, issueDate);
    await snapshotCertificate(transaction, certificate);
    await transaction.prepare(
      `UPDATE certificates SET status = 'printed', certificate_number = ?, issue_date = ?, printed_at = ?,
        first_surveillance_date = ?, second_surveillance_date = ?, third_surveillance_date = NULL, expiry_date = ?
       WHERE id = ? AND status = 'approved' AND certificate_number IS NULL`,
    ).bind(number, dates.issueDate, new Date().toISOString(), dates.firstSurveillanceDate,
      dates.secondSurveillanceDate, dates.expiryDate, id).run();
  });
}
