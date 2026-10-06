import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type AdminUser, userFromSession } from "@/db/auth";

const SESSION_COOKIE = "pas_admin_session";
export function adminSessionCookieName(): string { return SESSION_COOKIE; }
export async function sessionToken(): Promise<string | null> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie")?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${SESSION_COOKIE}=`));
  return cookie?.slice(SESSION_COOKIE.length + 1) ?? null;
}
export async function getAdminApiUser(): Promise<AdminUser | null> {
  if (!process.env.DATABASE_URL) return null;
  const token = await sessionToken();
  return token ? userFromSession(token) : null;
}
export async function getAdminUser(returnTo: string): Promise<AdminUser> {
  if (!process.env.DATABASE_URL) redirect(`/login?error=database&return_to=${encodeURIComponent(returnTo)}`);
  const user = await getAdminApiUser();
  if (!user) redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
  return user;
}
