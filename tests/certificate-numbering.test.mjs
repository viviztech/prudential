import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import postgres from "postgres";
import { allocateCertificateNumber } from "../lib/certificate-numbering.ts";

const pasqm = { certification_code: "9001", certificate_prefix: "PASQM" };

function returnedCounter(lastValue) {
  const calls = [];
  return {
    calls,
    prepare(statement) {
      const call = { statement, parameters: [] };
      calls.push(call);
      return {
        bind(...parameters) {
          call.parameters = parameters;
          return this;
        },
        async first() {
          return lastValue === null ? null : { last_value: lastValue };
        },
      };
    },
  };
}

test("PASQM retains the issue month while allocating from its continuous counter", async () => {
  const october = returnedCounter(55);
  assert.equal(await allocateCertificateNumber(october, pasqm, "2026-10-22"), "PASQM26100055");
  assert.equal(october.calls.length, 1);
  assert.equal(october.calls[0].parameters[0], "certificate-number:PASQM");

  const november = returnedCounter(56);
  assert.equal(await allocateCertificateNumber(november, pasqm, "2026-11-01"), "PASQM26110056");
  assert.equal(november.calls[0].parameters[0], "certificate-number:PASQM");

  const nextYear = returnedCounter(57);
  assert.equal(await allocateCertificateNumber(nextYear, pasqm, "2027-01-01"), "PASQM27010057");
  assert.equal(nextYear.calls[0].parameters[0], "certificate-number:PASQM");
});

test("other standards preserve monthly counters and nine-digit global numbering", async () => {
  const monthly = returnedCounter(7);
  assert.equal(await allocateCertificateNumber(monthly, {
    certification_code: "14001", certificate_prefix: "PASEM",
  }, "2026-11-01"), "PASEM26110007");
  assert.equal(monthly.calls[0].parameters[0], "certificate-number:PASEM2611");

  for (const code of ["20001", "17024"]) {
    const global = returnedCounter(123);
    assert.equal(await allocateCertificateNumber(global, {
      certification_code: code, certificate_prefix: `PAS${code}`,
    }, "2026-11-01"), `PAS${code}000000123`);
    assert.equal(global.calls[0].parameters[0], `certificate-number:PAS${code}`);
  }
});

test("custom prefixes are matched literally and do not activate the PASQM policy", async () => {
  const database = returnedCounter(1);
  assert.equal(await allocateCertificateNumber(database, {
    certification_code: "9001", certificate_prefix: "CUSTOM.+",
  }, "2026-10-22"), "CUSTOM.+26100001");
  assert.equal(database.calls[0].parameters[0], "certificate-number:CUSTOM.+2610");
  const regex = new RegExp(database.calls[0].parameters[2]);
  assert.equal(regex.test("CUSTOM.+26100001"), true);
  assert.equal(regex.test("CUSTOMxx26100001"), false);
  assert.equal(regex.test("CUSTOM.+2610oops"), false);
});

test("allocation reports missing counters and serial exhaustion", async () => {
  await assert.rejects(allocateCertificateNumber(returnedCounter(null), pasqm, "2026-10-22"),
    /Certificate number could not be generated/);
  await assert.rejects(allocateCertificateNumber(returnedCounter("55"), pasqm, "2026-10-22"),
    /Certificate number could not be generated/);
  await assert.rejects(allocateCertificateNumber(returnedCounter(10000), pasqm, "2026-10-22"),
    /sequence has reached its limit/);
  await assert.rejects(allocateCertificateNumber(returnedCounter(1000000000), {
    certification_code: "20001", certificate_prefix: "PASIT",
  }, "2026-10-22"), /sequence has reached its limit/);
});

// Opt in explicitly; ordinary node --test never connects to a database. The
// integration suite accepts only the project's local PostgreSQL port and uses
// a new schema so it cannot read or modify application certificates/counters.
const integrationUrl = process.env.CERTIFICATE_NUMBERING_TEST_DATABASE_URL;

test("PostgreSQL certificate allocation migration and concurrency", {
  skip: !integrationUrl,
}, async (t) => {
  const parsed = new URL(integrationUrl);
  assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname), "Use local PostgreSQL only.");
  assert.equal(parsed.port, "55434", "Use the project's local test PostgreSQL port.");
  const schema = `certificate_numbering_test_${randomUUID().replaceAll("-", "")}`;
  const admin = postgres(integrationUrl, { max: 1 });
  let client;
  try {
    await admin.unsafe(`CREATE SCHEMA ${schema}`);
    client = postgres(integrationUrl, { max: 8, connection: { search_path: schema } });
    await client.unsafe("CREATE TABLE certificates (certificate_number TEXT)");
    await client.unsafe("CREATE TABLE certificate_counters (counter_key TEXT PRIMARY KEY, last_value INTEGER NOT NULL)");

    const database = {
      prepare(statement) {
        let parameters = [];
        return {
          bind(...values) { parameters = values; return this; },
          async first() {
            let position = 0;
            const rows = await client.unsafe(statement.replace(/\?/g, () => `$${++position}`), parameters);
            return rows[0] ?? null;
          },
        };
      },
    };
    const reset = () => client.unsafe("TRUNCATE certificates, certificate_counters");
    const issued = (numbers) => client`INSERT INTO certificates ${client(numbers.map((certificate_number) => ({ certificate_number })))}`;
    const counter = (key, value) => client`INSERT INTO certificate_counters (counter_key, last_value) VALUES (${key}, ${value})`;

    await t.test("starts at 55 and continues through month and year changes", async () => {
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-10-22"), "PASQM26100055");
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-11-01"), "PASQM26110056");
      assert.equal(await allocateCertificateNumber(database, pasqm, "2027-01-01"), "PASQM27010057");
    });

    await t.test("continues after the confirmed anchor despite larger older monthly series", async () => {
      await reset();
      await issued(["PASQM23040227", "PASQM26090084", "PASQM26100054"]);
      await counter("certificate-number:PASQM2609", 72);
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-10-22"), "PASQM26100055");
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-11-01"), "PASQM26110056");
    });

    await t.test("avoids collisions in an explicitly backdated month and then continues that serial", async () => {
      await reset();
      await issued(["PASQM23040227"]);
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-10-22"), "PASQM26100055");
      assert.equal(await allocateCertificateNumber(database, pasqm, "2023-04-01"), "PASQM23040228");
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-11-01"), "PASQM26110229");

      await reset();
      await counter("certificate-number:PASQM2609", 72);
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-10-22"), "PASQM26100055");
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-09-01"), "PASQM26090073");
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-11-01"), "PASQM26110074");
    });

    await t.test("migrates current monthly counters without accepting older series or lookalikes", async () => {
      await reset();
      await counter("certificate-number:PASQM2609", 9000);
      await counter("certificate-number:PASQM2610", 72);
      await counter("certificate-number:PASQM2613", 9000);
      await counter("certificate-number:PASQM2610custom", 9001);
      await counter("certificate-number:XPASQM2610", 9002);
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-11-01"), "PASQM26110073");
    });

    await t.test("seeds from the largest valid issued suffix at or after the confirmed anchor", async () => {
      await reset();
      await issued(["PASQM23040227", "PASQM26110084", "PASQM26100054", "PASQM2610008x", "PASQM26139999", "XPASQM26109999", "PASQM26109999custom"]);
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-12-01"), "PASQM26120085");
    });

    await t.test("never rewinds an existing continuous counter", async () => {
      await reset();
      await counter("certificate-number:PASQM", 100);
      await counter("certificate-number:PASQM2610", 80);
      await issued(["PASQM23040227", "PASQM26100090"]);
      assert.equal(await allocateCertificateNumber(database, pasqm, "2026-11-01"), "PASQM26110101");
    });

    await t.test("allocates distinct consecutive numbers during concurrent first use", async () => {
      await reset();
      const numbers = await Promise.all(Array.from({ length: 20 }, () => allocateCertificateNumber(database, pasqm, "2026-11-01")));
      assert.equal(new Set(numbers).size, 20);
      assert.deepEqual(numbers.map((number) => Number(number.slice(-4))).sort((a, b) => a - b),
        Array.from({ length: 20 }, (_, index) => 55 + index));
    });

    await t.test("preserves other monthly counters and ignores malformed/custom prefixes", async () => {
      await reset();
      const standard = { certification_code: "14001", certificate_prefix: "PASEM" };
      await issued(["PASEM26100007", "PASEM261000xx", "PASEM26100009custom", "PASEM26110004"]);
      assert.equal(await allocateCertificateNumber(database, standard, "2026-10-22"), "PASEM26100008");
      assert.equal(await allocateCertificateNumber(database, standard, "2026-11-01"), "PASEM26110005");
      const custom = { certification_code: "9001", certificate_prefix: "CUSTOM.+" };
      await issued(["CUSTOM.+26100003", "CUSTOMxx26109999"]);
      assert.equal(await allocateCertificateNumber(database, custom, "2026-10-22"), "CUSTOM.+26100004");
    });

    await t.test("preserves nine-digit global serials for both global standards", async () => {
      await reset();
      for (const code of ["20001", "17024"]) {
        const standard = { certification_code: code, certificate_prefix: `PAS${code}` };
        await issued([`${standard.certificate_prefix}000000009`, `${standard.certificate_prefix}invalidxx`]);
        assert.equal(await allocateCertificateNumber(database, standard, "2026-10-22"), `${standard.certificate_prefix}000000010`);
        assert.equal(await allocateCertificateNumber(database, standard, "2026-11-01"), `${standard.certificate_prefix}000000011`);
      }
    });

    await t.test("rejects a PASQM serial above four digits", async () => {
      await reset();
      await counter("certificate-number:PASQM", 9999);
      await assert.rejects(allocateCertificateNumber(database, pasqm, "2026-11-01"), /sequence has reached its limit/);
    });
  } finally {
    if (client) await client.end();
    await admin.unsafe(`DROP SCHEMA ${schema} CASCADE`);
    await admin.end();
  }
});
