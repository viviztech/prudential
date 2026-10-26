import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import postgres from "postgres";

export const workflowTestUrl = process.env.CERTIFICATE_WORKFLOW_TEST_DATABASE_URL;

export async function createWorkflowTestDatabase({ initialize = true } = {}) {
  assert.ok(workflowTestUrl, "Opt in with CERTIFICATE_WORKFLOW_TEST_DATABASE_URL.");
  const parsed = new URL(workflowTestUrl);
  assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname), "Use local PostgreSQL only.");
  assert.equal(parsed.port, "55434", "Use the project's isolated local PostgreSQL port.");
  const name = `pas_workflow_test_${randomUUID().replaceAll("-", "")}`;
  const admin = postgres(workflowTestUrl, { max: 1 });
  try { await admin.unsafe(`CREATE SCHEMA "${name}"`); }
  catch (error) { await admin.end(); throw error; }
  const url = new URL(workflowTestUrl);
  // postgres.js forwards unknown URL options as PostgreSQL startup settings.
  // Excluding public from search_path keeps application tables out of reach.
  url.searchParams.set("search_path", name);
  const previousUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = url.href;
  const sql = postgres(url.href, { max: 8 });
  let disposed = false;
  const dispose = async () => {
    if (disposed) return;
    disposed = true;
    await sql.end();
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    assert.match(name, /^pas_workflow_test_[a-f0-9]{32}$/);
    try { await admin.unsafe(`DROP SCHEMA "${name}" CASCADE`); }
    finally { await admin.end(); }
  };
  try {
    if (initialize) await (await import("../../db/runtime.ts")).ensureDatabase();
    return { name, schema: name, url: url.href, sql, dispose };
  } catch (error) {
    await dispose();
    throw error;
  }
}
