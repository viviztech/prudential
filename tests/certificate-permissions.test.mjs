import assert from "node:assert/strict";
import test from "node:test";
import { can, roles, validRole } from "../lib/certificate-permissions.ts";

const permissions = ["create", "prepare", "review", "print", "users", "settings"];
const user = (role) => ({ id: `test-${role}`, name: role, email: `${role}@example.com`, role, active: 1 });

test("operators can complete the certificate workflow without account or settings administration", () => {
  for (const permission of ["create", "prepare", "review", "print"]) {
    assert.equal(can(user("operator"), permission), true, permission);
  }
  for (const permission of ["users", "settings"]) {
    assert.equal(can(user("operator"), permission), false, permission);
  }
});

test("reviewers retain review-only access and viewers cannot change workflow or administration", () => {
  for (const permission of permissions) {
    assert.equal(can(user("reviewer"), permission), permission === "review", permission);
    assert.equal(can(user("viewer"), permission), false, permission);
  }
});

test("administrators retain every existing permission", () => {
  for (const permission of permissions) assert.equal(can(user("admin"), permission), true, permission);
});

test("role validation accepts only the existing role names", () => {
  assert.deepEqual(roles, ["admin", "operator", "reviewer", "viewer"]);
  for (const role of roles) assert.equal(validRole(role), true, role);
  for (const role of ["", "Admin", "administrator", "operator ", "owner", "constructor"]) {
    assert.equal(validRole(role), false, role);
  }
});
