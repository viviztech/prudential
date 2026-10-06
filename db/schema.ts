import { customType, index, integer, pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({ dataType: () => "bytea" });

export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  passwordHash: text("password_hash").notNull(),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull().references(() => adminUsers.id),
  expiresAt: text("expires_at").notNull(),
}, (table) => [index("idx_admin_sessions_user").on(table.userId)]);

export const enquiries = pgTable("enquiries", {
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

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  certificatePrefix: text("certificate_prefix").notNull(),
  active: integer("active").notNull().default(1),
}, (table) => [uniqueIndex("idx_certifications_code").on(table.code)]);

export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  contactPerson: text("contact_person").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email"),
  createdAt: text("created_at").notNull(),
});

export const certificates = pgTable("certificates", {
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
  applicationChecked: integer("application_checked").notNull().default(0),
  legalChecked: integer("legal_checked").notNull().default(0),
  continuityChecked: integer("continuity_checked").notNull().default(0),
  documentationChecked: integer("documentation_checked").notNull().default(0),
  draftSentAt: text("draft_sent_at"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("idx_certificates_number").on(table.certificateNumber),
  index("idx_certificates_status").on(table.status),
  index("idx_certificates_expiry").on(table.expiryDate),
]);

export const certificateCounters = pgTable("certificate_counters", {
  counterKey: text("counter_key").primaryKey(),
  lastValue: integer("last_value").notNull().default(0),
});

export const certificateLegacy = pgTable("certificate_legacy", {
  certificateId: text("certificate_id").primaryKey().references(() => certificates.id),
  sourceSheet: text("source_sheet").notNull(),
  sourceRow: integer("source_row").notNull(),
  associateName: text("associate_name"),
  originalStandard: text("original_standard"),
  legacyCertificateNumber: text("legacy_certificate_number"),
  printed: integer("printed").notNull().default(0),
  delivered: integer("delivered").notNull().default(0),
  activated: integer("activated").notNull().default(0),
  applicationDate: text("application_date"),
}, (table) => [uniqueIndex("idx_certificate_legacy_source").on(table.sourceSheet, table.sourceRow)]);

export const certificateSettings = pgTable("certificate_settings", {
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

export const certificateTemplates = pgTable("certificate_templates", {
  standardCode: text("standard_code").primaryKey(),
  standardLabel: text("standard_label").notNull(),
  heading: text("heading").notNull(),
  openingText: text("opening_text").notNull(),
  conformityText: text("conformity_text").notNull(),
  scopeHeading: text("scope_heading").notNull(),
  clarificationText: text("clarification_text").notNull(),
  footerText: text("footer_text").notNull(),
  primaryColor: text("primary_color").notNull(),
  accentColor: text("accent_color").notNull(),
  standardLogoKey: text("standard_logo_key"),
  accreditationLogoKey: text("accreditation_logo_key"),
  updatedAt: text("updated_at").notNull(),
});

export const certificateAssets = pgTable("certificate_assets", {
  assetKey: text("asset_key").primaryKey(),
  contentType: text("content_type").notNull(),
  body: bytea("body").notNull(),
  updatedAt: text("updated_at").notNull(),
});
