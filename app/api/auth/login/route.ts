import { adminSessionCookieName } from "@/app/admin-user";
import { authenticate, createSession } from "@/db/auth";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const email = String(form.get("email") ?? "");
  const returnTo = safeReturnTo(String(form.get("return_to") ?? "/admin"));

  const user = await authenticate(email, password);
  if (!user) {
    return Response.redirect(new URL(`/login?error=invalid&return_to=${encodeURIComponent(returnTo)}`, request.url), 303);
  }

  const token = await createSession(user.id);
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(returnTo, request.url).toString(),
      "Set-Cookie": `${adminSessionCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    },
  });
}

function safeReturnTo(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}
