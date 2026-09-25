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
  assert.match(html, /<title>Prudential ISO \| Certification made clear<\/title>/i);
  assert.match(html, /Every certificate should withstand scrutiny/i);
  assert.match(html, /ISO 17024:2017/);
  assert.match(html, /SA 8000/);
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
