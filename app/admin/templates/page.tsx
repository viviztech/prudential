import Link from "@/components/native-link";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { getAdminUser } from "@/app/admin-user";
import { can } from "@/db/auth";
import { listCertificateDesignTemplates } from "@/db/runtime";

export default async function CertificateTemplatesPage() {
  const user = await getAdminUser("/admin/templates");
  if (!can(user, "settings")) redirect("/admin");
  const templates = await listCertificateDesignTemplates();
  return <>
    <AdminPageHeader eyebrow="Certificate design" title="Standard templates" description="Set the wording, colors and marks for each standard. Company details and dates come from the certificate record." actions={<Button asChild><Link href="/admin/templates/new">Add standard</Link></Button>} />
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => <Link key={template.standard_code} href={`/admin/templates/${encodeURIComponent(template.standard_code)}`} className="group rounded-2xl border border-[#d9e4e1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#08766f] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08766f]">
        <span className="mb-4 block h-1.5 w-16 rounded-full" style={{ background: template.accent_color }} />
        <strong className="block font-serif text-xl text-[#123547]">{template.standard_label}</strong>
        <span className="mt-2 block text-sm text-[#607880]">{template.heading}</span>
        <span className="mt-5 block text-xs font-bold uppercase tracking-wide text-[#08766f] group-hover:underline">Edit template →</span>
      </Link>)}
    </div>
  </>;
}
