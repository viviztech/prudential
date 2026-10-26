import type { AdminUser } from "./auth";
import type { Database } from "./postgres";

export async function deleteCertificateInDatabase(database: Database, id: string, actor: AdminUser): Promise<void> {
  if (!actor.id || actor.role !== "admin" || !actor.active) {
    throw new Error("Only an active admin can delete a certificate.");
  }

  await database.transaction(async (transaction) => {
    const reference = await transaction.prepare(`SELECT company_id FROM certificates WHERE id = ?`)
      .bind(id).first<{ company_id: string }>();
    if (!reference) throw new Error("Certificate not found.");

    // Match edits and finalization: lock the company before the certificate.
    await transaction.prepare(`SELECT id FROM companies WHERE id = ? FOR UPDATE`)
      .bind(reference.company_id).first();
    const certificate = await transaction.prepare(`SELECT id, deleted_at FROM certificates WHERE id = ? FOR UPDATE`)
      .bind(id).first<{ id: string; deleted_at: string | null }>();
    if (!certificate) throw new Error("Certificate not found.");
    if (certificate.deleted_at) return;

    // Keep the tombstone and allocated number so even historical/imported
    // certificates continue reserving their serial after deletion.
    await transaction.prepare(`UPDATE certificates SET deleted_at = ?, deleted_by = ? WHERE id = ? AND deleted_at IS NULL`)
      .bind(new Date().toISOString(), actor.id, id).run();
  });
}
