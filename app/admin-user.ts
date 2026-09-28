import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";

const SESSION_COOKIE = "pas_admin_session";
const SESSION_PAYLOAD = "prudential-admin:v1";

const LOCAL_ADMIN: ChatGPTUser = {
  userId: "local-admin",
  email: "admin@prudentialiso.com",
  displayName: "Prudential Admin",
  fullName: "Prudential Admin",
};

export async function getAdminUser(returnTo: string): Promise<ChatGPTUser> {
  if (import.meta.env.DEV) {
    return (await getChatGPTUser()) ?? LOCAL_ADMIN;
  }

  if (isSelfHostedAuthEnabled()) {
    const user = await getSelfHostedAdmin();
    if (!user) redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
    return user;
  }

  const user = await getChatGPTUser();
  if (!user) {
    redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
  }
  const allowedEmail = adminEmail();
  if (allowedEmail && user.email.toLowerCase() !== allowedEmail) {
    redirect(`/login?error=unauthorized&return_to=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

export async function getAdminApiUser(): Promise<ChatGPTUser | null> {
  if (import.meta.env.DEV) {
    return (await getChatGPTUser()) ?? LOCAL_ADMIN;
  }

  if (isSelfHostedAuthEnabled()) return getSelfHostedAdmin();

  const user = await getChatGPTUser();
  if (!user) return null;
  const allowedEmail = adminEmail();
  if (allowedEmail && user.email.toLowerCase() !== allowedEmail) return null;
  return user;
}

export function isSelfHostedAuthEnabled(): boolean {
  const runtimeEnv = env as typeof env & { ADMIN_PASSWORD?: string; AUTH_SECRET?: string };
  return Boolean(runtimeEnv.ADMIN_PASSWORD && runtimeEnv.AUTH_SECRET);
}

export async function createAdminSessionToken(): Promise<string> {
  const runtimeEnv = env as typeof env & { AUTH_SECRET?: string };
  if (!runtimeEnv.AUTH_SECRET) throw new Error("AUTH_SECRET is not configured");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(runtimeEnv.AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(SESSION_PAYLOAD));
  return bytesToBase64Url(new Uint8Array(signature));
}

export function adminSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function configuredAdminPassword(): string | undefined {
  const runtimeEnv = env as typeof env & { ADMIN_PASSWORD?: string };
  return runtimeEnv.ADMIN_PASSWORD;
}

async function getSelfHostedAdmin(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((entry) => entry.trim().split("="))
    .find(([name]) => name === SESSION_COOKIE)?.[1];
  if (!token) return null;

  const expected = await createAdminSessionToken();
  if (!constantTimeEqual(token, expected)) return null;

  return LOCAL_ADMIN;
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function adminEmail(): string | undefined {
  const runtimeEnv = env as typeof env & { ADMIN_EMAIL?: string };
  return runtimeEnv.ADMIN_EMAIL?.trim().toLowerCase();
}
