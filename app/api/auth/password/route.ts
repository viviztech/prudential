import { adminSessionCookieName, getAdminApiUser } from "@/app/admin-user";
import { changeOwnPassword } from "@/db/auth";
import { hasSameHostOrigin, seeOther } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!hasSameHostOrigin(request)) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  try {
    await changeOwnPassword(user.id, String(form.get("currentPassword") ?? ""), String(form.get("newPassword") ?? ""));
    return new Response(null, { status: 303, headers: {
      Location: "/login?signed_out=1",
      "Set-Cookie": `${adminSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    } });
  } catch {
    return seeOther("/admin/profile?error=1");
  }
}
