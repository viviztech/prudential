import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createWorkflowTestDatabase, workflowTestUrl } from "./helpers/workflow-test-db.mjs";

test("certificate detail edits, snapshots, finalization and database migration", { skip: !workflowTestUrl }, async (t) => {
  const isolated = await createWorkflowTestDatabase();
  const { sql } = isolated;
  try {
    const { database } = await import("../db/postgres.ts");
    const {
      CERTIFICATE_DETAILS_MIGRATIONS,
      updateCertificateDetailsInDatabase: edit,
      setCertificateStatusInDatabase: transition,
    } = await import("../db/certificate-details.ts");
    const runtime = await import("../db/runtime.ts");
    const actor = { id: "test-operator", role: "operator" };
    const admin = { id: "test-admin", role: "admin" };
    const original = {
      companyName: "Original Company", address: "10 Original Road", contactPerson: "Original Contact",
      mobile: "+919876543210", email: "original@example.com",
    };
    const [standard] = await sql`SELECT id FROM certifications WHERE code = '9001'`;
    const fixture = async (statuses = ["approved"], email = original.email) => {
      const companyId = randomUUID();
      await sql`INSERT INTO companies (id, name, address, contact_person, mobile, email, created_at)
        VALUES (${companyId}, ${original.companyName}, ${original.address}, ${original.contactPerson},
          ${original.mobile}, ${email}, ${new Date().toISOString()})`;
      const certificates = [];
      for (const [index, status] of statuses.entries()) {
        const id = randomUUID();
        const scope = `Original scope ${index}`;
        const number = ["issued", "printed"].includes(status) ? `TEST-${randomUUID()}` : null;
        await sql`INSERT INTO certificates
          (id, company_id, certification_id, scope, status, certificate_number, final_output_count,
           draft_date, draft_sent_at, approval_date, issue_date, first_surveillance_date,
           second_surveillance_date, third_surveillance_date, expiry_date, printed_at,
           application_checked, legal_checked, continuity_checked, documentation_checked, created_at)
          VALUES (${id}, ${companyId}, ${standard.id}, ${scope}, ${status}, ${number}, ${number ? 1 : 0},
            '2026-10-01', '2026-10-02T10:00:00Z', '2026-10-03', ${number ? "2025-02-01" : null},
            ${number ? "2026-02-01" : null}, ${number ? "2027-02-01" : null}, ${number ? "2028-02-01" : null},
            ${number ? "2028-02-01" : null}, ${number ? "2025-02-01T10:00:00Z" : null},
            1, 1, 1, 1, ${new Date().toISOString()})`;
        certificates.push({ id, scope, number, status });
      }
      return { companyId, certificates };
    };
    const details = (certificate, overrides = {}) => ({ ...original, scope: certificate.scope, ...overrides });
    const raw = async (id) => (await sql`SELECT * FROM certificates WHERE id = ${id}`)[0];
    const assertReset = (certificate) => {
      assert.equal(certificate.status, "draft_created");
      assert.equal(certificate.draft_date, null);
      assert.equal(certificate.draft_sent_at, null);
      assert.equal(certificate.approval_date, null);
      assert.deepEqual([certificate.application_checked, certificate.legal_checked,
        certificate.continuity_checked, certificate.documentation_checked], [1, 1, 1, 1]);
    };

    await t.test("backfills output counts and issued detail snapshots when upgrading an old table", async () => {
      const { certificates } = await fixture(["issued", "printed", "draft_created"], null);
      await sql.unsafe("ALTER TABLE certificates DROP COLUMN final_output_count");
      await database.batch(CERTIFICATE_DETAILS_MIGRATIONS.map((statement) => database.prepare(statement)));
      assert.equal((await raw(certificates[0].id)).final_output_count, 1);
      assert.equal((await raw(certificates[1].id)).final_output_count, 1);
      assert.equal((await raw(certificates[2].id)).final_output_count, 0);
      const [column] = await sql`SELECT is_nullable, column_default FROM information_schema.columns
        WHERE table_name = 'certificates' AND column_name = 'final_output_count'`;
      assert.equal(column.is_nullable, "NO");
      assert.equal(column.column_default, "0");
      const snapshots = await sql`SELECT * FROM certificate_details_snapshots
        WHERE certificate_id IN (${certificates[0].id}, ${certificates[1].id})`;
      assert.equal(snapshots.length, 2);
      assert.equal(snapshots[0].email, null);
      // Re-running the upgrade must preserve a newly issued certificate's unused output.
      await sql`UPDATE certificates SET final_output_count = 0 WHERE id = ${certificates[0].id}`;
      await database.batch(CERTIFICATE_DETAILS_MIGRATIONS.map((statement) => database.prepare(statement)));
      assert.equal((await raw(certificates[0].id)).final_output_count, 0);
    });

    await t.test("allows edits at every pre-final stage and retains the document checklist", async () => {
      for (const status of ["draft_created", "changes_requested", "waiting_approval", "approved"]) {
        const { certificates: [certificate] } = await fixture([status]);
        await edit(database, certificate.id, actor, details(certificate, { scope: `Updated ${status}` }));
        const updated = await raw(certificate.id);
        assertReset(updated);
        assert.equal(updated.scope, `Updated ${status}`);
      }
    });

    await t.test("scope edits reset only the selected certificate and a no-op preserves approval", async () => {
      const { certificates: [current, sibling] } = await fixture(["approved", "waiting_approval"]);
      await edit(database, current.id, actor, details(current));
      assert.equal((await raw(current.id)).status, "approved");
      await edit(database, current.id, actor, details(current, { scope: "Revised current scope" }));
      assertReset(await raw(current.id));
      assert.equal((await raw(sibling.id)).status, "waiting_approval");
      assert.equal((await raw(sibling.id)).scope, sibling.scope);
    });

    await t.test("company edits reset unissued siblings while preserving all issued details, including null email", async () => {
      const { certificates: [current, sibling, printed, issued] } = await fixture(
        ["approved", "waiting_approval", "printed", "issued"], null,
      );
      await edit(database, current.id, actor, details(current, {
        companyName: "Changed Company", address: "20 Changed Road", contactPerson: "Changed Contact",
        mobile: "+919000000000", email: "changed@example.com", scope: "Changed current scope",
      }));
      assertReset(await raw(current.id));
      assertReset(await raw(sibling.id));
      const unissued = await runtime.getCertificate(sibling.id);
      assert.equal(unissued.company_name, "Changed Company");
      assert.equal(unissued.scope, sibling.scope);
      for (const final of [printed, issued]) {
        const preserved = await runtime.getCertificate(final.id);
        assert.equal(preserved.company_name, original.companyName);
        assert.equal(preserved.address, original.address);
        assert.equal(preserved.contact_person, original.contactPerson);
        assert.equal(preserved.mobile, original.mobile);
        assert.equal(preserved.email, null);
        assert.equal(preserved.scope, final.scope);
        assert.equal(preserved.status, final.status);
        assert.equal(preserved.certificate_number, final.number);
      }
      const matches = await runtime.listCertificates({ query: original.companyName });
      assert.ok(matches.some((certificate) => certificate.id === printed.id));
      assert.ok(!matches.some((certificate) => certificate.id === current.id));
    });

    await t.test("rejects finalized edits for every non-admin role", async () => {
      const { companyId, certificates } = await fixture(["printed", "issued"]);
      for (const certificate of certificates) {
        const before = await raw(certificate.id);
        for (const role of ["operator", "reviewer", "viewer"]) {
          await assert.rejects(edit(database, certificate.id, { id: `test-${role}`, role },
            details(certificate, { companyName: "Forbidden change" })), /Finalized certificate|permission/);
        }
        assert.deepEqual(await raw(certificate.id), before);
      }
      const [company] = await sql`SELECT name FROM companies WHERE id = ${companyId}`;
      assert.equal(company.name, original.companyName);
    });

    await t.test("admins correct only the selected finalized document and preserve workflow, dates and copy approvals", async () => {
      for (const status of ["printed", "issued"]) {
        const { companyId, certificates: [certificate, sibling, draft] } = await fixture([status, "printed", "approved"]);
        const before = await raw(certificate.id);
        const siblingBefore = await runtime.getCertificate(sibling.id);
        const draftBefore = await runtime.getCertificate(draft.id);
        const [companyBefore] = await sql`SELECT * FROM companies WHERE id = ${companyId}`;
        const userId = randomUUID();
        await sql`INSERT INTO admin_users (id, name, email, role, password_hash, created_at)
          VALUES (${userId}, 'Output operator', ${`${userId}@example.com`}, 'operator', 'unused', '2026-10-01')`;
        const requestId = randomUUID();
        await sql`INSERT INTO certificate_output_requests
          (id, certificate_id, requested_by, status, requested_at)
          VALUES (${requestId}, ${certificate.id}, ${userId}, 'approved', '2026-10-03')`;
        const [requestBefore] = await sql`SELECT * FROM certificate_output_requests WHERE id = ${requestId}`;
        const corrected = details(certificate, {
          companyName: `Corrected ${status} Company`, address: "20 Corrected Road", scope: "Corrected final scope",
          contactPerson: "Corrected Contact", mobile: "+919000000000", email: "",
        });
        await edit(database, certificate.id, admin, corrected);
        assert.deepEqual(await raw(certificate.id), { ...before, scope: corrected.scope });
        assert.deepEqual(await runtime.getCertificate(sibling.id), siblingBefore);
        assert.deepEqual(await runtime.getCertificate(draft.id), draftBefore);
        assert.deepEqual((await sql`SELECT * FROM companies WHERE id = ${companyId}`)[0], companyBefore);
        assert.deepEqual((await sql`SELECT * FROM certificate_output_requests WHERE id = ${requestId}`)[0], requestBefore);
        for (const record of [await runtime.getCertificate(certificate.id), await runtime.findCertificateByNumber(certificate.number)]) {
          assert.equal(record.company_name, corrected.companyName);
          assert.equal(record.address, corrected.address);
          assert.equal(record.scope, corrected.scope);
          assert.equal(record.contact_person, corrected.contactPerson);
          assert.equal(record.mobile, corrected.mobile);
          assert.equal(record.email, null);
          assert.equal(record.certificate_number, before.certificate_number);
          assert.equal(record.final_output_count, before.final_output_count);
        }
        const matches = await runtime.listCertificates({ query: corrected.companyName });
        assert.ok(matches.some((record) => record.id === certificate.id));
        assert.ok(!matches.some((record) => record.id === sibling.id || record.id === draft.id));
      }
    });

    await t.test("admin corrections use their snapshot after shared draft details diverge, including a null email", async () => {
      const { certificates: [certificate, draft] } = await fixture(["printed", "approved"], null);
      const corrected = details(certificate, { address: "Selected final address", email: "" });
      await edit(database, certificate.id, admin, corrected);
      await edit(database, draft.id, actor, details(draft, {
        companyName: "New draft company", address: "New draft address", email: "draft@example.com",
      }));
      const before = await runtime.getCertificate(certificate.id);
      const noMutationDatabase = {
        ...database,
        transaction(work) {
          return database.transaction((transaction) => work({
            prepare(statement) {
              const query = transaction.prepare(statement);
              query.run = async () => { throw new Error("no-op must not mutate"); };
              return query;
            },
          }));
        },
      };
      await edit(noMutationDatabase, certificate.id, admin, corrected);
      assert.deepEqual(await runtime.getCertificate(certificate.id), before);
      await edit(database, certificate.id, admin, { ...corrected, scope: "Second correction" });
      const updated = await runtime.getCertificate(certificate.id);
      assert.equal(updated.company_name, original.companyName);
      assert.equal(updated.address, corrected.address);
      assert.equal(updated.email, null);
      assert.equal(updated.scope, "Second correction");
      assert.equal((await runtime.getCertificate(draft.id)).company_name, "New draft company");
    });

    await t.test("finalized admin corrections validate fields and roll back the snapshot if the scope update fails", async () => {
      const { certificates: [certificate] } = await fixture(["printed"]);
      await edit(database, certificate.id, admin, details(certificate, { address: "Prior correction" }));
      const before = await raw(certificate.id);
      const [snapshotBefore] = await sql`SELECT * FROM certificate_details_snapshots WHERE certificate_id = ${certificate.id}`;
      await assert.rejects(edit(database, certificate.id, admin, details(certificate, { scope: " " })), /Complete/);
      const failingDatabase = {
        ...database,
        transaction(work) {
          return database.transaction((transaction) => work({
            prepare(statement) {
              const query = transaction.prepare(statement);
              if (statement.startsWith("UPDATE certificates SET scope")) {
                query.run = async () => { throw new Error("simulated correction failure"); };
              }
              return query;
            },
          }));
        },
      };
      await assert.rejects(edit(failingDatabase, certificate.id, admin,
        details(certificate, { companyName: "Failed correction", scope: "Failed scope" })), /simulated correction/);
      assert.deepEqual(await raw(certificate.id), before);
      assert.deepEqual((await sql`SELECT * FROM certificate_details_snapshots WHERE certificate_id = ${certificate.id}`)[0], snapshotBefore);
    });

    await t.test("concurrent admin corrections and draft edits preserve each certificate's intended details", async () => {
      const { certificates: [certificate, draft] } = await fixture(["printed", "approved"]);
      await Promise.all([
        edit(database, certificate.id, admin, details(certificate, { companyName: "Corrected final", scope: "Final scope" })),
        edit(database, draft.id, actor, details(draft, { companyName: "Updated draft", scope: "Draft scope" })),
      ]);
      const final = await runtime.getCertificate(certificate.id);
      const updatedDraft = await runtime.getCertificate(draft.id);
      assert.equal(final.company_name, "Corrected final");
      assert.equal(final.scope, "Final scope");
      assert.equal(final.status, "printed");
      assert.equal(final.certificate_number, certificate.number);
      assert.equal(final.final_output_count, 1);
      assert.equal(updatedDraft.company_name, "Updated draft");
      assert.equal(updatedDraft.scope, "Draft scope");
      assertReset(updatedDraft);
    });

    await t.test("enforces role and field validation while allowing a blank legacy email", async () => {
      const { certificates: [certificate] } = await fixture(["approved"], null);
      for (const role of ["reviewer", "viewer"]) {
        await assert.rejects(edit(database, certificate.id, { id: `test-${role}`, role }, details(certificate)), /permission/);
      }
      for (const overrides of [{ companyName: "x".repeat(201) }, { address: "x".repeat(2001) },
        { scope: "x".repeat(3001) }, { contactPerson: "x".repeat(201) }, { mobile: "x".repeat(41) },
        { email: `${"x".repeat(250)}@a.co` }, { address: " " }, { email: "invalid-email" }]) {
        await assert.rejects(edit(database, certificate.id, actor, details(certificate, overrides)));
      }
      await edit(database, certificate.id, actor, details(certificate, { email: "", address: "Updated legacy address" }));
      assert.equal((await runtime.getCertificate(certificate.id)).email, null);
    });

    await t.test("requires the revised draft to be sent and approved before atomic finalization", async () => {
      const { certificates: [certificate] } = await fixture();
      await edit(database, certificate.id, actor, details(certificate, { scope: "Approved revised scope" }));
      await assert.rejects(transition(database, certificate.id, "print", "2026-10-26"), /Unsupported/);
      await assert.rejects(transition(database, certificate.id, "approve"), /not awaiting/);
      await transition(database, certificate.id, "draft");
      await transition(database, certificate.id, "waiting_approval");
      await transition(database, certificate.id, "approve");
      await transition(database, certificate.id, "print", "2026-10-26");
      const final = await runtime.getCertificate(certificate.id);
      assert.equal(final.status, "printed");
      assert.match(final.certificate_number, /^PASQM2610[0-9]{4}$/);
      assert.equal(final.scope, "Approved revised scope");
      assert.equal(final.issue_date, "2026-10-26");
      assert.equal(final.first_surveillance_date, "2027-10-26");
      assert.equal(final.second_surveillance_date, "2028-10-26");
      assert.equal(final.expiry_date, "2029-10-26");
      assert.equal(final.final_output_count, 0);
      const before = await raw(certificate.id);
      await assert.rejects(transition(database, certificate.id, "print", "2027-01-01"), /Finalized/);
      assert.deepEqual(await raw(certificate.id), before);
      const [snapshot] = await sql`SELECT * FROM certificate_details_snapshots WHERE certificate_id = ${certificate.id}`;
      assert.equal(snapshot.scope, "Approved revised scope");
    });

    await t.test("marking a legacy issued copy printed preserves its number and every existing issue date", async () => {
      const { certificates: [certificate] } = await fixture(["issued"]);
      const before = await raw(certificate.id);
      await transition(database, certificate.id, "print", "2030-01-01");
      const after = await raw(certificate.id);
      assert.equal(after.status, "printed");
      for (const key of ["certificate_number", "issue_date", "first_surveillance_date", "second_surveillance_date",
        "third_surveillance_date", "expiry_date", "printed_at", "final_output_count"]) {
        assert.equal(after[key], before[key], key);
      }
    });

    await t.test("rolls back the number and snapshot if final record assignment fails", async () => {
      const { certificates: [certificate] } = await fixture();
      const before = await sql`SELECT * FROM certificate_counters WHERE counter_key = 'certificate-number:PASQM'`;
      const failingDatabase = {
        ...database,
        transaction(work) {
          return database.transaction((transaction) => work({
            prepare(statement) {
              const query = transaction.prepare(statement);
              if (statement.includes("certificate_number = ?")) {
                query.run = async () => { throw new Error("simulated assignment failure"); };
              }
              return query;
            },
          }));
        },
      };
      await assert.rejects(transition(failingDatabase, certificate.id, "print", "2026-10-26"), /simulated/);
      assert.deepEqual(await sql`SELECT * FROM certificate_counters WHERE counter_key = 'certificate-number:PASQM'`, before);
      assert.equal((await raw(certificate.id)).status, "approved");
      assert.equal((await raw(certificate.id)).certificate_number, null);
      assert.equal((await sql`SELECT * FROM certificate_details_snapshots WHERE certificate_id = ${certificate.id}`).length, 0);
    });

    await t.test("serializes concurrent edits and issuance without approving stale details", async () => {
      for (let attempt = 0; attempt < 4; attempt++) {
        const { certificates: [certificate] } = await fixture();
        const results = await Promise.allSettled([
          edit(database, certificate.id, actor, details(certificate, { scope: "Racing revised scope" })),
          transition(database, certificate.id, "print", "2026-10-26"),
        ]);
        assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
        const result = await runtime.getCertificate(certificate.id);
        if (result.status === "printed") {
          assert.equal(result.scope, certificate.scope);
          assert.ok(result.certificate_number);
        } else {
          assertReset(result);
          assert.equal(result.scope, "Racing revised scope");
          assert.equal(result.certificate_number, null);
        }
      }
    });

    await t.test("concurrent finalizations assign exactly one number and snapshot", async () => {
      const { certificates: [certificate] } = await fixture();
      const [before] = await sql`SELECT last_value FROM certificate_counters WHERE counter_key = 'certificate-number:PASQM'`;
      const results = await Promise.allSettled([
        transition(database, certificate.id, "print", "2026-10-26"),
        transition(database, certificate.id, "print", "2026-11-01"),
      ]);
      assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
      const [after] = await sql`SELECT last_value FROM certificate_counters WHERE counter_key = 'certificate-number:PASQM'`;
      assert.equal(after.last_value, before.last_value + 1);
      assert.equal((await sql`SELECT * FROM certificate_details_snapshots WHERE certificate_id = ${certificate.id}`).length, 1);
    });

    await t.test("new legacy imports explicitly mark existing finals used and snapshot their original details", async () => {
      const source = `workflow-test-${randomUUID()}`;
      const records = [true, false].map((issued, index) => ({
        source_sheet: source, source_row: index + 1, certificate_id: randomUUID(), company_id: randomUUID(),
        company_name: `Legacy company ${index}`, address: "Legacy address", scope: `Legacy scope ${index}`,
        contact_person: "Legacy contact", mobile: "Not recorded", email: null, associate_name: "",
        standard_code: "9001", standard_name: "ISO 9001", certificate_prefix: "PASQM", original_standard: "ISO 9001",
        certificate_number: issued ? `IMPORTED-${randomUUID()}` : null, legacy_certificate_number: null,
        status: issued ? "issued" : "draft_created", printed: issued, delivered: issued, activated: issued,
        application_date: null, draft_date: null, issue_date: issued ? "2020-01-01" : null,
        first_surveillance_date: null, second_surveillance_date: null, third_surveillance_date: null, expiry_date: null,
      }));
      await runtime.importLegacyCertificates(records);
      assert.equal((await raw(records[0].certificate_id)).final_output_count, 1);
      assert.equal((await raw(records[1].certificate_id)).final_output_count, 0);
      const [snapshot] = await sql`SELECT * FROM certificate_details_snapshots WHERE certificate_id = ${records[0].certificate_id}`;
      assert.equal(snapshot.company_name, records[0].company_name);
      assert.equal(snapshot.scope, records[0].scope);
      assert.equal((await sql`SELECT * FROM certificate_details_snapshots WHERE certificate_id = ${records[1].certificate_id}`).length, 0);
      await runtime.importLegacyCertificates([{ ...records[1], certificate_number: "IGNORED-REIMPORT", status: "issued" }]);
      assert.equal((await raw(records[1].certificate_id)).certificate_number, null);
      assert.equal((await sql`SELECT * FROM certificate_details_snapshots WHERE certificate_id = ${records[1].certificate_id}`).length, 0);
    });
  } finally {
    await isolated.dispose();
  }
});
