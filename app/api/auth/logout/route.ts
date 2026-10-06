import { adminSessionCookieName, sessionToken } from "@/app/admin-user";
import { deleteSession } from "@/db/auth";

export async function GET() {
  const token = await sessionToken();
  if (token) await deleteSession(token);
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/login?signed_out=1",
      "Set-Cookie": `${adminSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    },
  });
}
