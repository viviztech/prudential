import { adminSessionCookieName } from "@/app/admin-user";

export async function GET(request: Request) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL("/login?signed_out=1", request.url).toString(),
      "Set-Cookie": `${adminSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}
