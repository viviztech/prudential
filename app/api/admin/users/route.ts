import { getAdminApiUser } from "@/app/admin-user";
import { addUser, can, validRole } from "@/db/auth";

export async function POST(request: Request) {
  const actor = await getAdminApiUser();
  if (!actor) return new Response("Unauthorized", { status: 401 });
  if (!can(actor, "users")) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const role = String(form.get("role") ?? "");
  if (!validRole(role)) return Response.redirect(new URL("/admin/users?error=role", request.url), 303);
  try {
    await addUser({ name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), password: String(form.get("password") ?? ""), role });
    return Response.redirect(new URL("/admin/users?created=1", request.url), 303);
  } catch {
    return Response.redirect(new URL("/admin/users?error=create", request.url), 303);
  }
}
