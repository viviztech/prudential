import Link from "@/components/native-link";
import { redirect } from "next/navigation";
import { AdminNotice, AdminPageHeader, Field } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminUser } from "@/app/admin-user";
import { can } from "@/db/auth";

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function NewStandardTemplatePage({ searchParams }: Props) {
  const user = await getAdminUser("/admin/templates/new");
  if (!can(user, "settings")) redirect("/admin");
  const params = searchParams ? await searchParams : {};
  return <>
    <div className="mb-5"><Link href="/admin/templates" className="text-sm font-semibold text-[#08766f] hover:underline">← All standard templates</Link></div>
    <AdminPageHeader eyebrow="Certificate design" title="Add a standard" description="Create the standard and its certificate template together. It will appear in certificate creation immediately." />
    {params.error === "duplicate" ? <AdminNotice tone="error">This standard code is already in use. Enter a unique code.</AdminNotice> : null}
    {params.error === "invalid" ? <AdminNotice tone="error">Check the name, code, prefix, and colors, then try again.</AdminNotice> : null}
    <Card className="mt-7 max-w-2xl"><CardHeader><CardTitle>Standard details</CardTitle><CardDescription>After creating the standard, add its wording and artwork in the template editor.</CardDescription></CardHeader><CardContent>
      <form action="/api/admin/templates" method="post" className="grid gap-5">
        <Field label="Standard name"><Input name="name" placeholder="ISO 50001 Energy Management" maxLength={120} required /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Standard code"><Input name="code" placeholder="50001" maxLength={24} pattern="[A-Za-z0-9][A-Za-z0-9._-]{1,23}" title="2 to 24 letters, numbers, periods, underscores or hyphens" required /></Field>
          <Field label="Certificate number prefix"><Input name="certificatePrefix" placeholder="PASEN" maxLength={12} pattern="[A-Za-z0-9]{2,12}" title="2 to 12 letters or numbers" required /></Field>
        </div>
        <p className="m-0 text-sm leading-6 text-[#607880]">The prefix is used when assigning final certificate numbers. The code uniquely identifies this standard and cannot be changed later.</p>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Primary color"><Input type="color" name="primaryColor" defaultValue="#3b54a5" required /></Field>
          <Field label="Accent color"><Input type="color" name="accentColor" defaultValue="#cb131e" required /></Field>
        </div>
        <Button className="w-fit" type="submit">Create standard and template</Button>
      </form>
    </CardContent></Card>
  </>;
}
