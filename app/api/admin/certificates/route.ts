import { getAdminApiUser } from "../../../admin-user";
import { createCertificateFromEnquiry, createCertificates } from "../../../../db/runtime";
import { can } from "@/db/auth";
import { seeOther } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!can(user, "create")) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const enquiryId = String(form.get("enquiryId") ?? "");
  const certificationIds = form.getAll("certificationIds").map(Number);
  const checked = (name: string) => form.get(name) === "on";
  const checklist = {
    applicationChecked: checked("applicationChecked"),
    legalChecked: checked("legalChecked"),
    continuityChecked: checked("continuityChecked"),
    documentationChecked: checked("documentationChecked"),
  };
  if (!Object.values(checklist).every(Boolean)) {
    const destination = enquiryId ? `/admin/enquiries/detail?id=${encodeURIComponent(enquiryId)}&error=checklist` : "/admin/certificates/new?error=checklist";
    return seeOther(destination);
  }
  if (!certificationIds.length) {
    const destination = enquiryId ? `/admin/enquiries/detail?id=${encodeURIComponent(enquiryId)}&error=1` : "/admin/certificates/new?error=1";
    return seeOther(destination);
  }
  try {
    const id = enquiryId
      ? await createCertificateFromEnquiry(enquiryId, certificationIds, checklist)
      : await createCertificates({
          companyName: String(form.get("companyName") ?? ""),
          address: String(form.get("address") ?? ""),
          scope: String(form.get("scope") ?? ""),
          email: String(form.get("email") ?? ""),
          mobile: String(form.get("mobile") ?? ""),
          contactPerson: String(form.get("contactPerson") ?? ""),
          certificationIds,
          ...checklist,
        });
    return seeOther(`/admin/certificates/${id}`);
  } catch {
    const destination = enquiryId ? `/admin/enquiries/detail?id=${encodeURIComponent(enquiryId)}&error=1` : "/admin/certificates/new?error=1";
    return seeOther(destination);
  }
}
