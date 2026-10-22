type NumberingRow = Record<string, unknown>;

type NumberingQuery = {
  bind(...parameters: unknown[]): NumberingQuery;
  first(): Promise<NumberingRow | null>;
};

type NumberingDatabase = {
  prepare(statement: string): NumberingQuery;
};

type NumberedCertificate = {
  certification_code: string;
  certificate_prefix: string;
};

// The confirmed continuation point supersedes older, independently numbered
// monthly series. Older series only raise the seed when issuing in that exact
// historical month, so a backdated certificate cannot reuse an existing number.
const PASQM_CONTINUATION_ANCHOR = "PASQM26100054";
const PASQM_CONTINUATION_SERIAL = Number(PASQM_CONTINUATION_ANCHOR.slice(-4));
const PASQM_CONTINUATION_MONTH_KEY = `certificate-number:${PASQM_CONTINUATION_ANCHOR.slice(0, -4)}`;

function escapeRegularExpression(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function allocateCertificateNumber(
  database: NumberingDatabase,
  certificate: NumberedCertificate,
  issueDate: string,
) {
  const usesContinuousPasqmSequence = certificate.certification_code === "9001"
    && certificate.certificate_prefix === "PASQM";
  const usesGlobalSequence = certificate.certification_code === "20001"
    || certificate.certification_code === "17024";
  const numberStem = usesGlobalSequence
    ? certificate.certificate_prefix
    : `${certificate.certificate_prefix}${issueDate.slice(2, 4)}${issueDate.slice(5, 7)}`;
  const sequenceLength = usesGlobalSequence ? 9 : 4;
  const counterKey = `certificate-number:${usesContinuousPasqmSequence ? "PASQM" : numberStem}`;

  // One upsert both reconciles historical numbers and allocates the next serial.
  // The conflicting row is locked by PostgreSQL, so concurrent allocations cannot
  // return the same serial or move an existing counter backwards.
  const counter = usesContinuousPasqmSequence
    ? await database.prepare(
      `INSERT INTO certificate_counters (counter_key, last_value)
       SELECT ?, GREATEST(
         ?,
         COALESCE((
           SELECT MAX(CAST(RIGHT(certificate_number, 4) AS INTEGER))
           FROM certificates
           WHERE certificate_number ~ ?
             AND (certificate_number >= ? OR LEFT(certificate_number, ?) = ?)
         ), 0),
         COALESCE((
           SELECT MAX(last_value) FROM certificate_counters
           WHERE counter_key ~ ? AND (counter_key >= ? OR counter_key = ?)
         ), 0)
       ) + 1
       ON CONFLICT(counter_key) DO UPDATE SET
         last_value = GREATEST(certificate_counters.last_value + 1, excluded.last_value)
       RETURNING last_value`,
    ).bind(
      counterKey,
      PASQM_CONTINUATION_SERIAL,
      "^PASQM[0-9]{2}(0[1-9]|1[0-2])[0-9]{4}$",
      PASQM_CONTINUATION_ANCHOR,
      numberStem.length,
      numberStem,
      "^certificate-number:PASQM[0-9]{2}(0[1-9]|1[0-2])$",
      PASQM_CONTINUATION_MONTH_KEY,
      `certificate-number:${numberStem}`,
    ).first()
    : await database.prepare(
      `INSERT INTO certificate_counters (counter_key, last_value)
       SELECT ?, COALESCE(MAX(CAST(SUBSTR(certificate_number, ?) AS INTEGER)), 0) + 1
       FROM certificates
       WHERE certificate_number ~ ?
       ON CONFLICT(counter_key) DO UPDATE SET
         last_value = GREATEST(certificate_counters.last_value + 1, excluded.last_value)
       RETURNING last_value`,
    ).bind(
      counterKey,
      numberStem.length + 1,
      `^${escapeRegularExpression(numberStem)}[0-9]{${sequenceLength}}$`,
    ).first();

  if (!counter || typeof counter.last_value !== "number"
    || !Number.isSafeInteger(counter.last_value) || counter.last_value < 1) {
    throw new Error("Certificate number could not be generated.");
  }
  if (counter.last_value > 10 ** sequenceLength - 1) {
    throw new Error("The certificate number sequence has reached its limit.");
  }

  return `${numberStem}${String(counter.last_value).padStart(sequenceLength, "0")}`;
}
