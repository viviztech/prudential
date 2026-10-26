import { getAdminApiUser } from "@/app/admin-user";
import { can } from "@/db/auth";
import { updateCertificateDetails } from "@/db/runtime";
import { hasSameHostOrigin, seeOther } from "@/lib/http";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const actor = await getAdminApiUser();
  if (!actor) return new Response("Unauthorized", { status: 401 });
  if (!can(actor, "prepare") || !hasSameHostOrigin(request)) return new Response("Forbidden", { status: 403 });
  const { id } = await params;
  const recordPath = `/admin/certificates/${encodeURIComponent(id)}`;
  try {
    const form = await request.formData();
    const value = (name: string) => {
      const field = form.get(name);
      return typeof field === "string" ? field : "";
    };
    await updateCertificateDetails(id, actor, {
      companyName: value("companyName"),
      address: value("address"),
      scope: value("scope"),
      contactPerson: value("contactPerson"),
      mobile: value("mobile"),
      email: value("email"),
    });
    return seeOther(`${recordPath}?saved=1`);
  } catch {
    return seeOther(`${recordPath}?edit_error=1`);
  }
}
