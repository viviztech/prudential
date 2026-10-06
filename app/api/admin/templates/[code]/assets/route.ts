import { getAdminApiUser } from "@/app/admin-user";
import { can } from "@/db/auth";
import { getCertificateDesignTemplate, putTemplateAsset } from "@/db/runtime";
import { seeOther } from "@/lib/http";

type Props = { params: Promise<{ code: string }> };
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request, { params }: Props) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!can(user, "settings")) return new Response("Forbidden", { status: 403 });
  const { code } = await params;
  if (!await getCertificateDesignTemplate(code)) return new Response("Not found", { status: 404 });
  const form = await request.formData();
  const kind = String(form.get("kind") ?? "");
  const asset = form.get("asset");
  const templateUrl = `/admin/templates/${encodeURIComponent(code)}`;
  if ((kind !== "standard" && kind !== "accreditation") ||
    !(asset instanceof File) || !allowedTypes.has(asset.type) || asset.size < 1 || asset.size > 2_000_000) {
    return seeOther(`${templateUrl}?error=1`);
  }
  await putTemplateAsset(code, kind, asset);
  return seeOther(`${templateUrl}?uploaded=1`);
}
