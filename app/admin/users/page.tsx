import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/app/admin-user";
import { AdminNotice, AdminPageHeader, Field } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { can, listUsers, roles } from "@/db/auth";

export const metadata: Metadata = { title: "Users" };
export default async function UsersPage({ searchParams }: { searchParams?: Promise<{ created?: string; updated?: string; error?: string }> }) {
  const actor = await getAdminUser("/admin/users");
  if (!can(actor, "users")) redirect("/admin");
  const [users, params] = await Promise.all([listUsers(), searchParams ?? Promise.resolve({} as { created?: string; updated?: string; error?: string })]);
  return <>
    <AdminPageHeader eyebrow="Team access" title="Users" description="Assign each person a role in the certificate workflow." />
    {params.created ? <AdminNotice>User account created.</AdminNotice> : null}
    {params.updated ? <AdminNotice>User access updated.</AdminNotice> : null}
    {params.error ? <AdminNotice tone="error">Could not save the account. Use a unique email and a password of at least 12 characters. Keep an active admin.</AdminNotice> : null}
    <div className="mt-7 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <Card className="h-fit rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><CardTitle>Add a user</CardTitle></CardHeader><CardContent><form action="/api/admin/users" method="post" className="grid gap-4">
        <Field label="Full name"><Input name="name" maxLength={120} required /></Field>
        <Field label="Email"><Input name="email" type="email" maxLength={320} required /></Field>
        <Field label="Temporary password" help="Share this directly with the user. At least 12 characters."><Input name="password" type="password" minLength={12} maxLength={128} required /></Field>
        <Field label="Role"><NativeSelect name="role">{roles.map((role) => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</NativeSelect></Field>
        <Button type="submit">Create user</Button>
      </form></CardContent></Card>
      <div className="grid content-start gap-4"><div className="rounded-2xl border border-[#d9e4e1] bg-white p-5 text-sm leading-6 text-[#526b73]"><strong className="block text-[#0d2a3d]">Role permissions</strong>Admin manages all steps and users. Operator creates records, prepares drafts, and prints final copies. Reviewer confirms drafts or requests changes. Viewer can read certificates and the dashboard.</div>
        {users.map((user) => <Card className="rounded-2xl border-[#d9e4e1] shadow-none" key={user.id}><CardContent className="p-5"><form action={`/api/admin/users/${user.id}`} method="post" className="grid gap-4"><div><strong className="text-[#0d2a3d]">{user.name}</strong><span className="mt-1 block text-sm text-[#526b73]">{user.email}</span></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Role"><NativeSelect name="role" defaultValue={user.role}>{roles.map((role) => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</NativeSelect></Field><Field label="New password" help="Leave blank to keep it"><Input name="password" type="password" minLength={12} maxLength={128} /></Field></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={Boolean(user.active)} className="size-4" /> Active account</label><Button className="w-fit" variant="outline" type="submit">Save user</Button></form></CardContent></Card>)}
      </div>
    </div>
  </>;
}
