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

test("app entry opens the public marketing page", async () => {
  const [response, admin] = await Promise.all([render("/"), render("/admin")]);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Choose the certification your business can use/);
  assert.equal(admin.status, 307);
  assert.match(admin.headers.get("location") ?? "", /^\/login\?/);
});

test("public certification guides and enquiry remain available", async () => {
  const [directory, guide, enquiry] = await Promise.all([
    render("/certifications"),
    render("/certifications/iso-9001-quality-management"),
    render("/enquire"),
  ]);
  assert.equal(directory.status, 200);
  assert.equal(guide.status, 200);
  assert.equal(enquiry.status, 200);
  assert.match(await directory.text(), /Find the standard that fits the work/);
  assert.match(await guide.text(), /ISO 9001/);
  assert.match(await enquiry.text(), /Tell us about your company/);
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
