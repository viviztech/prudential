import { adminSessionCookieName } from "@/app/admin-user";
import { authenticate, createSession } from "@/db/auth";
import { hasSameHostOrigin, seeOther } from "@/lib/http";

export async function POST(request: Request) {
  if (!hasSameHostOrigin(request)) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const email = String(form.get("email") ?? "");
  const returnTo = safeReturnTo(String(form.get("return_to") ?? "/admin"));

  const user = await authenticate(email, password);
  if (!user) {
    return seeOther(`/login?error=invalid&return_to=${encodeURIComponent(returnTo)}`);
  }

  const token = await createSession(user.id);
  return new Response(null, {
    status: 303,
    headers: {
      Location: returnTo,
      "Set-Cookie": `${adminSessionCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    },
  });
}

function safeReturnTo(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}
