import { adminSessionCookieName } from "@/app/admin-user";
import { addUser, authenticate, createSession, userCount } from "@/db/auth";
import { hasSameHostOrigin, seeOther } from "@/lib/http";

export async function POST(request: Request) {
  if (!hasSameHostOrigin(request)) return new Response("Forbidden", { status: 403 });
  const url = new URL(request.url);
  const local = process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1"].includes(url.hostname);
  const form = await request.formData();
  if ((!local && (!process.env.ADMIN_SETUP_TOKEN || String(form.get("setupToken") ?? "") !== process.env.ADMIN_SETUP_TOKEN)) || await userCount() !== 0) {
    return new Response("Setup unavailable", { status: 403 });
  }
  const input = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), password: String(form.get("password") ?? ""), role: "admin" as const };
  try {
    await addUser(input, true);
    const user = await authenticate(input.email, input.password);
    if (!user) throw new Error("Account creation failed.");
    const token = await createSession(user.id);
    return new Response(null, { status: 303, headers: {
      Location: "/admin",
      "Set-Cookie": `${adminSessionCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    } });
  } catch {
    return seeOther("/login?error=setup");
  }
}
