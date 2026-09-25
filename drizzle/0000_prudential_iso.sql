CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`address` text NOT NULL,
	`scope` text NOT NULL,
	`contact_person` text NOT NULL,
	`mobile` text NOT NULL,
	`email` text NOT NULL,
	`certification` text NOT NULL,
	`notes` text,
	`status` text DEFAULT 'enquiry' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_enquiries_status_created` ON `enquiries` (`status`,`created_at`);
--> statement-breakpoint
CREATE TABLE `certifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`certificate_prefix` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_certifications_code` ON `certifications` (`code`);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`contact_person` text NOT NULL,
	`mobile` text NOT NULL,
	`email` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`certification_id` integer NOT NULL,
	`scope` text NOT NULL,
	`certificate_number` text,
	`status` text DEFAULT 'draft_created' NOT NULL,
	`draft_date` text,
	`approval_date` text,
	`issue_date` text,
	`first_surveillance_date` text,
	`second_surveillance_date` text,
	`third_surveillance_date` text,
	`expiry_date` text,
	`printed_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`certification_id`) REFERENCES `certifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_certificates_number` ON `certificates` (`certificate_number`);
--> statement-breakpoint
CREATE INDEX `idx_certificates_status` ON `certificates` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_certificates_expiry` ON `certificates` (`expiry_date`);
--> statement-breakpoint
CREATE TABLE `certificate_counters` (
	`counter_key` text PRIMARY KEY NOT NULL,
	`last_value` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `certificate_legacy` (
	`certificate_id` text PRIMARY KEY NOT NULL,
	`source_sheet` text NOT NULL,
	`source_row` integer NOT NULL,
	`associate_name` text,
	`original_standard` text,
	`legacy_certificate_number` text,
	`printed` integer DEFAULT false NOT NULL,
	`delivered` integer DEFAULT false NOT NULL,
	`activated` integer DEFAULT false NOT NULL,
	`application_date` text,
	FOREIGN KEY (`certificate_id`) REFERENCES `certificates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_certificate_legacy_source` ON `certificate_legacy` (`source_sheet`,`source_row`);
--> statement-breakpoint
CREATE TABLE `certificate_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`brand_name` text NOT NULL,
	`office_address` text NOT NULL,
	`registration_heading` text NOT NULL,
	`intro_wording` text NOT NULL,
	`conformity_wording` text NOT NULL,
	`footer_wording` text NOT NULL,
	`signatory_name` text,
	`signatory_title` text NOT NULL,
	`logo_key` text,
	`signature_key` text,
	`updated_at` text NOT NULL,
	CONSTRAINT "certificate_settings_singleton" CHECK (`id` = 1)
);
--> statement-breakpoint
PRAGMA optimize;
