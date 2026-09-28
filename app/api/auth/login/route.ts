import {
  adminSessionCookieName,
  configuredAdminPassword,
  createAdminSessionToken,
  isSelfHostedAuthEnabled,
} from "@/app/admin-user";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnTo(String(form.get("return_to") ?? "/admin"));

  if (!isSelfHostedAuthEnabled() || password !== configuredAdminPassword()) {
    return Response.redirect(new URL(`/login?error=invalid&return_to=${encodeURIComponent(returnTo)}`, request.url), 303);
  }

  const token = await createAdminSessionToken();
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(returnTo, request.url).toString(),
      "Set-Cookie": `${adminSessionCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`,
    },
  });
}

function safeReturnTo(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}
