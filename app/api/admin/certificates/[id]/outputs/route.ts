import { getAdminApiUser } from "@/app/admin-user";
import {
  CertificateOutputError,
  certificateOutputCookieName,
  claimCertificateOutput,
  decideCertificateOutputRequest,
  requestCertificateOutput,
} from "@/db/certificate-outputs";
import { hasSameHostOrigin, seeOther } from "@/lib/http";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  if (!hasSameHostOrigin(request)) return new Response("Forbidden", { status: 403 });
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "admin" && user.role !== "operator") return new Response("Forbidden", { status: 403 });
  const [{ id }, form] = await Promise.all([params, request.formData()]);
  const recordUrl = `/admin/certificates/${encodeURIComponent(id)}`;
  const action = String(form.get("action") ?? "");
  try {
    if (action === "claim") {
      const mode = String(form.get("mode") ?? "");
      if (mode !== "print" && mode !== "download") return new Response("Invalid output mode", { status: 400 });
      const { ticket } = await claimCertificateOutput(id, user, mode);
      const path = `${recordUrl}/print`;
      const secure = new URL(request.url).protocol === "https:"
        || request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https";
      const response = seeOther(`${path}?output=${mode}`);
      response.headers.set("Cache-Control", "private, no-store");
      response.headers.set("Set-Cookie", `${certificateOutputCookieName(id)}=${ticket}; Path=${path}; HttpOnly; SameSite=Lax; Max-Age=300${secure ? "; Secure" : ""}`);
      return response;
    }
    if (action === "request") {
      await requestCertificateOutput(id, user);
      return seeOther(`${recordUrl}?output_requested=1`);
    }
    if (action === "approve" || action === "reject") {
      if (user.role !== "admin") return new Response("Forbidden", { status: 403 });
      await decideCertificateOutputRequest(id, String(form.get("requestId") ?? ""), user, action);
      const returnTo = form.get("returnTo") === "/admin/print-requests" ? "/admin/print-requests" : recordUrl;
      return seeOther(`${returnTo}?output_decision=1`);
    }
    return new Response("Invalid output action", { status: 400 });
  } catch (error) {
    if (error instanceof CertificateOutputError && error.code === "role") return new Response("Forbidden", { status: 403 });
    return seeOther(`${recordUrl}?output_error=approval`);
  }
}
