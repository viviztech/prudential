import { redirect } from "next/navigation";
import Link from "@/components/native-link";
import { getAdminUser } from "@/app/admin-user";
import { AdminNotice, AdminPageHeader } from "@/components/admin-ui";
import { CertificateOutputRequestDecision } from "@/components/certificate-output-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCertificateOutputRequests } from "@/db/certificate-outputs";

type Props = { searchParams?: Promise<{ output_decision?: string }> };

export default async function CertificatePrintRequestsPage({ searchParams }: Props) {
  const user = await getAdminUser("/admin/print-requests");
  if (user.role !== "admin") redirect("/admin");
  const [requests, state] = await Promise.all([
    listCertificateOutputRequests(user, { pendingOnly: true }),
    searchParams ?? Promise.resolve({} as { output_decision?: string }),
  ]);
  return <>
    <AdminPageHeader eyebrow="Admin approval" title="Download requests" description="Approve one additional final print or PDF download for the requesting operator." />
    {state.output_decision ? <AdminNotice>The request has been reviewed.</AdminNotice> : null}
    <div className="mt-7 grid gap-4">
      {requests.length ? requests.map((request) => <Card key={request.id} className="rounded-2xl border-[#d9e4e1] shadow-none"><CardHeader><CardTitle>{request.company_name ?? "Certificate"}</CardTitle></CardHeader><CardContent className="grid gap-4"><div className="text-sm leading-7 text-[#526b73]"><p className="m-0"><strong>{request.certificate_number}</strong>{request.certification_name ? ` · ${request.certification_name}` : ""}</p><p className="m-0">Requested by {request.requester_name ?? "Operator"}{request.requester_email ? ` (${request.requester_email})` : ""}</p></div><CertificateOutputRequestDecision request={request} returnTo="/admin/print-requests" /><Link className="w-fit text-sm font-semibold text-[#08766f] underline" href={`/admin/certificates/${encodeURIComponent(request.certificate_id)}`}>Open certificate record</Link></CardContent></Card>) : <Card><CardContent className="p-8 text-sm text-[#526b73]">No download requests are waiting for approval.</CardContent></Card>}
    </div>
  </>;
}
