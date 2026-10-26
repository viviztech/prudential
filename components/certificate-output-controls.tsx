import Link from "@/components/native-link";
import { Button } from "@/components/ui/button";
import type { CertificateOutputAccess, CertificateOutputRequest } from "@/db/certificate-outputs";

export function CertificateOutputControls({ certificateId, access }: { certificateId: string; access: CertificateOutputAccess }) {
  const endpoint = `/api/admin/certificates/${encodeURIComponent(certificateId)}/outputs`;
  return <div className="grid gap-3">
    <p className="m-0 text-sm leading-6 text-[#526b73]">Copies opened: <strong>{access.outputCount}</strong>. Operators can open the first final copy once. Each additional print or download requires a new admin approval.</p>
    {access.canClaim ? <>
      {!access.isAdmin && access.outputCount > 0 ? <p className="m-0 text-sm font-semibold text-[#08766f]">Admin approved one additional copy. This approval can be used once.</p> : null}
      <div className="flex flex-wrap gap-2">
        {([ ["download", "Download final PDF"], ["print", "Print final certificate"] ] as const).map(([mode, label]) => <form action={endpoint} method="post" key={mode}><input type="hidden" name="action" value="claim" /><input type="hidden" name="mode" value={mode} /><Button type="submit" variant={mode === "download" ? "default" : "outline"}>{label}</Button></form>)}
      </div>
    </> : access.request?.status === "pending" ? <p role="status" className="m-0 rounded-lg bg-[#fff5df] p-3 text-sm text-[#805b16]">Your request is waiting for admin approval.</p> : <p className="m-0 text-sm font-semibold text-[#805b16]">Admin approval is required for another final copy.</p>}
    {access.canRequest ? <form action={endpoint} method="post"><input type="hidden" name="action" value="request" /><Button type="submit" variant="outline">Request another download</Button></form> : null}
    {access.isAdmin ? <Link href="/admin/print-requests" className="text-sm font-semibold text-[#08766f] underline">Review download requests</Link> : null}
  </div>;
}

export function CertificateOutputRequestDecision({ request, returnTo }: { request: CertificateOutputRequest; returnTo?: string }) {
  return <div className="flex flex-wrap gap-2">
    {([ ["approve", "Approve one additional copy"], ["reject", "Decline request"] ] as const).map(([action, label]) => <form action={`/api/admin/certificates/${encodeURIComponent(request.certificate_id)}/outputs`} method="post" key={action}><input type="hidden" name="action" value={action} /><input type="hidden" name="requestId" value={request.id} />{returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}<Button type="submit" variant={action === "approve" ? "default" : "outline"}>{label}</Button></form>)}
  </div>;
}
