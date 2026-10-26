import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import {
  certificateOutputCookieName,
  createCertificateOutputService,
} from "../db/certificate-outputs.ts";
import { createWorkflowTestDatabase, workflowTestUrl } from "./helpers/workflow-test-db.mjs";

const actor = (role) => ({ id: randomUUID(), role, name: role, email: `${role}@local.invalid`, active: 1 });

test("output roles are enforced by the service before any database access", async () => {
  const service = createCertificateOutputService({
    database: {
      prepare() { throw new Error("Unexpected database access"); },
      transaction() { throw new Error("Unexpected transaction"); },
    },
  });
  for (const role of ["reviewer", "viewer"]) {
    const user = actor(role);
    await assert.rejects(service.claimCertificateOutput("certificate", user, "print"), { code: "role" });
    await assert.rejects(service.requestCertificateOutput("certificate", user), { code: "role" });
    await assert.rejects(service.decideCertificateOutputRequest("certificate", "request", user, "approve"), { code: "role" });
    assert.equal(await service.consumeCertificateOutputTicket("certificate", user, "a".repeat(64)), null);
    assert.deepEqual(await service.listCertificateOutputRequests(user), []);
  }
  await assert.rejects(service.decideCertificateOutputRequest("certificate", "request", actor("operator"), "approve"), { code: "role" });
  await assert.rejects(service.claimCertificateOutput("certificate", { ...actor("admin"), active: 0 }, "print"), { code: "role" });
  assert.match(certificateOutputCookieName("certificate/with spaces"), /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/);
});

test("PostgreSQL final certificate output authorization and one-time tickets", {
  skip: !workflowTestUrl,
}, async (t) => {
  const isolated = await createWorkflowTestDatabase();
  const sql = isolated.sql;
  const { database } = await import("../db/postgres.ts");
  let clock = new Date("2026-10-26T06:00:00.000Z");
  const service = createCertificateOutputService({ database, now: () => clock });
  const admin = actor("admin");
  const operator = actor("operator");
  const another = { ...actor("operator"), email: "another-operator@local.invalid" };
  const reviewer = actor("reviewer");
  const viewer = actor("viewer");
  const companyId = randomUUID();
  let serial = 0;

  async function fixture({ count = 0, status = "printed", numbered = true } = {}) {
    const id = randomUUID();
    const number = numbered ? `OUTPUT-TEST-${++serial}` : null;
    await sql`INSERT INTO certificates
      (id,company_id,certification_id,scope,status,certificate_number,issue_date,
       printed_at,first_surveillance_date,second_surveillance_date,expiry_date,created_at,final_output_count)
      VALUES (${id},${companyId},(SELECT id FROM certifications WHERE code='9001'),'Test output scope',
        ${status},${number},'2026-10-26','2026-10-26T05:00:00.000Z','2027-10-26','2028-10-26','2029-10-26',
        '2026-10-26T05:00:00.000Z',${count})`;
    return id;
  }
  const countFor = async (id) => Number((await sql`SELECT final_output_count FROM certificates WHERE id=${id}`)[0].final_output_count);

  try {
    for (const user of [admin, operator, another, reviewer, viewer]) {
      await sql`INSERT INTO admin_users (id,name,email,role,password_hash,active,created_at)
        VALUES (${user.id},${user.name},${user.email},${user.role},'not-a-login-password',1,'2026-10-26T05:00:00.000Z')`;
    }
    await sql`INSERT INTO companies (id,name,address,contact_person,mobile,email,created_at)
      VALUES (${companyId},'Output authorization test','Test address','Test contact','9000000000',
        'output-test@local.invalid','2026-10-26T05:00:00.000Z')`;

    await t.test("only one concurrent first operator output is authorized", async () => {
      const id = await fixture();
      assert.equal((await service.getCertificateOutputAccess(id, operator)).canClaim, true);
      const claims = await Promise.allSettled(Array.from({ length: 12 }, () => service.claimCertificateOutput(id, operator, "print")));
      assert.equal(claims.filter((claim) => claim.status === "fulfilled").length, 1);
      assert.equal(claims.filter((claim) => claim.status === "rejected" && claim.reason.code === "approval").length, 11);
      assert.equal(await countFor(id), 1);
      const access = await service.getCertificateOutputAccess(id, operator);
      assert.equal(access.canClaim, false);
      assert.equal(access.canRequest, true);
      assert.equal(access.requiresApproval, true);
      const tickets = await sql`SELECT token_hash FROM certificate_output_tickets WHERE certificate_id=${id}`;
      assert.equal(tickets.length, 1);
      const rawTicket = claims.find((claim) => claim.status === "fulfilled").value.ticket;
      assert.match(rawTicket, /^[a-f0-9]{64}$/);
      assert.notEqual(tickets[0].token_hash, rawTicket);
    });

    await t.test("requests are idempotent and each approval permits exactly one repeat for its requester", async () => {
      const id = await fixture({ count: 1 });
      const requests = await Promise.all(Array.from({ length: 8 }, () => service.requestCertificateOutput(id, operator)));
      assert.equal(new Set(requests.map((request) => request.id)).size, 1);
      const request = requests[0];
      assert.equal((await service.getCertificateOutputAccess(id, operator)).request.status, "pending");
      assert.equal((await service.getCertificateOutputAccess(id, operator)).canRequest, false);
      await assert.rejects(service.decideCertificateOutputRequest(id, request.id, reviewer, "approve"), { code: "role" });
      await assert.rejects(service.claimCertificateOutput(id, operator, "download"), { code: "approval" });
      const decided = await service.decideCertificateOutputRequest(id, request.id, admin, "approve");
      assert.equal(decided.decided_by, admin.id);
      assert.equal((await service.getCertificateOutputAccess(id, operator)).canClaim, true);
      await assert.rejects(service.claimCertificateOutput(id, another, "download"), { code: "approval" });
      const claims = await Promise.allSettled(Array.from({ length: 6 }, () => service.claimCertificateOutput(id, operator, "download")));
      assert.equal(claims.filter((claim) => claim.status === "fulfilled").length, 1);
      assert.equal(await countFor(id), 2);
      const used = (await sql`SELECT * FROM certificate_output_requests WHERE id=${request.id}`)[0];
      assert.equal(used.status, "used");
      assert.ok(used.used_at);
      assert.equal((await service.getCertificateOutputAccess(id, operator)).canRequest, true);
      const replacement = await service.requestCertificateOutput(id, operator);
      assert.notEqual(replacement.id, request.id);
      await service.decideCertificateOutputRequest(id, replacement.id, admin, "reject");
      assert.equal((await sql`SELECT status FROM certificate_output_requests WHERE id=${replacement.id}`)[0].status, "rejected");
      await assert.rejects(service.claimCertificateOutput(id, operator, "download"), { code: "approval" });
    });

    await t.test("tickets are certificate/user-bound, expire after five minutes, and are consumed once atomically", async () => {
      const id = await fixture();
      const otherId = await fixture();
      const { ticket } = await service.claimCertificateOutput(id, operator, "download");
      assert.equal(await service.consumeCertificateOutputTicket(otherId, operator, ticket), null);
      assert.equal(await service.consumeCertificateOutputTicket(id, another, ticket), null);
      assert.equal(await service.consumeCertificateOutputTicket(id, reviewer, ticket), null);
      assert.equal(await service.consumeCertificateOutputTicket(id, operator, "f".repeat(64)), null);
      const consumed = await Promise.all(Array.from({ length: 8 }, () => service.consumeCertificateOutputTicket(id, operator, ticket)));
      assert.equal(consumed.filter(Boolean).length, 1);
      assert.equal(consumed.find(Boolean).mode, "download");
      assert.equal(await service.consumeCertificateOutputTicket(id, operator, ticket), null);
      const expiringId = await fixture();
      const expiring = await service.claimCertificateOutput(expiringId, operator, "print");
      clock = new Date(clock.getTime() + 300_000);
      assert.equal(await service.consumeCertificateOutputTicket(expiringId, operator, expiring.ticket), null);
      clock = new Date("2026-10-26T06:00:00.000Z");
    });

    await t.test("admins can produce audited repeats without changing certificate numbers or dates", async () => {
      const id = await fixture({ count: 5 });
      const before = (await sql`SELECT certificate_number,issue_date,printed_at,first_surveillance_date,second_surveillance_date,expiry_date FROM certificates WHERE id=${id}`)[0];
      const first = await service.claimCertificateOutput(id, admin, "download");
      const second = await service.claimCertificateOutput(id, admin, "print");
      assert.notEqual(first.ticket, second.ticket);
      assert.equal(await countFor(id), 7);
      assert.equal((await service.getCertificateOutputAccess(id, admin)).canClaim, true);
      const audit = await sql`SELECT user_id,mode,request_id FROM certificate_output_tickets WHERE certificate_id=${id}`;
      assert.equal(audit.length, 2);
      assert.ok(audit.every((ticket) => ticket.user_id === admin.id && ticket.request_id === null));
      const after = (await sql`SELECT certificate_number,issue_date,printed_at,first_surveillance_date,second_surveillance_date,expiry_date FROM certificates WHERE id=${id}`)[0];
      assert.deepEqual(after, before);
    });

    await t.test("historical printed certificates require approval and drafts/issued records cannot authorize final output", async () => {
      const historical = await fixture({ count: 1 });
      await assert.rejects(service.claimCertificateOutput(historical, operator, "print"), { code: "approval" });
      assert.equal((await service.getCertificateOutputAccess(historical, operator)).requiresApproval, true);
      for (const state of [{ status: "draft_created", numbered: false }, { status: "approved", numbered: false }, { status: "issued" }]) {
        const id = await fixture(state);
        assert.equal((await service.getCertificateOutputAccess(id, operator)).isFinal, false);
        await assert.rejects(service.claimCertificateOutput(id, operator, "print"), { code: "not_final" });
        await assert.rejects(service.claimCertificateOutput(id, admin, "print"), { code: "not_final" });
        await assert.rejects(service.requestCertificateOutput(id, operator), { code: "not_final" });
      }
      const id = await fixture();
      for (const user of [reviewer, viewer]) {
        assert.equal((await service.getCertificateOutputAccess(id, user)).canClaim, false);
        assert.equal((await service.getCertificateOutputAccess(id, user)).canRequest, false);
        await assert.rejects(service.claimCertificateOutput(id, user, "print"), { code: "role" });
      }
    });

    await t.test("deleted certificates hide their requests and reject existing tickets and approvals without side effects", async () => {
      const id = await fixture({ count: 1 });
      const approved = await service.requestCertificateOutput(id, operator);
      await service.decideCertificateOutputRequest(id, approved.id, admin, "approve");
      const pending = await service.requestCertificateOutput(id, another);
      const { ticket } = await service.claimCertificateOutput(id, admin, "download");
      await sql`UPDATE certificates SET deleted_at='2026-10-26T06:00:00.000Z', deleted_by=${admin.id} WHERE id=${id}`;
      const before = {
        certificate: (await sql`SELECT * FROM certificates WHERE id=${id}`)[0],
        requests: await sql`SELECT * FROM certificate_output_requests WHERE certificate_id=${id} ORDER BY id`,
        tickets: await sql`SELECT * FROM certificate_output_tickets WHERE certificate_id=${id} ORDER BY id`,
      };
      for (const user of [admin, operator, another]) {
        const access = await service.getCertificateOutputAccess(id, user);
        assert.equal(access.isFinal, false);
        assert.equal(access.canClaim, false);
        assert.equal(access.canRequest, false);
        assert.equal(access.requiresApproval, false);
        assert.equal(access.outputCount, 0);
        assert.equal(access.request, null);
        assert.deepEqual(await service.listCertificateOutputRequests(user, { certificateId: id }), []);
        await assert.rejects(service.claimCertificateOutput(id, user, "print"), { code: "not_found" });
      }
      await assert.rejects(service.requestCertificateOutput(id, operator), { code: "not_found" });
      await assert.rejects(service.decideCertificateOutputRequest(id, approved.id, admin, "approve"), { code: "not_found" });
      await assert.rejects(service.decideCertificateOutputRequest(id, pending.id, admin, "reject"), { code: "not_found" });
      assert.equal(await service.consumeCertificateOutputTicket(id, admin, ticket), null);
      assert.deepEqual((await sql`SELECT * FROM certificates WHERE id=${id}`)[0], before.certificate);
      assert.deepEqual(await sql`SELECT * FROM certificate_output_requests WHERE certificate_id=${id} ORDER BY id`, before.requests);
      assert.deepEqual(await sql`SELECT * FROM certificate_output_tickets WHERE certificate_id=${id} ORDER BY id`, before.tickets);
    });

    await t.test("admin queue includes names and operators cannot read other operators' requests", async () => {
      const id = await fixture({ count: 1 });
      const own = await service.requestCertificateOutput(id, operator);
      const other = await service.requestCertificateOutput(id, another);
      const queue = await service.listCertificateOutputRequests(admin, { certificateId: id, pendingOnly: true });
      assert.equal(queue.length, 2);
      assert.ok(queue.every((request) => request.company_name === "Output authorization test" && request.requester_email));
      await sql`INSERT INTO certificate_details_snapshots
        (certificate_id,company_name,address,contact_person,mobile,email,scope,created_at)
        SELECT ${id},name,address,contact_person,mobile,email,'Test output scope','2026-10-26T05:00:00.000Z'
        FROM companies WHERE id=${companyId}`;
      await sql`UPDATE companies SET name='Changed draft company name' WHERE id=${companyId}`;
      const preservedQueue = await service.listCertificateOutputRequests(admin, { certificateId: id, pendingOnly: true });
      assert.ok(preservedQueue.every((request) => request.company_name === "Output authorization test"));
      assert.deepEqual((await service.listCertificateOutputRequests(operator, { certificateId: id })).map((request) => request.id), [own.id]);
      assert.deepEqual((await service.listCertificateOutputRequests(another, { certificateId: id })).map((request) => request.id), [other.id]);
      await assert.rejects(service.decideCertificateOutputRequest(await fixture({ count: 1 }), own.id, admin, "approve"), { code: "not_found" });
    });
  } finally {
    await isolated.dispose();
  }
});
