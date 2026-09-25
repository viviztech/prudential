import { getAdminApiUser } from "../../../admin-user";
import { createCertificateFromEnquiry } from "../../../../db/runtime";

export async function POST(request: Request) {
  if (!(await getAdminApiUser())) return new Response("Unauthorized", { status: 401 });
  const form = await request.formData();
  const enquiryId = String(form.get("enquiryId") ?? "");
  const certificationId = Number(form.get("certificationId"));
  if (!enquiryId || !Number.isInteger(certificationId)) return new Response("Invalid certificate details.", { status: 400 });
  try {
    const id = await createCertificateFromEnquiry(enquiryId, certificationId);
    return Response.redirect(new URL(`/admin/certificates/${id}`, request.url), 303);
  } catch {
    return Response.redirect(new URL(`/admin/enquiries/detail?id=${encodeURIComponent(enquiryId)}&error=1`, request.url), 303);
  }
}
