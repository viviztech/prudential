import assert from "node:assert/strict";
import test from "node:test";
import { calculateCertificateDates } from "../lib/certificate-dates.ts";

test("calculates certificate milestones from the final print date", () => {
  assert.deepEqual(calculateCertificateDates("2026-10-05"), {
    issueDate: "2026-10-05",
    firstSurveillanceDate: "2027-10-05",
    secondSurveillanceDate: "2028-10-05",
    expiryDate: "2029-10-05",
  });
});

test("handles a leap day issue date and rejects invalid dates", () => {
  assert.equal(calculateCertificateDates("2024-02-29").expiryDate, "2027-02-28");
  assert.throws(() => calculateCertificateDates("2026-02-29"), /invalid/i);
});
