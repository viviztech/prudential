import { getCertificateAsset } from "../../../../db/runtime";
import { getAdminApiUser } from "@/app/admin-user";

type AssetRouteProps = { params: Promise<{ kind: string }> };

export async function GET(_request: Request, { params }: AssetRouteProps) {
  const { kind } = await params;
  if (kind !== "logo" && kind !== "signature") return new Response("Not found", { status: 404 });
  if (kind === "signature" && !(await getAdminApiUser())) return new Response("Unauthorized", { status: 401 });
  const object = await getCertificateAsset(kind);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers({ "content-type": object.contentType });
  headers.set("etag", object.etag);
  headers.set("cache-control", kind === "signature" ? "private, no-store" : "public, max-age=3600");
  return new Response(object.body, { headers });
}
