import { getAdminApiUser } from "@/app/admin-user";
import { getTemplateAsset } from "@/db/runtime";

type Props = { params: Promise<{ code: string; kind: string }> };

export async function GET(_request: Request, { params }: Props) {
  if (!await getAdminApiUser()) return new Response("Unauthorized", { status: 401 });
  const { code, kind } = await params;
  if (kind !== "standard" && kind !== "accreditation") return new Response("Not found", { status: 404 });
  const asset = await getTemplateAsset(code, kind);
  if (!asset) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(asset.body).buffer, { headers: {
    "content-type": asset.contentType, "etag": asset.etag, "cache-control": "private, max-age=3600",
  } });
}
