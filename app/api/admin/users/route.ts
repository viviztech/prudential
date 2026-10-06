import { getAdminApiUser } from "@/app/admin-user";
import { addUser, can, validRole } from "@/db/auth";
import { seeOther } from "@/lib/http";

export async function POST(request: Request) {
  const actor = await getAdminApiUser();
  if (!actor) return new Response("Unauthorized", { status: 401 });
  if (!can(actor, "users")) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const role = String(form.get("role") ?? "");
  if (!validRole(role)) return seeOther("/admin/users?error=role");
  try {
    await addUser({ name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), password: String(form.get("password") ?? ""), role });
    return seeOther("/admin/users?created=1");
  } catch {
    return seeOther("/admin/users?error=create");
  }
}
