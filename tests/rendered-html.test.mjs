import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the Prudential ISO marketing site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Certification Standards Explained \| Prudential ISO<\/title>/i);
  assert.match(html, /Choose the certification your business can use/i);
  assert.match(html, /ISO\/IEC 27001:2022/);
  assert.match(html, /Browse all certification and compliance guides/i);
});

test("renders the certification directory and detailed standard guides", async () => {
  const [directoryResponse, guideResponse] = await Promise.all([
    render("/certifications"),
    render("/certifications/iso-9001-quality-management"),
  ]);
  assert.equal(directoryResponse.status, 200);
  assert.equal(guideResponse.status, 200);
  const [directoryHtml, guideHtml] = await Promise.all([directoryResponse.text(), guideResponse.text()]);
  assert.match(directoryHtml, /Find the standard that fits the work/i);
  assert.match(directoryHtml, /Migration guidance—not a current certification/i);
  assert.match(guideHtml, /ISO 9001 Quality Management System Certification/i);
  assert.match(guideHtml, /application\/ld\+json/i);
  assert.match(guideHtml, /Before requesting assessment/i);
});

test("renders branded login and password recovery screens", async () => {
  const [loginResponse, recoveryResponse] = await Promise.all([
    render("/login"),
    render("/forgot-password"),
  ]);

  assert.equal(loginResponse.status, 200);
  assert.equal(recoveryResponse.status, 200);

  const [loginHtml, recoveryHtml] = await Promise.all([
    loginResponse.text(),
    recoveryResponse.text(),
  ]);
  assert.match(loginHtml, /Admin login/);
  assert.match(loginHtml, /Sign in securely/);
  assert.match(loginHtml, /Forgot password\?/);
  assert.match(loginHtml, /\/signin-with-chatgpt\?return_to=/);
  assert.match(recoveryHtml, /Continue to account recovery/);
  assert.match(recoveryHtml, /secure identity provider/i);
});
