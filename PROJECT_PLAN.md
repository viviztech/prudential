# Prudential ISO - Project Plan

## 1. Project Overview

Prudential ISO will be a simple web application for receiving certification enquiries, preparing certificate drafts, recording customer approval, issuing final certificates, and printing them.

The project has two parts:

1. A public marketing website for Prudential ISO.
2. A private admin panel with one administrator login.

The system will replace the existing spreadsheet-based certificate register while keeping the workflow intentionally simple.

## 2. MVP Workflow

```text
Enquiry received
    |
Select certification
    |
Enter company details
    |
Generate draft certificate
    |
Send draft to customer
    |
Record approval or requested changes
    |
Enter issue date
    |
Generate surveillance dates and certificate number
    |
Generate final certificate
    |
Download and print certificate
```

## 3. Public Marketing Website

### Pages

- Home
- About Us
- Certifications
- Certification Process
- Enquiry Form
- Certificate Verification
- Contact Us
- Privacy Policy
- Terms and Conditions

### Enquiry Form

The public enquiry form will collect:

- Company name
- Contact person
- Mobile number
- Email address
- Required certification
- Message or notes

Every submitted enquiry will be saved and shown in the admin panel.

## 4. Admin Panel

Only one administrator account is required for the MVP.

### Admin Login

- Branded admin login screen
- Secure hosted sign-in restricted to the approved administrator email
- Forgot-password screen leading to the secure identity provider's recovery flow
- Visible logout control

### Dashboard

The dashboard will show:

- New enquiries
- Draft certificates
- Certificates waiting for approval
- Approved certificates
- Issued certificates
- Printed certificates
- Upcoming surveillance dates
- Certificates nearing expiry

### Main Sections

- Dashboard
- Enquiries
- Companies
- Certificates
- Certificate Templates
- Certifications
- Settings

## 5. Enquiry Management

The administrator can:

- View enquiries received from the website
- Create an enquiry manually
- Edit enquiry details
- Select the required certification
- Convert an enquiry into a certificate application
- Add internal notes

### Enquiry Fields

- Enquiry date
- Company name
- Contact person
- Mobile number
- Email address
- Required certification
- Notes
- Enquiry status

## 6. Company and Certificate Details

The administrator will enter:

- Company name
- Company address
- Certification scope
- Contact person
- Mobile number
- Email address
- Selected certification
- Optional associate name

One company may have more than one certificate.

## 7. Certification Management

The administrator can maintain a simple certification list.

Certification catalog:

- ISO 9001
- ISO 14001
- OHSAS 18001
- ISO 22000
- ISO 27000
- GMP
- HACCP
- CE
- ROHS
- GREEN
- ISO 13485
- SA 8000
- ISO 45001
- ISO 20001
- ISO 17024:2017

Each certification can have:

- Name
- Standard/version
- Short code
- Certificate-number format
- Default validity period
- Active/inactive status

## 8. Draft Certificate

The administrator can generate a draft certificate after entering the company details.

The draft will contain:

- Prudential ISO branding
- Company name
- Company address
- Certification scope
- Certification standard
- Draft watermark
- Optional signature and logo placeholders

The draft can be downloaded as a PDF and sent to the customer outside the system.

### Draft Statuses

- Draft created
- Waiting for approval
- Changes requested
- Approved

If the customer requests changes, the administrator can edit the details and generate a revised draft.

## 9. Final Certificate Details

After the draft is approved, the administrator will enter the issue date.

The system will calculate:

- First surveillance date
- Second surveillance date
- Third surveillance date
- Expiry date

The generated dates must remain editable by the administrator.

The system will also generate a unique certificate number based on the selected certification's numbering format.

Certificate-number formats:

```text
ISO 9001       PASQMYYMMXXXX
ISO 14001      PASEMYYMMXXXX
OHSAS 18001    PASOHYYMMXXXX
ISO 22000      PASFSYYMMXXXX
ISO 27000      PASISYYMMXXXX
GMP            PASGMYYMMXXXX
HACCP          PASHAYYMMXXXX
CE             PASCEYYMMXXXX
ROHS           PASROYYMMXXXX
GREEN          PASGRYYMMXXXX
ISO 13485      PASMDYYMMXXXX
SA 8000        PASSAYYMMXXXX
ISO 45001      PASOHYYMMXXXX
ISO 20001      PASITXXXXXXXXX
ISO 17024:2017 PASCSXXXXXXXXX
```

`YYMM` is taken from the issue date. `XXXX` is a four-digit sequence, and
`XXXXXXXXX` is a nine-digit sequence. Certificate numbers contain no spaces or
hyphens.

Certificate numbers must never be duplicated.

## 10. Final Certificate and Printing

After approval and number generation, the system will create the final certificate PDF.

The final certificate will contain:

- Company name
- Address
- Scope
- Certification standard
- Certificate number
- Issue date
- Surveillance dates, when required on the design
- Expiry date
- Authorized signature
- Prudential ISO branding
- QR code or verification URL

The administrator can:

- Preview the certificate
- Download the PDF
- Print the certificate
- Mark the certificate as printed
- Record the printed date

## 11. Certificate Verification

Each final certificate will have a QR code and public verification URL.

Example:

```text
https://prudentialiso.com/verify?certificate=PASQM26090001
```

The public verification page will show:

- Certificate number
- Company name
- Company address
- Certification scope
- Certification standard
- Issue date
- Expiry date
- Certificate status

Private contact information and internal notes will not be shown publicly.

## 12. Certificate Statuses

The MVP will use these statuses:

1. Enquiry
2. Draft created
3. Waiting for approval
4. Changes requested
5. Approved
6. Issued
7. Printed

An issued certificate may later be marked:

- Expired
- Cancelled

## 13. Notifications and Reminders

The admin dashboard will highlight:

- First surveillance due dates
- Second surveillance due dates
- Third surveillance due dates
- Certificates nearing expiry

Email or WhatsApp automation is not required for the first version. It can be added later.

## 14. Existing Spreadsheet Migration

The existing Excel workbook will be used as the source for importing historical records.

Before import, the data should be cleaned to handle:

- Duplicate certificate numbers
- Missing certificate numbers
- Mixed date formats
- Inconsistent certification names
- Inconsistent Yes/No values
- Blank records containing only serial-number formulas
- Existing hold or cancelled records

The original spreadsheet will remain unchanged as a backup.

## 15. Suggested Data Structure

The MVP needs only a small set of database records:

- Admin user
- Enquiries
- Companies
- Certifications
- Certificates
- Certificate draft versions
- Certificate templates
- Application settings

Audit, auditor, finance, quotation, and employee-management records are not required.

## 16. Proposed Technical Foundation

- Responsive web application
- TypeScript-based frontend and backend
- PostgreSQL database
- Secure password authentication
- Server-side PDF certificate generation
- File storage for draft and final PDFs
- QR-code generation
- Automated database backups

The final technology choices can be confirmed before development begins.

## 17. Development Stages

### Stage 1 - Foundation

- Set up the project
- Create the database
- Implement the single admin login
- Create certification settings
- Build enquiry and company management

### Stage 2 - Certificate Workflow

- Create certificate records
- Build the draft certificate template
- Generate draft PDFs
- Add draft approval statuses
- Calculate surveillance and expiry dates
- Generate unique certificate numbers

### Stage 3 - Final Certificate

- Generate final certificate PDFs
- Add certificate preview and download
- Add print tracking
- Generate QR codes
- Build public certificate verification

### Stage 4 - Marketing Website

- Build public pages
- Add the enquiry form
- Connect enquiries to the admin panel
- Add certification pages
- Add contact and legal pages

### Stage 5 - Migration and Launch

- Clean the existing workbook data
- Import historical certificates
- Test certificate numbering and dates
- Test PDF printing
- Test mobile and desktop layouts
- Configure backups
- Deploy the application

## 18. Out of Scope for the MVP

The first version will not include:

- Multiple admin roles
- Auditor accounts
- Audit planning or audit reports
- Technical review workflows
- Finance or accounting modules
- Quotations or invoices
- Customer login
- Associate login
- Online payments
- Automatic WhatsApp messages
- Complex multi-level approvals

These features should only be added later if they become necessary.

## 19. MVP Completion Criteria

The MVP is complete when the administrator can:

1. Receive or create an enquiry.
2. Select a certification.
3. Enter company, address, scope, and contact details.
4. Generate a draft certificate PDF.
5. Record approval or requested changes.
6. Enter an issue date.
7. Generate surveillance dates, expiry date, and a unique certificate number.
8. Generate the final certificate PDF.
9. Download and print the certificate.
10. Verify the certificate through its public QR-code page.
11. View upcoming surveillance and expiry dates.
