export function calculateCertificateDates(issueDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) throw new Error("Issue date is invalid.");
  const issue = new Date(`${issueDate}T00:00:00Z`);
  if (Number.isNaN(issue.getTime()) || issue.toISOString().slice(0, 10) !== issueDate) {
    throw new Error("Issue date is invalid.");
  }
  const addYears = (years: number) => {
    const year = issue.getUTCFullYear() + years;
    const month = issue.getUTCMonth();
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const next = new Date(Date.UTC(year, month, Math.min(issue.getUTCDate(), lastDay)));
    return next.toISOString().slice(0, 10);
  };
  return {
    issueDate,
    firstSurveillanceDate: addYears(1),
    secondSurveillanceDate: addYears(2),
    expiryDate: addYears(3),
  };
}
