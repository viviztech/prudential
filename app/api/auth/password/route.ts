import { adminSessionCookieName, getAdminApiUser } from "@/app/admin-user";
import { changeOwnPassword } from "@/db/auth";

export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  try {
    await changeOwnPassword(user.id, String(form.get("currentPassword") ?? ""), String(form.get("newPassword") ?? ""));
    return new Response(null, { status: 303, headers: {
      Location: new URL("/login?signed_out=1", request.url).toString(),
      "Set-Cookie": `${adminSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    } });
  } catch {
    return Response.redirect(new URL("/admin/profile?error=1", request.url), 303);
  }
}
