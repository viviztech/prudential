import { getAdminApiUser } from "@/app/admin-user";
import { can, updateUser, validRole } from "@/db/auth";

type RouteProps = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: RouteProps) {
  const actor = await getAdminApiUser();
  if (!actor) return new Response("Unauthorized", { status: 401 });
  if (!can(actor, "users")) return new Response("Forbidden", { status: 403 });
  const [{ id }, form] = await Promise.all([params, request.formData()]);
  const role = String(form.get("role") ?? "");
  if (!validRole(role)) return Response.redirect(new URL("/admin/users?error=role", request.url), 303);
  try {
    await updateUser(id, actor.id, role, form.has("active"), String(form.get("password") ?? ""));
    return Response.redirect(new URL("/admin/users?updated=1", request.url), 303);
  } catch {
    return Response.redirect(new URL("/admin/users?error=update", request.url), 303);
  }
}
