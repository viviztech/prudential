import { getAdminApiUser } from "@/app/admin-user";
import { deleteCertificate } from "@/db/runtime";
import { hasSameHostOrigin, seeOther } from "@/lib/http";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const actor = await getAdminApiUser();
  if (!actor) return new Response("Unauthorized", { status: 401 });
  if (actor.role !== "admin" || !hasSameHostOrigin(request)) return new Response("Forbidden", { status: 403 });
  const { id } = await params;
  const recordPath = `/admin/certificates/${encodeURIComponent(id)}`;
  try {
    const form = await request.formData();
    if (form.get("confirmDelete") !== "yes") return seeOther(`${recordPath}?delete_error=1`);
    await deleteCertificate(id, actor);
    return seeOther("/admin/certificates?deleted=1");
  } catch {
    return seeOther(`${recordPath}?delete_error=1`);
  }
}
