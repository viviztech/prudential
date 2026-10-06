import { adminSessionCookieName, sessionToken } from "@/app/admin-user";
import { deleteSession } from "@/db/auth";

export async function GET(request: Request) {
  const token = await sessionToken();
  if (token) await deleteSession(token);
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL("/login?signed_out=1", request.url).toString(),
      "Set-Cookie": `${adminSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    },
  });
}
