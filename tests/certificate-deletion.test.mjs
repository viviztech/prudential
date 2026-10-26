import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createWorkflowTestDatabase, workflowTestUrl } from "./helpers/workflow-test-db.mjs";

test("admin certificate deletion retains numbering reservations and document history", { skip: !workflowTestUrl }, async (t) => {
  const isolated = await createWorkflowTestDatabase();
  const { sql } = isolated;
  try {
    const { database } = await import("../db/postgres.ts");
    const { deleteCertificateInDatabase: remove } = await import("../db/certificate-deletion.ts");
    const { allocateCertificateNumber } = await import("../lib/certificate-numbering.ts");
    const runtime = await import("../db/runtime.ts");
    const actor = { id: randomUUID(), name: "Deletion admin", email: "deletion-admin@example.com", role: "admin", active: 1 };
    await sql`INSERT INTO admin_users (id, name, email, role, password_hash, active, created_at)
      VALUES (${actor.id}, ${actor.name}, ${actor.email}, ${actor.role}, 'unused', 1, '2026-10-01')`;
    const [standard] = await sql`SELECT id FROM certifications WHERE code = '9001'`;
    const fixture = async ({ number = null, status = number ? "printed" : "draft_created", companyId } = {}) => {
      companyId ??= randomUUID();
      await sql`INSERT INTO companies (id, name, address, contact_person, mobile, email, created_at)
        VALUES (${companyId}, 'Deletion fixture', '10 Test Road', 'Test contact', '9000000000', NULL, '2026-10-01')
        ON CONFLICT (id) DO NOTHING`;
      const id = randomUUID();
      await sql`INSERT INTO certificates
        (id, company_id, certification_id, scope, status, certificate_number, final_output_count,
         draft_date, draft_sent_at, approval_date, issue_date, first_surveillance_date,
         second_surveillance_date, expiry_date, printed_at,
         application_checked, legal_checked, continuity_checked, documentation_checked, created_at)
        VALUES (${id}, ${companyId}, ${standard.id}, 'Deletion fixture scope', ${status}, ${number}, ${number ? 3 : 0},
          '2026-10-01', '2026-10-02T10:00:00Z', '2026-10-03', ${number ? "2026-10-04" : null},
          ${number ? "2027-10-04" : null}, ${number ? "2028-10-04" : null}, ${number ? "2029-10-04" : null},
          ${number ? "2026-10-04T10:00:00Z" : null}, 1, 1, 1, 1, '2026-10-01')`;
      return { id, companyId, number };
    };
    const raw = async (id) => (await sql`SELECT * FROM certificates WHERE id = ${id}`)[0];
    const reserve = (standard, date) => database.transaction((transaction) => allocateCertificateNumber(transaction, standard, date));
    const pasqm = { certification_code: "9001", certificate_prefix: "PASQM" };

    await t.test("only active administrators can delete, including already deleted records", async () => {
      const certificate = await fixture();
      const before = await raw(certificate.id);
      for (const role of ["operator", "reviewer", "viewer"]) {
        await assert.rejects(remove(database, certificate.id, { ...actor, role }), /active admin/);
      }
      for (const invalid of [{ ...actor, active: 0 }, { ...actor, id: "" }]) {
        await assert.rejects(remove(database, certificate.id, invalid), /active admin/);
      }
      assert.deepEqual(await raw(certificate.id), before);
      await remove(database, certificate.id, actor);
      await assert.rejects(remove(database, certificate.id, { ...actor, role: "operator" }), /active admin/);
    });

    await t.test("deleting drafts and finals preserves all original metadata and sibling company records", async () => {
      for (const number of [null, "DELETE-FIXTURE-FINAL"]) {
        const certificate = await fixture({ number });
        const sibling = await fixture({ companyId: certificate.companyId });
        const before = await raw(certificate.id);
        const siblingBefore = await raw(sibling.id);
        const [companyBefore] = await sql`SELECT * FROM companies WHERE id = ${certificate.companyId}`;
        const countersBefore = await sql`SELECT * FROM certificate_counters ORDER BY counter_key`;
        await remove(database, certificate.id, actor);
        const after = await raw(certificate.id);
        assert.ok(after.deleted_at);
        assert.equal(after.deleted_by, actor.id);
        assert.deepEqual(after, { ...before, deleted_at: after.deleted_at, deleted_by: actor.id });
        assert.deepEqual(await raw(sibling.id), siblingBefore);
        assert.deepEqual((await sql`SELECT * FROM companies WHERE id = ${certificate.companyId}`)[0], companyBefore);
        assert.deepEqual(await sql`SELECT * FROM certificate_counters ORDER BY counter_key`, countersBefore);
        assert.equal(await runtime.getCertificate(certificate.id), null);
        if (number) assert.equal(await runtime.findCertificateByNumber(number), null);
        assert.ok(!(await runtime.listCertificates()).some((record) => record.id === certificate.id));
        assert.ok(!(await runtime.listCompanyCertificates(certificate.companyId)).some((record) => record.id === certificate.id));
        assert.ok((await runtime.listCompanyCertificates(certificate.companyId)).some((record) => record.id === sibling.id));
        await remove(database, certificate.id, actor);
        assert.deepEqual(await raw(certificate.id), after);
      }
    });

    await t.test("deletion retains snapshots, legacy source keys, output requests and single-use tickets", async () => {
      const certificate = await fixture({ number: "DELETE-HISTORY-FINAL" });
      await sql`INSERT INTO certificate_details_snapshots
        (certificate_id, company_name, address, contact_person, mobile, email, scope, created_at)
        VALUES (${certificate.id}, 'Issued company', 'Issued address', 'Issued contact', '9000000000', NULL, 'Issued scope', '2026-10-04')`;
      await sql`INSERT INTO certificate_legacy (certificate_id, source_sheet, source_row)
        VALUES (${certificate.id}, 'delete-test-source', 1)`;
      const requestId = randomUUID();
      await sql`INSERT INTO certificate_output_requests (id, certificate_id, requested_by, status, requested_at)
        VALUES (${requestId}, ${certificate.id}, ${actor.id}, 'approved', '2026-10-05')`;
      await sql`INSERT INTO certificate_output_tickets
        (id, certificate_id, user_id, token_hash, mode, created_at, expires_at, request_id)
        VALUES (${randomUUID()}, ${certificate.id}, ${actor.id}, ${randomUUID()}, 'download', '2026-10-05', '2026-10-06', ${requestId})`;
      const tables = ["certificate_details_snapshots", "certificate_legacy", "certificate_output_requests", "certificate_output_tickets"];
      const before = await Promise.all(tables.map((table) => sql.unsafe(`SELECT * FROM ${table} WHERE certificate_id = $1`, [certificate.id])));
      await remove(database, certificate.id, actor);
      for (const [index, table] of tables.entries()) {
        assert.deepEqual(await sql.unsafe(`SELECT * FROM ${table} WHERE certificate_id = $1`, [certificate.id]), before[index]);
      }
    });

    await t.test("highest imported PASQM serial remains reserved without a counter and continues across months", async () => {
      await sql`DELETE FROM certificate_counters WHERE counter_key = 'certificate-number:PASQM'`;
      const certificate = await fixture({ number: "PASQM26100120" });
      await remove(database, certificate.id, actor);
      assert.equal(await reserve(pasqm, "2026-10-26"), "PASQM26100121");
      assert.equal(await reserve(pasqm, "2026-11-01"), "PASQM26110122");
      assert.equal(await reserve(pasqm, "2027-01-01"), "PASQM27010123");
    });

    await t.test("deleting every assigned record cannot rewind existing counters", async () => {
      const number = await reserve(pasqm, "2026-10-26");
      const certificate = await fixture({ number });
      await remove(database, certificate.id, actor);
      const next = await reserve(pasqm, "2026-11-01");
      assert.equal(Number(next.slice(-4)), Number(number.slice(-4)) + 1);
      assert.notEqual(next, number);
    });

    await t.test("deleted numbers reserve monthly and global standards while keeping their existing policies", async () => {
      const monthly = { certification_code: "14001", certificate_prefix: "PASEM" };
      const deletedMonthly = await fixture({ number: "PASEM26100007" });
      await remove(database, deletedMonthly.id, actor);
      assert.equal(await reserve(monthly, "2026-10-26"), "PASEM26100008");
      assert.equal(await reserve(monthly, "2026-11-01"), "PASEM26110001");
      for (const code of ["20001", "17024"]) {
        const global = { certification_code: code, certificate_prefix: `PAS${code}` };
        const certificate = await fixture({ number: `${global.certificate_prefix}000000007` });
        await remove(database, certificate.id, actor);
        assert.equal(await reserve(global, "2026-10-26"), `${global.certificate_prefix}000000008`);
        assert.equal(await reserve(global, "2026-11-01"), `${global.certificate_prefix}000000009`);
      }
    });

    await t.test("concurrent deletion and allocation cannot reuse the deleted highest number", async () => {
      const certificate = await fixture({ number: "PASQM26100500" });
      const [, number] = await Promise.all([
        remove(database, certificate.id, actor),
        reserve(pasqm, "2026-11-01"),
      ]);
      assert.equal(number, "PASQM26110501");
      assert.ok((await raw(certificate.id)).deleted_at);
      assert.equal(await reserve(pasqm, "2026-12-01"), "PASQM26120502");
    });

    await t.test("a failed deletion transaction rolls back its tombstone without touching numbering", async () => {
      const certificate = await fixture({ number: "DELETE-ROLLBACK-FINAL" });
      const before = await raw(certificate.id);
      const countersBefore = await sql`SELECT * FROM certificate_counters ORDER BY counter_key`;
      const failingDatabase = {
        ...database,
        transaction(work) {
          return database.transaction(async (transaction) => {
            await work(transaction);
            throw new Error("simulated deletion rollback");
          });
        },
      };
      await assert.rejects(remove(failingDatabase, certificate.id, actor), /simulated deletion rollback/);
      assert.deepEqual(await raw(certificate.id), before);
      assert.deepEqual(await sql`SELECT * FROM certificate_counters ORDER BY counter_key`, countersBefore);
      await assert.rejects(remove(database, randomUUID(), actor), /not found/);
    });

    await t.test("dashboard counts exclude deleted waiting, approved and current-month issued records", async () => {
      const baseline = await runtime.getDashboardCounts();
      const waiting = await fixture({ status: "waiting_approval" });
      const approved = await fixture({ status: "approved" });
      const issued = await fixture({ number: "DELETE-DASHBOARD-FINAL" });
      const currentMonth = new Date().toISOString().slice(0, 7);
      await sql`UPDATE certificates SET issue_date = ${`${currentMonth}-01`} WHERE id = ${issued.id}`;
      assert.deepEqual(await runtime.getDashboardCounts(), {
        ...baseline, waiting: baseline.waiting + 1, printing: baseline.printing + 1, issued: baseline.issued + 1,
      });
      for (const certificate of [waiting, approved, issued]) await remove(database, certificate.id, actor);
      assert.deepEqual(await runtime.getDashboardCounts(), baseline);
    });

    await t.test("legacy statistics exclude deleted records and reimport cannot restore them", async () => {
      const baseline = await runtime.getLegacyImportStats();
      const source = `deletion-test-${randomUUID()}`;
      const records = [true, false].map((issued, index) => ({
        source_sheet: source, source_row: index + 1, certificate_id: randomUUID(), company_id: randomUUID(),
        company_name: `Deletion legacy ${index}`, address: "Legacy test address", scope: `Legacy scope ${index}`,
        contact_person: "Test contact", mobile: "9000000000", email: null, associate_name: "",
        standard_code: "9001", standard_name: "ISO 9001", certificate_prefix: "PASQM", original_standard: "ISO 9001",
        certificate_number: issued ? `DELETION-LEGACY-${randomUUID()}` : null, legacy_certificate_number: null,
        status: issued ? "issued" : "draft_created", printed: issued, delivered: issued, activated: issued,
        application_date: null, draft_date: null, issue_date: issued ? "2026-10-01" : null,
        first_surveillance_date: null, second_surveillance_date: null, third_surveillance_date: null, expiry_date: null,
      }));
      assert.equal((await runtime.importLegacyCertificates(records)).added, 2);
      assert.deepEqual(await runtime.getLegacyImportStats(), {
        records: baseline.records + 2, review: baseline.review + 1, companies: baseline.companies + 2,
      });
      await remove(database, records[0].certificate_id, actor);
      assert.deepEqual(await runtime.getLegacyImportStats(), {
        records: baseline.records + 1, review: baseline.review + 1, companies: baseline.companies + 1,
      });
      await remove(database, records[1].certificate_id, actor);
      assert.deepEqual(await runtime.getLegacyImportStats(), baseline);
      const before = await Promise.all(records.map((record) => raw(record.certificate_id)));
      assert.equal((await runtime.importLegacyCertificates(records)).added, 0);
      assert.deepEqual(await Promise.all(records.map((record) => raw(record.certificate_id))), before);
      assert.deepEqual(await runtime.getLegacyImportStats(), baseline);
      for (const record of records) {
        assert.equal(await runtime.getCertificate(record.certificate_id), null);
        if (record.certificate_number) assert.equal(await runtime.findCertificateByNumber(record.certificate_number), null);
        assert.ok(!(await runtime.listCertificates({ query: record.company_name })).some((certificate) => certificate.id === record.certificate_id));
      }
    });
  } finally {
    await isolated.dispose();
  }
});
