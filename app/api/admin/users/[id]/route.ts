import { getAdminApiUser } from "@/app/admin-user";
import { can, updateUser, validRole } from "@/db/auth";
import { seeOther } from "@/lib/http";

type RouteProps = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: RouteProps) {
  const actor = await getAdminApiUser();
  if (!actor) return new Response("Unauthorized", { status: 401 });
  if (!can(actor, "users")) return new Response("Forbidden", { status: 403 });
  const [{ id }, form] = await Promise.all([params, request.formData()]);
  const role = String(form.get("role") ?? "");
  if (!validRole(role)) return seeOther("/admin/users?error=role");
  try {
    await updateUser(id, actor.id, role, form.has("active"), String(form.get("password") ?? ""));
    return seeOther("/admin/users?updated=1");
  } catch {
    return seeOther("/admin/users?error=update");
  }
}
