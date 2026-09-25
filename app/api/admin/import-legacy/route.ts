import { getAdminApiUser } from "../../../admin-user";
import { importLegacyCertificates, type LegacyRecord } from "../../../../db/runtime";

export async function POST(request: Request) {
  if (!(await getAdminApiUser())) return new Response("Unauthorized", { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("legacyFile");
    if (!(file instanceof File) || file.size < 1 || file.size > 5_000_000) {
      throw new Error("A valid import file is required.");
    }
    const payload = JSON.parse(await file.text()) as { records?: LegacyRecord[] };
    if (!Array.isArray(payload.records) || payload.records.length > 1_000) {
      throw new Error("The import file is invalid.");
    }
    await importLegacyCertificates(payload.records);
    return Response.redirect(new URL("/admin/settings?imported=1", request.url), 303);
  } catch {
    return Response.redirect(new URL("/admin/settings?error=1", request.url), 303);
  }
}
