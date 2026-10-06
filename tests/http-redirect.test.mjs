import assert from "node:assert/strict";
import test from "node:test";
import { hasSameHostOrigin, seeOther } from "../lib/http.ts";

test("form redirects keep the browser on the public HTTPS host", () => {
  const response = seeOther("/admin");
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/admin");
  assert.throws(() => seeOther("//another.example/path"));
});

test("origin check permits HTTPS through an HTTP reverse proxy", () => {
  assert.equal(hasSameHostOrigin(new Request("http://prudentialiso.com/api/auth/login", { headers: { origin: "https://prudentialiso.com" } })), true);
  assert.equal(hasSameHostOrigin(new Request("http://prudentialiso.com/api/auth/login", { headers: { origin: "https://another.example" } })), false);
});
