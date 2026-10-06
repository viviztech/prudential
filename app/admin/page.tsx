import type { Metadata } from "next";
import Link from "@/components/native-link";
import { ArrowRight, ClipboardCheck, FilePenLine, Printer, SearchCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin-ui";
import { getAdminUser } from "@/app/admin-user";
import { can } from "@/db/auth";
import { listCertificates } from "../../db/runtime";

export const metadata: Metadata = { title: "Certificate dashboard" };
const steps = [
  { title: "Checklist & company", status: "Prepare the application and company details", icon: ClipboardCheck },
  { title: "Draft & send", status: "Complete and send drafts", icon: FilePenLine },
  { title: "Confirm draft", status: "Review the customer confirmation", icon: SearchCheck },
  { title: "Final copy", status: "Print and issue the certificate", icon: Printer },
] as const;

export default async function AdminPage() {
  const user = await getAdminUser("/admin");
  const certificates = await listCertificates();
  const queues = [
    certificates.filter((item) => item.status === "draft_created" && !item.draft_date),
    certificates.filter((item) => item.status === "changes_requested" || (item.status === "draft_created" && Boolean(item.draft_date))),
    certificates.filter((item) => item.status === "waiting_approval"),
    certificates.filter((item) => item.status === "approved"),
  ];
  const work = user.role === "reviewer" ? queues[2] : user.role === "operator" ? [...queues[0], ...queues[1], ...queues[3]] : certificates;
  const uniqueWork = [...new Map(work.map((item) => [item.id, item])).values()];
  return <>
    <AdminPageHeader eyebrow={`${user.role} dashboard`} title="Certificate desk" description={user.role === "viewer" ? "View certificate progress and final copies." : "Your certificate workflow at a glance."} actions={can(user, "create") ? <Button asChild><Link href="/admin/certificates/new">Create certificate<ArrowRight /></Link></Button> : undefined} />
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{steps.map((step, index) => <Card className="rounded-2xl border-[#d9e4e1] shadow-none" key={step.title}><CardContent className="p-5"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#e7f3ef] text-[#08766f]"><step.icon className="size-5" /></span><strong className="font-serif text-3xl font-medium text-[#0d2a3d]">{queues[index].length}</strong></div><strong className="mt-5 block text-sm text-[#0d2a3d]">{index + 1}. {step.title}</strong><p className="mt-1 text-xs leading-5 text-[#526b73]">{step.status}</p></CardContent></Card>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><Card className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><CardTitle>{user.role === "reviewer" ? "Awaiting your review" : user.role === "viewer" ? "Recent certificates" : "Certificates to work on"}</CardTitle><Button asChild variant="link" size="sm"><Link href="/admin/certificates">View all<ArrowRight /></Link></Button></CardHeader><CardContent className="p-0">{uniqueWork.length ? uniqueWork.slice(0, 8).map((item) => <Link className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-[#dce7e3] px-6 py-4 transition hover:bg-[#f1f8f5]" href={`/admin/certificates/${item.id}`} key={item.id}><span className="min-w-0"><strong className="block truncate text-sm text-[#0d2a3d]">{item.company_name}</strong><small className="mt-1 block truncate text-[#526b73]">{item.certification_name}</small></span><Badge variant={item.status === "printed" ? "default" : "pending"}>{item.status.replaceAll("_", " ")}</Badge></Link>) : <div className="p-10 text-sm text-[#526b73]">No certificates in this queue. Open the certificate list to view all records.</div>}</CardContent></Card>
    <Card className="h-fit rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><CardTitle>How the flow works</CardTitle></CardHeader><CardContent className="grid gap-4">{steps.map((step, index) => <div className="flex gap-3" key={step.title}><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#0d2a3d] text-xs text-white">{index + 1}</span><div><strong className="text-sm text-[#0d2a3d]">{step.title}</strong><p className="mt-1 text-xs leading-5 text-[#526b73]">{step.status}</p></div></div>)}<p className="border-t border-[#dce7e3] pt-4 text-xs leading-5 text-[#526b73]">The final print date sets the issue date. Surveillance dates are one and two years later; expiry is three years later. Signature and QR code appear after final print.</p></CardContent></Card></div>
  </>;
}
