import { getAdminApiUser } from "../../../../admin-user";
import { putCertificateAsset } from "../../../../../db/runtime";
import { can } from "@/db/auth";
import { seeOther } from "@/lib/http";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!can(user, "settings")) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const kind = String(form.get("kind") ?? "");
  const asset = form.get("asset");
  if ((kind !== "logo" && kind !== "signature") || !(asset instanceof File) || !allowedTypes.has(asset.type) || asset.size < 1 || asset.size > 2_000_000) {
    return seeOther("/admin/settings?error=1");
  }
  await putCertificateAsset(kind, asset);
  return seeOther("/admin/settings?uploaded=1");
}
