import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(),
  companyName: text("company_name").notNull(),
  address: text("address").notNull(),
  scope: text("scope").notNull(),
  contactPerson: text("contact_person").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email").notNull(),
  certification: text("certification").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("enquiry"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_enquiries_status_created").on(table.status, table.createdAt)]);

export const certifications = sqliteTable("certifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull(),
  certificatePrefix: text("certificate_prefix").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
}, (table) => [uniqueIndex("idx_certifications_code").on(table.code)]);

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  contactPerson: text("contact_person").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email"),
  createdAt: text("created_at").notNull(),
});

export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  certificationId: integer("certification_id").notNull().references(() => certifications.id),
  scope: text("scope").notNull(),
  certificateNumber: text("certificate_number"),
  status: text("status").notNull().default("draft_created"),
  draftDate: text("draft_date"),
  approvalDate: text("approval_date"),
  issueDate: text("issue_date"),
  firstSurveillanceDate: text("first_surveillance_date"),
  secondSurveillanceDate: text("second_surveillance_date"),
  thirdSurveillanceDate: text("third_surveillance_date"),
  expiryDate: text("expiry_date"),
  printedAt: text("printed_at"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("idx_certificates_number").on(table.certificateNumber),
  index("idx_certificates_status").on(table.status),
  index("idx_certificates_expiry").on(table.expiryDate),
]);

export const certificateCounters = sqliteTable("certificate_counters", {
  counterKey: text("counter_key").primaryKey(),
  lastValue: integer("last_value").notNull().default(0),
});

export const certificateLegacy = sqliteTable("certificate_legacy", {
  certificateId: text("certificate_id").primaryKey().references(() => certificates.id),
  sourceSheet: text("source_sheet").notNull(),
  sourceRow: integer("source_row").notNull(),
  associateName: text("associate_name"),
  originalStandard: text("original_standard"),
  legacyCertificateNumber: text("legacy_certificate_number"),
  printed: integer("printed", { mode: "boolean" }).notNull().default(false),
  delivered: integer("delivered", { mode: "boolean" }).notNull().default(false),
  activated: integer("activated", { mode: "boolean" }).notNull().default(false),
  applicationDate: text("application_date"),
}, (table) => [uniqueIndex("idx_certificate_legacy_source").on(table.sourceSheet, table.sourceRow)]);

export const certificateSettings = sqliteTable("certificate_settings", {
  id: integer("id").primaryKey(),
  brandName: text("brand_name").notNull(),
  officeAddress: text("office_address").notNull(),
  registrationHeading: text("registration_heading").notNull(),
  introWording: text("intro_wording").notNull(),
  conformityWording: text("conformity_wording").notNull(),
  footerWording: text("footer_wording").notNull(),
  signatoryName: text("signatory_name"),
  signatoryTitle: text("signatory_title").notNull(),
  logoKey: text("logo_key"),
  signatureKey: text("signature_key"),
  updatedAt: text("updated_at").notNull(),
});
