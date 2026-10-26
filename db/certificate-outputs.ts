import type { AdminUser } from "./auth";

type Row = Record<string, unknown>;
type OutputQuery = {
  bind(...parameters: unknown[]): OutputQuery;
  first<T extends Row>(): Promise<T | null>;
  all<T extends Row>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
};
type OutputTransaction = { prepare(statement: string): OutputQuery };
type OutputDatabase = OutputTransaction & {
  transaction<T>(work: (transaction: OutputTransaction) => Promise<T>): Promise<T>;
};

export type CertificateOutputMode = "print" | "download";
export type CertificateOutputRequest = Row & {
  id: string;
  certificate_id: string;
  requested_by: string;
  status: "pending" | "approved" | "rejected" | "used";
  requested_at: string;
  decided_by: string | null;
  decided_at: string | null;
  used_at: string | null;
  requester_name?: string;
  requester_email?: string;
  company_name?: string;
  certification_name?: string;
  certificate_number?: string | null;
};
type OutputCertificate = Row & {
  id: string;
  status: string;
  certificate_number: string | null;
  final_output_count: number;
};
export type CertificateOutputAccess = {
  canClaim: boolean;
  canRequest: boolean;
  requiresApproval: boolean;
  outputCount: number;
  request: CertificateOutputRequest | null;
  isFinal: boolean;
  isAdmin: boolean;
};
export type ConsumedCertificateOutputTicket = Row & {
  id: string;
  certificate_id: string;
  user_id: string;
  mode: CertificateOutputMode;
  request_id: string | null;
  used_at: string;
};

export const CERTIFICATE_OUTPUT_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS certificate_output_requests (
    id TEXT PRIMARY KEY NOT NULL,
    certificate_id TEXT NOT NULL REFERENCES certificates(id),
    requested_by TEXT NOT NULL REFERENCES admin_users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'used')),
    requested_at TEXT NOT NULL,
    decided_by TEXT REFERENCES admin_users(id),
    decided_at TEXT,
    used_at TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_certificate_output_requests_active
    ON certificate_output_requests(certificate_id, requested_by)
    WHERE status IN ('pending', 'approved')`,
  `CREATE INDEX IF NOT EXISTS idx_certificate_output_requests_status
    ON certificate_output_requests(status, requested_at)`,
  `CREATE TABLE IF NOT EXISTS certificate_output_tickets (
    id TEXT PRIMARY KEY NOT NULL,
    certificate_id TEXT NOT NULL REFERENCES certificates(id),
    user_id TEXT NOT NULL REFERENCES admin_users(id),
    token_hash TEXT NOT NULL UNIQUE,
    mode TEXT NOT NULL CHECK (mode IN ('print', 'download')),
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    request_id TEXT REFERENCES certificate_output_requests(id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_certificate_output_tickets_certificate
    ON certificate_output_tickets(certificate_id, user_id)`,
];

export class CertificateOutputError extends Error {
  readonly code: "role" | "approval" | "not_final" | "not_found" | "invalid";

  constructor(code: "role" | "approval" | "not_final" | "not_found" | "invalid") {
    super(code === "role" ? "Forbidden" : "Certificate output is not available.");
    this.name = "CertificateOutputError";
    this.code = code;
  }
}

export function certificateOutputCookieName(certificateId: string) {
  return `pas_certificate_output_${encodeURIComponent(certificateId)}`;
}

function hasOutputRole(user: AdminUser) {
  return Boolean(user.active) && (user.role === "admin" || user.role === "operator");
}

function requireOutputRole(user: AdminUser) {
  if (!hasOutputRole(user)) throw new CertificateOutputError("role");
}

function requireAdmin(user: AdminUser) {
  if (!user.active || user.role !== "admin") throw new CertificateOutputError("role");
}

function isFinal(certificate: OutputCertificate | null) {
  return certificate?.status === "printed" && Boolean(certificate.certificate_number);
}

function outputCount(certificate: OutputCertificate) {
  const value = Number(certificate.final_output_count);
  if (!Number.isSafeInteger(value) || value < 0) throw new CertificateOutputError("invalid");
  return value;
}

function tokenValue() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function tokenHash(value: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Injection keeps the PostgreSQL integration tests isolated from application
// credentials and lets them exercise the same transactions as production.
export function createCertificateOutputService(options: {
  database: OutputDatabase;
  ensureReady?: () => Promise<void>;
  now?: () => Date;
}) {
  const database = options.database;
  const ready = options.ensureReady ?? (async () => undefined);
  const now = options.now ?? (() => new Date());

  async function certificate(transaction: OutputTransaction, id: string, lock = false) {
    return transaction.prepare(`SELECT id, status, certificate_number, final_output_count
      FROM certificates WHERE id = ?${lock ? " FOR UPDATE" : ""}`)
      .bind(id).first<OutputCertificate>();
  }

  async function activeRequest(transaction: OutputTransaction, id: string, userId: string) {
    return transaction.prepare(`SELECT * FROM certificate_output_requests
      WHERE certificate_id = ? AND requested_by = ? AND status IN ('pending', 'approved')
      ORDER BY requested_at DESC, id DESC LIMIT 1`)
      .bind(id, userId).first<CertificateOutputRequest>();
  }

  async function getCertificateOutputAccess(certificateId: string, user: AdminUser): Promise<CertificateOutputAccess> {
    await ready();
    const record = await certificate(database, certificateId);
    const final = isFinal(record);
    const count = record ? outputCount(record) : 0;
    const allowedRole = hasOutputRole(user);
    const request = allowedRole && user.role === "operator"
      ? await activeRequest(database, certificateId, user.id)
      : null;
    const isAdmin = allowedRole && user.role === "admin";
    const canClaim = final && allowedRole && (isAdmin || count === 0 || request?.status === "approved");
    return {
      canClaim,
      canRequest: final && allowedRole && !isAdmin && count > 0 && !request,
      requiresApproval: final && allowedRole && !isAdmin && count > 0 && !canClaim,
      outputCount: count,
      request,
      isFinal: final,
      isAdmin,
    };
  }

  async function requestCertificateOutput(certificateId: string, user: AdminUser) {
    requireOutputRole(user);
    if (user.role !== "operator") throw new CertificateOutputError("role");
    await ready();
    return database.transaction(async (transaction) => {
      const record = await certificate(transaction, certificateId, true);
      if (!record) throw new CertificateOutputError("not_found");
      if (!isFinal(record)) throw new CertificateOutputError("not_final");
      if (outputCount(record) === 0) throw new CertificateOutputError("approval");
      const existing = await activeRequest(transaction, certificateId, user.id);
      if (existing) return existing;
      const created = await transaction.prepare(`INSERT INTO certificate_output_requests
        (id, certificate_id, requested_by, status, requested_at)
        VALUES (?, ?, ?, 'pending', ?) RETURNING *`)
        .bind(crypto.randomUUID(), certificateId, user.id, now().toISOString())
        .first<CertificateOutputRequest>();
      if (!created) throw new CertificateOutputError("invalid");
      return created;
    });
  }

  async function decideCertificateOutputRequest(
    certificateId: string,
    requestId: string,
    admin: AdminUser,
    decision: "approve" | "reject",
  ) {
    requireAdmin(admin);
    if (decision !== "approve" && decision !== "reject") throw new CertificateOutputError("invalid");
    await ready();
    return database.transaction(async (transaction) => {
      const record = await certificate(transaction, certificateId, true);
      if (!record) throw new CertificateOutputError("not_found");
      if (!isFinal(record)) throw new CertificateOutputError("not_final");
      const request = await transaction.prepare(`SELECT * FROM certificate_output_requests
        WHERE id = ? AND certificate_id = ?`).bind(requestId, certificateId).first<CertificateOutputRequest>();
      if (!request) throw new CertificateOutputError("not_found");
      const status = decision === "approve" ? "approved" : "rejected";
      if (request.status === status) return request;
      if (request.status !== "pending") throw new CertificateOutputError("approval");
      const decided = await transaction.prepare(`UPDATE certificate_output_requests
        SET status = ?, decided_by = ?, decided_at = ?
        WHERE id = ? AND certificate_id = ? AND status = 'pending' RETURNING *`)
        .bind(status, admin.id, now().toISOString(), requestId, certificateId)
        .first<CertificateOutputRequest>();
      if (!decided) throw new CertificateOutputError("approval");
      return decided;
    });
  }

  async function listCertificateOutputRequests(user: AdminUser, filters: { certificateId?: string; pendingOnly?: boolean } = {}) {
    if (!hasOutputRole(user)) return [];
    await ready();
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    if (user.role !== "admin") {
      conditions.push("request.requested_by = ?");
      parameters.push(user.id);
    }
    if (filters.certificateId) {
      conditions.push("request.certificate_id = ?");
      parameters.push(filters.certificateId);
    }
    if (filters.pendingOnly) conditions.push("request.status = 'pending'");
    const records = await database.prepare(`SELECT request.*, requester.name AS requester_name,
      requester.email AS requester_email, COALESCE(snapshot.company_name, company.name) AS company_name,
      standard.name AS certification_name, cert.certificate_number
      FROM certificate_output_requests request
      JOIN admin_users requester ON requester.id = request.requested_by
      JOIN certificates cert ON cert.id = request.certificate_id
      JOIN companies company ON company.id = cert.company_id
      JOIN certifications standard ON standard.id = cert.certification_id
      LEFT JOIN certificate_details_snapshots snapshot ON snapshot.certificate_id = cert.id
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY request.requested_at DESC, request.id DESC LIMIT 300`)
      .bind(...parameters).all<CertificateOutputRequest>();
    return records.results;
  }

  async function claimCertificateOutput(certificateId: string, user: AdminUser, mode: CertificateOutputMode) {
    requireOutputRole(user);
    if (mode !== "print" && mode !== "download") throw new CertificateOutputError("invalid");
    await ready();
    return database.transaction(async (transaction) => {
      const record = await certificate(transaction, certificateId, true);
      if (!record) throw new CertificateOutputError("not_found");
      if (!isFinal(record)) throw new CertificateOutputError("not_final");
      let requestId: string | null = null;
      if (user.role !== "admin" && outputCount(record) > 0) {
        const approved = await activeRequest(transaction, certificateId, user.id);
        if (approved?.status !== "approved") throw new CertificateOutputError("approval");
        const used = await transaction.prepare(`UPDATE certificate_output_requests
          SET status = 'used', used_at = ?
          WHERE id = ? AND certificate_id = ? AND requested_by = ? AND status = 'approved' RETURNING id`)
          .bind(now().toISOString(), approved.id, certificateId, user.id).first<{ id: string }>();
        if (!used) throw new CertificateOutputError("approval");
        requestId = used.id;
      }
      const timestamp = now();
      const ticket = tokenValue();
      await transaction.prepare(`INSERT INTO certificate_output_tickets
        (id, certificate_id, user_id, token_hash, mode, created_at, expires_at, request_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), certificateId, user.id, await tokenHash(ticket), mode,
          timestamp.toISOString(), new Date(timestamp.getTime() + 300_000).toISOString(), requestId).run();
      await transaction.prepare(`UPDATE certificates SET final_output_count = final_output_count + 1 WHERE id = ?`)
        .bind(certificateId).run();
      return { ticket, mode };
    });
  }

  async function consumeCertificateOutputTicket(certificateId: string, user: AdminUser, ticket: string) {
    if (!hasOutputRole(user) || !/^[a-f0-9]{64}$/.test(ticket)) return null;
    await ready();
    return database.prepare(`UPDATE certificate_output_tickets SET used_at = ?
      WHERE certificate_id = ? AND user_id = ? AND token_hash = ?
        AND used_at IS NULL AND expires_at > ?
        AND EXISTS (SELECT 1 FROM certificates cert WHERE cert.id = certificate_output_tickets.certificate_id
          AND cert.status = 'printed' AND cert.certificate_number IS NOT NULL)
      RETURNING id, certificate_id, user_id, mode, request_id, used_at`)
      .bind(now().toISOString(), certificateId, user.id, await tokenHash(ticket), now().toISOString())
      .first<ConsumedCertificateOutputTicket>();
  }

  return {
    getCertificateOutputAccess,
    requestCertificateOutput,
    decideCertificateOutputRequest,
    listCertificateOutputRequests,
    claimCertificateOutput,
    consumeCertificateOutputTicket,
  };
}

type CertificateOutputService = ReturnType<typeof createCertificateOutputService>;
let service: CertificateOutputService | undefined;
async function productionService() {
  service ??= createCertificateOutputService({
    database: (await import("./postgres")).database,
    ensureReady: async () => (await import("./runtime")).ensureDatabase(),
  });
  return service;
}

export async function getCertificateOutputAccess(certificateId: string, user: AdminUser) {
  return (await productionService()).getCertificateOutputAccess(certificateId, user);
}
export async function requestCertificateOutput(certificateId: string, user: AdminUser) {
  return (await productionService()).requestCertificateOutput(certificateId, user);
}
export async function decideCertificateOutputRequest(certificateId: string, requestId: string, admin: AdminUser, decision: "approve" | "reject") {
  return (await productionService()).decideCertificateOutputRequest(certificateId, requestId, admin, decision);
}
export async function listCertificateOutputRequests(user: AdminUser, filters: { certificateId?: string; pendingOnly?: boolean } = {}) {
  return (await productionService()).listCertificateOutputRequests(user, filters);
}
export async function claimCertificateOutput(certificateId: string, user: AdminUser, mode: CertificateOutputMode) {
  return (await productionService()).claimCertificateOutput(certificateId, user, mode);
}
export async function consumeCertificateOutputTicket(certificateId: string, user: AdminUser, ticket: string) {
  return (await productionService()).consumeCertificateOutputTicket(certificateId, user, ticket);
}
