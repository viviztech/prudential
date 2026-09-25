import { env } from "cloudflare:workers";
import { CERTIFICATION_CATALOG } from "../lib/certifications";

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY NOT NULL,
    company_name TEXT NOT NULL,
    address TEXT NOT NULL,
    scope TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT NOT NULL,
    certification TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'enquiry',
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_enquiries_status_created
    ON enquiries(status, created_at)`,
  `CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    certificate_prefix TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_certifications_code
    ON certifications(code)`,
  `CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY NOT NULL,
    company_id TEXT NOT NULL,
    certification_id INTEGER NOT NULL,
    scope TEXT NOT NULL,
    certificate_number TEXT,
    status TEXT NOT NULL DEFAULT 'draft_created',
    draft_date TEXT,
    approval_date TEXT,
    issue_date TEXT,
    first_surveillance_date TEXT,
    second_surveillance_date TEXT,
    third_surveillance_date TEXT,
    expiry_date TEXT,
    printed_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (certification_id) REFERENCES certifications(id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_number
    ON certificates(certificate_number)`,
  `CREATE INDEX IF NOT EXISTS idx_certificates_status
    ON certificates(status)`,
  `CREATE INDEX IF NOT EXISTS idx_certificates_expiry
    ON certificates(expiry_date)`,
  `CREATE TABLE IF NOT EXISTS certificate_counters (
    counter_key TEXT PRIMARY KEY NOT NULL,
    last_value INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS certificate_legacy (
    certificate_id TEXT PRIMARY KEY NOT NULL,
    source_sheet TEXT NOT NULL,
    source_row INTEGER NOT NULL,
    associate_name TEXT,
    original_standard TEXT,
    legacy_certificate_number TEXT,
    printed INTEGER NOT NULL DEFAULT 0,
    delivered INTEGER NOT NULL DEFAULT 0,
    activated INTEGER NOT NULL DEFAULT 0,
    application_date TEXT,
    FOREIGN KEY (certificate_id) REFERENCES certificates(id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_certificate_legacy_source
    ON certificate_legacy(source_sheet, source_row)`,
  `CREATE TABLE IF NOT EXISTS certificate_settings (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    brand_name TEXT NOT NULL,
    office_address TEXT NOT NULL,
    registration_heading TEXT NOT NULL,
    intro_wording TEXT NOT NULL,
    conformity_wording TEXT NOT NULL,
    footer_wording TEXT NOT NULL,
    signatory_name TEXT,
    signatory_title TEXT NOT NULL,
    logo_key TEXT,
    signature_key TEXT,
    updated_at TEXT NOT NULL
  )`,
];

export type EnquiryRecord = {
  id: string;
  company_name: string;
  address: string;
  scope: string;
  contact_person: string;
  mobile: string;
  email: string;
  certification: string;
  notes: string | null;
  status: string;
  created_at: string;
};

export type CertificationRecord = {
  id: number;
  name: string;
  code: string;
  certificate_prefix: string;
};

export type CertificateRecord = {
  id: string;
  company_id: string;
  company_name: string;
  address: string;
  contact_person: string;
  mobile: string;
  email: string | null;
  certification_name: string;
  certification_code: string;
  certificate_prefix: string;
  scope: string;
  certificate_number: string | null;
  status: string;
  draft_date: string | null;
  approval_date: string | null;
  issue_date: string | null;
  first_surveillance_date: string | null;
  second_surveillance_date: string | null;
  third_surveillance_date: string | null;
  expiry_date: string | null;
  printed_at: string | null;
  created_at: string;
  legacy_source_row: number | null;
  legacy_certificate_number: string | null;
  original_standard: string | null;
  associate_name: string | null;
};

export type CertificateSettings = {
  brand_name: string;
  office_address: string;
  registration_heading: string;
  intro_wording: string;
  conformity_wording: string;
  footer_wording: string;
  signatory_name: string | null;
  signatory_title: string;
  logo_key: string | null;
  signature_key: string | null;
  updated_at: string;
};

export type LegacyRecord = {
  source_sheet: string;
  source_row: number;
  certificate_id: string;
  company_id: string;
  company_name: string;
  address: string;
  scope: string;
  contact_person: string;
  mobile: string;
  email: string | null;
  associate_name: string;
  standard_code: string;
  standard_name: string;
  certificate_prefix: string;
  original_standard: string;
  certificate_number: string | null;
  legacy_certificate_number: string | null;
  status: string;
  printed: boolean;
  delivered: boolean;
  activated: boolean;
  application_date: string | null;
  draft_date: string | null;
  issue_date: string | null;
  first_surveillance_date: string | null;
  second_surveillance_date: string | null;
  third_surveillance_date: string | null;
  expiry_date: string | null;
};

export async function ensureDatabase() {
  await env.DB.batch(schemaStatements.map((sql) => env.DB.prepare(sql)));
  await env.DB.batch(
    CERTIFICATION_CATALOG.map(({ name, code, prefix }) =>
      env.DB.prepare(
        `INSERT INTO certifications (name, code, certificate_prefix, active)
         VALUES (?, ?, ?, 1)
         ON CONFLICT(code) DO UPDATE SET
           name = excluded.name,
           certificate_prefix = excluded.certificate_prefix,
           active = 1`,
      ).bind(name, code, prefix),
    ),
  );
  await env.DB.prepare(`UPDATE certifications SET active = 0 WHERE code = 'OTHER'`).run();
  await env.DB.prepare(
    `INSERT OR IGNORE INTO certificate_settings
      (id, brand_name, office_address, registration_heading, intro_wording,
       conformity_wording, footer_wording, signatory_name, signatory_title, updated_at)
     VALUES (1, 'Prudential ISO', '', 'Certificate of Registration',
       'This is to certify that the management system of',
       'has been assessed and found to conform to the requirements of',
       'This certificate remains the property of Prudential ISO and is subject to the certification terms and conditions.',
       NULL, 'Authorized Signatory', ?)`,
  ).bind(new Date().toISOString()).run();
}

export async function createEnquiry(input: Omit<EnquiryRecord, "id" | "status" | "created_at">) {
  await ensureDatabase();
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO enquiries
      (id, company_name, address, scope, contact_person, mobile, email, certification, notes, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'enquiry', ?)`,
  ).bind(
    id, input.company_name, input.address, input.scope, input.contact_person,
    input.mobile, input.email, input.certification, input.notes,
    new Date().toISOString(),
  ).run();
  return id;
}

export async function listEnquiries() {
  await ensureDatabase();
  const result = await env.DB.prepare(
    `SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 100`,
  ).all<EnquiryRecord>();
  return result.results;
}

export async function getEnquiry(id: string) {
  await ensureDatabase();
  return env.DB.prepare(`SELECT * FROM enquiries WHERE id = ? LIMIT 1`)
    .bind(id).first<EnquiryRecord>();
}

export async function listCertifications() {
  await ensureDatabase();
  const result = await env.DB.prepare(
    `SELECT id, name, code, certificate_prefix
     FROM certifications WHERE active = 1
     ORDER BY CASE code
       ${CERTIFICATION_CATALOG.map((item, index) => `WHEN '${item.code}' THEN ${index}`).join(" ")}
       ELSE ${CERTIFICATION_CATALOG.length}
     END`,
  ).all<CertificationRecord>();
  return result.results;
}

export async function createCertificateFromEnquiry(enquiryId: string, certificationId: number) {
  await ensureDatabase();
  const enquiry = await getEnquiry(enquiryId);
  if (!enquiry) throw new Error("Enquiry not found.");

  const companyId = crypto.randomUUID();
  const certificateId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO companies
        (id, name, address, contact_person, mobile, email, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      companyId, enquiry.company_name, enquiry.address, enquiry.contact_person,
      enquiry.mobile, enquiry.email, now,
    ),
    env.DB.prepare(
      `INSERT INTO certificates
        (id, company_id, certification_id, scope, status, draft_date, created_at)
       VALUES (?, ?, ?, ?, 'draft_created', ?, ?)`,
    ).bind(certificateId, companyId, certificationId, enquiry.scope, now.slice(0, 10), now),
    env.DB.prepare(`UPDATE enquiries SET status = 'converted' WHERE id = ?`).bind(enquiryId),
  ]);

  return certificateId;
}

export async function listCertificates(options: { query?: string; filter?: "review" | "issued" } = {}) {
  await ensureDatabase();
  const conditions: string[] = [];
  const bindings: string[] = [];
  const query = options.query?.trim();
  if (query) {
    conditions.push(`(UPPER(company.name) LIKE UPPER(?) OR UPPER(COALESCE(cert.certificate_number, legacy.legacy_certificate_number, '')) LIKE UPPER(?))`);
    bindings.push(`%${query}%`, `%${query}%`);
  }
  if (options.filter === "review") conditions.push(`cert.certificate_number IS NULL AND legacy.certificate_id IS NOT NULL`);
  if (options.filter === "issued") conditions.push(`cert.certificate_number IS NOT NULL`);
  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const prepared = env.DB.prepare(
    `${certificateSelectSql}${where} ORDER BY cert.created_at DESC LIMIT 300`,
  );
  const result = bindings.length
    ? await prepared.bind(...bindings).all<CertificateRecord>()
    : await prepared.all<CertificateRecord>();
  return result.results;
}

export async function getCertificate(id: string) {
  await ensureDatabase();
  return env.DB.prepare(`${certificateSelectSql} WHERE cert.id = ? LIMIT 1`)
    .bind(id).first<CertificateRecord>();
}

export async function findCertificateByNumber(certificateNumber: string) {
  await ensureDatabase();
  return env.DB.prepare(
    `${certificateSelectSql} WHERE UPPER(cert.certificate_number) = UPPER(?) LIMIT 1`,
  ).bind(certificateNumber).first<CertificateRecord>();
}

export async function setCertificateStatus(id: string, action: string, issueDate?: string) {
  await ensureDatabase();
  if (action === "waiting_approval") {
    await env.DB.prepare(`UPDATE certificates SET status = 'waiting_approval' WHERE id = ?`).bind(id).run();
    return;
  }
  if (action === "changes_requested") {
    await env.DB.prepare(`UPDATE certificates SET status = 'changes_requested' WHERE id = ?`).bind(id).run();
    return;
  }
  if (action === "approve") {
    await env.DB.prepare(
      `UPDATE certificates SET status = 'approved', approval_date = ? WHERE id = ?`,
    ).bind(new Date().toISOString().slice(0, 10), id).run();
    return;
  }
  if (action === "print") {
    await env.DB.prepare(
      `UPDATE certificates SET status = 'printed', printed_at = ? WHERE id = ? AND certificate_number IS NOT NULL`,
    ).bind(new Date().toISOString(), id).run();
    return;
  }
  if (action !== "issue" || !issueDate) throw new Error("Unsupported certificate action.");

  const certificate = await getCertificate(id);
  if (!certificate) throw new Error("Certificate not found.");
  if (certificate.certificate_number) return;

  const issue = parseDate(issueDate);
  const first = addYears(issue, 1);
  const second = addYears(issue, 2);
  const third = addYears(issue, 3);
  const yy = String(issue.getUTCFullYear()).slice(-2);
  const mm = String(issue.getUTCMonth() + 1).padStart(2, "0");
  const usesGlobalSequence = certificate.certification_code === "20001" || certificate.certification_code === "17024";
  const numberStem = usesGlobalSequence
    ? certificate.certificate_prefix
    : `${certificate.certificate_prefix}${yy}${mm}`;
  const sequenceLength = usesGlobalSequence ? 9 : 4;
  const counterKey = `certificate-number:${numberStem}`;
  const existing = await env.DB.prepare(
    `SELECT COALESCE(MAX(CAST(SUBSTR(certificate_number, ?) AS INTEGER)), 0) AS last_value
     FROM certificates
     WHERE certificate_number LIKE ? AND LENGTH(certificate_number) = ?`,
  ).bind(numberStem.length + 1, `${numberStem}%`, numberStem.length + sequenceLength)
    .first<{ last_value: number }>();

  await env.DB.prepare(
    `INSERT INTO certificate_counters (counter_key, last_value) VALUES (?, ?)
     ON CONFLICT(counter_key) DO UPDATE SET
       last_value = MAX(certificate_counters.last_value, excluded.last_value)`,
  ).bind(counterKey, existing?.last_value ?? 0).run();

  const counter = await env.DB.prepare(
    `UPDATE certificate_counters
     SET last_value = last_value + 1
     WHERE counter_key = ?
     RETURNING last_value`,
  ).bind(counterKey).first<{ last_value: number }>();
  if (!counter) throw new Error("Certificate number could not be generated.");
  if (counter.last_value > 10 ** sequenceLength - 1) {
    throw new Error("The certificate number sequence has reached its limit.");
  }

  const number = `${numberStem}${String(counter.last_value).padStart(sequenceLength, "0")}`;
  await env.DB.prepare(
    `UPDATE certificates SET
      status = 'issued', certificate_number = ?, issue_date = ?,
      first_surveillance_date = ?, second_surveillance_date = ?,
      third_surveillance_date = ?, expiry_date = ?
     WHERE id = ? AND certificate_number IS NULL`,
  ).bind(
    number, formatDate(issue), formatDate(first), formatDate(second),
    formatDate(third), formatDate(third), id,
  ).run();
}

export async function getCertificateSettings() {
  await ensureDatabase();
  const settings = await env.DB.prepare(
    `SELECT brand_name, office_address, registration_heading, intro_wording,
      conformity_wording, footer_wording, signatory_name, signatory_title,
      logo_key, signature_key, updated_at
     FROM certificate_settings WHERE id = 1`,
  ).first<CertificateSettings>();
  if (!settings) throw new Error("Certificate settings are unavailable.");
  return settings;
}

export async function updateCertificateSettings(input: Omit<CertificateSettings, "logo_key" | "signature_key" | "updated_at">) {
  await ensureDatabase();
  await env.DB.prepare(
    `UPDATE certificate_settings SET
      brand_name = ?, office_address = ?, registration_heading = ?,
      intro_wording = ?, conformity_wording = ?, footer_wording = ?,
      signatory_name = ?, signatory_title = ?, updated_at = ?
     WHERE id = 1`,
  ).bind(
    input.brand_name, input.office_address, input.registration_heading,
    input.intro_wording, input.conformity_wording, input.footer_wording,
    input.signatory_name, input.signatory_title, new Date().toISOString(),
  ).run();
}

export async function putCertificateAsset(kind: "logo" | "signature", file: File) {
  await ensureDatabase();
  const extension = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  const key = `certificate/${kind}.${extension}`;
  await env.ASSETS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  const column = kind === "logo" ? "logo_key" : "signature_key";
  await env.DB.prepare(
    `UPDATE certificate_settings SET ${column} = ?, updated_at = ? WHERE id = 1`,
  ).bind(key, new Date().toISOString()).run();
}

export async function getCertificateAsset(kind: "logo" | "signature") {
  const settings = await getCertificateSettings();
  const key = kind === "logo" ? settings.logo_key : settings.signature_key;
  if (!key) return null;
  return env.ASSETS.get(key);
}

export async function importLegacyCertificates(records: LegacyRecord[]) {
  await ensureDatabase();
  const existing = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM certificate_legacy`,
  ).first<{ count: number }>();

  let imported = 0;
  for (let start = 0; start < records.length; start += 20) {
    const chunk = records.slice(start, start + 20);
    const statements = [];
    for (const record of chunk) {
      statements.push(
        env.DB.prepare(
          `INSERT OR IGNORE INTO certifications
            (name, code, certificate_prefix, active) VALUES (?, ?, ?, 1)`,
        ).bind(record.standard_name, record.standard_code, record.certificate_prefix),
        env.DB.prepare(
          `INSERT OR IGNORE INTO companies
            (id, name, address, contact_person, mobile, email, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          record.company_id, record.company_name, record.address,
          record.contact_person || "Not recorded", record.mobile || "Not recorded",
          record.email, new Date().toISOString(),
        ),
        env.DB.prepare(
          `INSERT OR IGNORE INTO certificates
            (id, company_id, certification_id, scope, certificate_number, status,
             draft_date, issue_date, first_surveillance_date, second_surveillance_date,
             third_surveillance_date, expiry_date, created_at)
           SELECT ?, ?, id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
           FROM certifications WHERE code = ?`,
        ).bind(
          record.certificate_id, record.company_id, record.scope,
          record.certificate_number, record.status, record.draft_date,
          record.issue_date, record.first_surveillance_date,
          record.second_surveillance_date, record.third_surveillance_date,
          record.expiry_date, new Date().toISOString(), record.standard_code,
        ),
        env.DB.prepare(
          `INSERT OR IGNORE INTO certificate_legacy
            (certificate_id, source_sheet, source_row, associate_name,
             original_standard, legacy_certificate_number, printed, delivered,
             activated, application_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          record.certificate_id, record.source_sheet, record.source_row,
          record.associate_name || null, record.original_standard || null,
          record.legacy_certificate_number, record.printed ? 1 : 0,
          record.delivered ? 1 : 0, record.activated ? 1 : 0,
          record.application_date,
        ),
      );
    }
    await env.DB.batch(statements);
    imported += chunk.length;
  }

  const after = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM certificate_legacy`,
  ).first<{ count: number }>();
  return {
    processed: imported,
    added: Number(after?.count ?? 0) - Number(existing?.count ?? 0),
    total: Number(after?.count ?? 0),
  };
}

export async function getLegacyImportStats() {
  await ensureDatabase();
  const [records, review, companies] = await Promise.all([
    count(`SELECT COUNT(*) AS count FROM certificate_legacy`),
    count(`SELECT COUNT(*) AS count FROM certificate_legacy legacy
      JOIN certificates cert ON cert.id = legacy.certificate_id
      WHERE cert.certificate_number IS NULL`),
    count(`SELECT COUNT(DISTINCT company_id) AS count FROM certificates cert
      JOIN certificate_legacy legacy ON legacy.certificate_id = cert.id`),
  ]);
  return { records, review, companies };
}

export async function getDashboardCounts() {
  await ensureDatabase();
  const [enquiries, waiting, issued, printing] = await Promise.all([
    count(`SELECT COUNT(*) AS count FROM enquiries WHERE status = 'enquiry'`),
    count(`SELECT COUNT(*) AS count FROM certificates WHERE status = 'waiting_approval'`),
    count(`SELECT COUNT(*) AS count FROM certificates WHERE status IN ('issued', 'printed') AND substr(issue_date, 1, 7) = ?`, new Date().toISOString().slice(0, 7)),
    count(`SELECT COUNT(*) AS count FROM certificates WHERE status = 'issued'`),
  ]);
  return { enquiries, waiting, issued, printing };
}

async function count(sql: string, parameter?: string) {
  const query = env.DB.prepare(sql);
  const row = parameter
    ? await query.bind(parameter).first<{ count: number }>()
    : await query.first<{ count: number }>();
  return Number(row?.count ?? 0);
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Issue date is invalid.");
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Issue date is invalid.");
  return date;
}

function addYears(date: Date, years: number) {
  const result = new Date(date);
  result.setUTCFullYear(result.getUTCFullYear() + years);
  return result;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const certificateSelectSql = `
  SELECT cert.*, company.name AS company_name, company.address,
    company.contact_person, company.mobile, company.email,
    standard.name AS certification_name, standard.code AS certification_code,
    standard.certificate_prefix, legacy.source_row AS legacy_source_row,
    legacy.legacy_certificate_number, legacy.original_standard,
    legacy.associate_name
  FROM certificates cert
  JOIN companies company ON company.id = cert.company_id
  JOIN certifications standard ON standard.id = cert.certification_id
  LEFT JOIN certificate_legacy legacy ON legacy.certificate_id = cert.id
`;
