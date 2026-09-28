import { adminSessionCookieName } from "@/app/admin-user";

export async function GET(request: Request) {
  const response = Response.redirect(new URL("/login?signed_out=1", request.url), 303);
  response.headers.append(
    "Set-Cookie",
    `${adminSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
  return response;
}
