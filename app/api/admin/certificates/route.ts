import { getAdminApiUser } from "../../../admin-user";
import { createCertificateFromEnquiry, createCertificates } from "../../../../db/runtime";
import { can } from "@/db/auth";

export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!can(user, "create")) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const enquiryId = String(form.get("enquiryId") ?? "");
  const certificationIds = form.getAll("certificationIds").map(Number);
  if (!certificationIds.length) {
    const destination = enquiryId ? `/admin/enquiries/detail?id=${encodeURIComponent(enquiryId)}&error=1` : "/admin/certificates/new?error=1";
    return Response.redirect(new URL(destination, request.url), 303);
  }
  try {
    const id = enquiryId
      ? await createCertificateFromEnquiry(enquiryId, certificationIds)
      : await createCertificates({
          companyName: String(form.get("companyName") ?? ""),
          address: String(form.get("address") ?? ""),
          scope: String(form.get("scope") ?? ""),
          email: String(form.get("email") ?? ""),
          mobile: String(form.get("mobile") ?? ""),
          contactPerson: String(form.get("contactPerson") ?? ""),
          certificationIds,
          applicationChecked: form.has("applicationChecked"),
          legalChecked: form.has("legalChecked"),
          continuityChecked: form.has("continuityChecked"),
          documentationChecked: form.has("documentationChecked"),
        });
    return Response.redirect(new URL(`/admin/certificates/${id}`, request.url), 303);
  } catch {
    const destination = enquiryId ? `/admin/enquiries/detail?id=${encodeURIComponent(enquiryId)}&error=1` : "/admin/certificates/new?error=1";
    return Response.redirect(new URL(destination, request.url), 303);
  }
}
