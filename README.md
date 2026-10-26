# Prudential ISO certificate workspace

A multi-user certificate workflow built with React 19, Vinext, Tailwind CSS 4, and PostgreSQL.

The public marketing site opens at `/`. Team members sign in at `/login` to reach the certificate workspace at `/admin`.

## Run locally

1. Start PostgreSQL. In this Windows workspace, run `npm.cmd run db:local:start`.
2. Put a working `DATABASE_URL` in `.env.local`.
3. Run `npm install` and `npm run dev`.
4. Open `http://localhost:3000/login`. If no users exist, create the first administrator account.

For production first-account setup, set a strong `ADMIN_SETUP_TOKEN` in the server environment. Remove it after setup. Every account has its own password and database session. Passwords are stored as salted PBKDF2-HMAC-SHA256 hashes.

Existing deployments with `ADMIN_PASSWORD` and `AUTH_SECRET` automatically create an initial administrator using the former password. If `ADMIN_EMAIL` is unset, sign in as `admin@prudentialiso.com`.

## Certificate workflow

1. Confirm the application, legal documents, business continuity proof, and documentation checklist. All four confirmations are required before creating certificate records.
2. Enter company details and select one or more standards. Each standard creates a certificate record.
3. Mark draft complete, draft sent, and draft confirmed. Operators, reviewers and admins can confirm a sent draft or request changes. Operators can manage the existing workflow stages until finalization; finalized records cannot be moved back to a draft stage.
4. Finalize the certificate. Its selected print date becomes the issue date. Surveillance dates are one and two years later; expiry is three years later. Finalization assigns the number and locks its details.
5. Open the first final PDF or print once. An operator must request admin approval for each additional copy. Admins review requests under **Download requests** and approve one additional copy for the requesting operator. Reprints retain the original number and dates.

Company name, address, contact details and scope can be edited from the certificate record before finalization, including after draft creation or confirmation. Saving changes sends affected drafts back for confirmation. Company changes update other unissued drafts for the same company; finalized certificates retain a snapshot of their issued details. Existing numbered certificates require approval for another operator copy after this update.

Final copies are delivered through a one-use app authorization. A PDF already saved by a user can still be retained or printed outside the app.

The dashboard shows workflow queues. Public verification remains at `/verify`.

ISO 9001 certificate numbers use `PASQMYYMMXXXX`, with `YYMM` taken from the issue date and a running four-digit serial that continues across months and years. The sequence resumes after `PASQM26100054`: the next October 2026 number is `PASQM26100055`, followed by serial `0056` even if the next issue date is in November.

Earlier PASQM series retain their numbers and do not override this continuation point. Higher serials already used or reserved from October 2026 onward, and values in the shared PASQM counter, take precedence so numbers cannot move backward. Backdated certificates also respect numbers already used or reserved in their selected issue month. Other standards retain their existing numbering rules.

## Certificate design templates

Admins configure each standard at `/admin/templates`. A template controls its standard name, heading, opening and conformity wording, scope label, clarification and footer, primary and accent colors, standard logo, and accreditation mark. The certificate preview uses sample company data; printed certificates use the company, scope, number, and dates from the actual record.

Admins can add a new standard at `/admin/templates/new` with a unique code and certificate number prefix. The app creates its editable design template at the same time. New standards appear in certificate creation, records, printing, and verification. Changing a template's standard name also updates the certificate selection and record name.

The organization logo and authorized signature are shared across standards and can be uploaded at `/admin/settings`. Artwork is stored in PostgreSQL. Printed certificates are composed from HTML and CSS without a background image. Drafts show a watermark; the signature and verification QR code appear after final copy print.

The template preview and each draft certificate preview include an A4 PDF download. Draft downloads retain their watermark and do not include a signature or verification QR code.

## Roles

| Role | Access |
| --- | --- |
| Admin | All workflow steps, certificate settings, and user management |
| Operator | Create records, complete checklists, prepare/send/confirm drafts, request changes, and finalize certificates; additional final copies require admin approval |
| Reviewer | Confirm drafts or request changes |
| Viewer | Read dashboards and certificate records |

Admins manage users at `/admin/users`. Every user can change their password at `/admin/profile`.

## Checks

```bash
npm run build
npm run lint
node --test tests/rendered-html.test.mjs tests/certificate-dates.test.mjs tests/http-redirect.test.mjs tests/certificate-numbering.test.mjs tests/certificate-details.test.mjs tests/certificate-outputs.test.mjs tests/certificate-permissions.test.mjs
```

Workflow database tests are opt-in through `CERTIFICATE_WORKFLOW_TEST_DATABASE_URL`, restricted to the local PostgreSQL server on port 55434. Run them with `--experimental-transform-types --import ./tests/helpers/register-typescript.mjs`; each suite creates and removes its own isolated schema without using application records.
