import type { Metadata } from "next";
import { getAdminUser } from "@/app/admin-user";
import { AdminNotice, AdminPageHeader, Field } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "My account" };
export default async function ProfilePage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const user = await getAdminUser("/admin/profile");
  const params = searchParams ? await searchParams : {};
  return <>
    <AdminPageHeader eyebrow="Account" title="My account" description="Update your sign-in password." />
    {params.error ? <AdminNotice tone="error">Password was not changed. Check your current password and use at least 12 characters for the new one.</AdminNotice> : null}
    <Card className="mt-7 max-w-xl rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><CardTitle>{user.name}</CardTitle><p className="text-sm text-[#526b73]">{user.email} · {user.role}</p></CardHeader><CardContent><form action="/api/auth/password" method="post" className="grid gap-5"><Field label="Current password"><Input name="currentPassword" type="password" autoComplete="current-password" required /></Field><Field label="New password" help="Use at least 12 characters. You will sign in again after saving."><Input name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></Field><Button className="w-fit" type="submit">Change password</Button></form></CardContent></Card>
  </>;
}
