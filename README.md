# Prudential ISO certificate workspace

A multi-user certificate workflow built with React 19, Vinext, Tailwind CSS 4, and PostgreSQL.

## Run locally

1. Start PostgreSQL. In this Windows workspace, run `npm.cmd run db:local:start`.
2. Put a working `DATABASE_URL` in `.env.local`.
3. Run `npm install` and `npm run dev`.
4. Open `http://localhost:3000/login`. If no users exist, create the first administrator account.

For production first-account setup, set a strong `ADMIN_SETUP_TOKEN` in the server environment. Remove it after setup. Every account has its own password and database session. Passwords are stored as salted PBKDF2-HMAC-SHA256 hashes.

Existing deployments with `ADMIN_PASSWORD` and `AUTH_SECRET` automatically create an initial administrator using the former password. If `ADMIN_EMAIL` is unset, sign in as `admin@prudentialiso.com`.

## Certificate workflow

1. Record the application, legal documents, business continuity proof, and documentation checklist.
2. Enter company details and select one or more standards. Each standard creates a certificate record.
3. Mark draft complete, draft sent, and draft confirmed. A reviewer can request changes.
4. Print the final copy. Its print date becomes the issue date. Surveillance dates are one and two years later; expiry is three years later. The signature and verification QR code appear only on the final copy.

The dashboard shows workflow queues. Public verification remains at `/verify`.

## Certificate design templates

Admins configure each standard at `/admin/templates`. A template controls its standard name, heading, opening and conformity wording, scope label, clarification and footer, primary and accent colors, standard logo, and accreditation mark. The certificate preview uses sample company data; printed certificates use the company, scope, number, and dates from the actual record.

Admins can add a new standard at `/admin/templates/new` with a unique code and certificate number prefix. The app creates its editable design template at the same time. New standards appear in certificate creation, records, printing, and verification. Changing a template's standard name also updates the certificate selection and record name.

The organization logo and authorized signature are shared across standards and can be uploaded at `/admin/settings`. Artwork is stored in PostgreSQL. Printed certificates are composed from HTML and CSS without a background image. Drafts show a watermark; the signature and verification QR code appear after final copy print.

The template preview and each draft certificate preview include an A4 PDF download. Draft downloads retain their watermark and do not include a signature or verification QR code.

## Roles

| Role | Access |
| --- | --- |
| Admin | All workflow steps, certificate settings, and user management |
| Operator | Create records, complete checklists, prepare drafts, and print final copies |
| Reviewer | Confirm drafts or request changes |
| Viewer | Read dashboards and certificate records |

Admins manage users at `/admin/users`. Every user can change their password at `/admin/profile`.

## Checks

```bash
npm run build
npm run lint
node --test tests/rendered-html.test.mjs tests/certificate-dates.test.mjs tests/http-redirect.test.mjs
```
