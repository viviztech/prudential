import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("app entry opens the certificate workspace", async () => {
  const response = await render("/");
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/admin");
});

test("unused site modules redirect to the certificate workflow", async () => {
  const [directory, guide, enquiry] = await Promise.all([
    render("/certifications"),
    render("/certifications/iso-9001-quality-management"),
    render("/enquire"),
  ]);
  assert.equal(directory.status, 307);
  assert.equal(guide.status, 307);
  assert.equal(enquiry.status, 307);
  assert.equal(directory.headers.get("location"), "/admin");
  assert.equal(enquiry.headers.get("location"), "/admin/certificates/new");
});

test("login explains the database requirement and verification stays public", async () => {
  const [login, verify, recovery] = await Promise.all([
    render("/login"),
    render("/verify"),
    render("/forgot-password"),
  ]);
  assert.equal(login.status, 200);
  assert.equal(verify.status, 200);
  assert.equal(recovery.status, 307);
  assert.match(await login.text(), /PostgreSQL connection/);
  assert.match(await verify.text(), /Check a certificate/);
  assert.equal(recovery.headers.get("location"), "/login");
});
