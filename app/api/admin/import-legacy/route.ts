import { getAdminApiUser } from "../../../admin-user";
import { can } from "@/db/auth";
import { seeOther } from "@/lib/http";
import { importLegacyCertificates, type LegacyRecord } from "../../../../db/runtime";

export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!can(user, "settings")) return new Response("Forbidden", { status: 403 });
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
    return seeOther("/admin/settings?imported=1");
  } catch {
    return seeOther("/admin/settings?error=1");
  }
}
