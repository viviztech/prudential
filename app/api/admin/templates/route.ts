import { getAdminApiUser } from "@/app/admin-user";
import { can } from "@/db/auth";
import { createStandardTemplate } from "@/db/runtime";
import { seeOther } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!can(user, "settings")) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  try {
    const code = await createStandardTemplate({
      name: String(form.get("name") ?? ""),
      code: String(form.get("code") ?? ""),
      certificatePrefix: String(form.get("certificatePrefix") ?? ""),
      primaryColor: String(form.get("primaryColor") ?? ""),
      accentColor: String(form.get("accentColor") ?? ""),
    });
    return seeOther(`/admin/templates/${encodeURIComponent(code)}?created=1`);
  } catch (error) {
    const duplicate = error instanceof Error &&
      (error.message.includes("already exists") || error.message.includes("duplicate key"));
    return seeOther(`/admin/templates/new?error=${duplicate ? "duplicate" : "invalid"}`);
  }
}
