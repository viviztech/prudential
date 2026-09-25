import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { getChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";

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

  const user = await getChatGPTUser();
  if (!user) return null;
  const allowedEmail = adminEmail();
  if (allowedEmail && user.email.toLowerCase() !== allowedEmail) return null;
  return user;
}

function adminEmail(): string | undefined {
  const runtimeEnv = env as typeof env & { ADMIN_EMAIL?: string };
  return runtimeEnv.ADMIN_EMAIL?.trim().toLowerCase();
}
