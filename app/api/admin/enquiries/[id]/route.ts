import { getAdminApiUser } from "../../../../admin-user";
import { can } from "@/db/auth";
import { updateEnquiry } from "../../../../../db/runtime";
import { seeOther } from "@/lib/http";

function textValue(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!can(user, "settings")) return new Response("Forbidden", { status: 403 });
  const { id } = await context.params;
  const form = await request.formData();
  const values = {
    companyName: textValue(form, "companyName"),
    address: textValue(form, "address"),
    scope: textValue(form, "scope"),
    contactPerson: textValue(form, "contactPerson"),
    mobile: textValue(form, "mobile"),
    email: textValue(form, "email"),
    certification: textValue(form, "certification"),
    notes: textValue(form, "notes"),
  };
  const invalid = !id || !values.companyName || !values.address || !values.scope || !values.contactPerson || !values.mobile || !values.email || !values.certification
    || values.companyName.length > 200 || values.address.length > 2000 || values.scope.length > 3000
    || values.contactPerson.length > 200 || values.mobile.length > 50 || values.email.length > 320
    || values.certification.length > 200 || values.notes.length > 3000;
  const returnUrl = new URL(`/admin/enquiries/detail?id=${encodeURIComponent(id)}`, request.url);
  if (invalid) {
    returnUrl.searchParams.set("error", "invalid");
    return seeOther(returnUrl.pathname + returnUrl.search);
  }
  try {
    await updateEnquiry(id, {
      company_name: values.companyName,
      address: values.address,
      scope: values.scope,
      contact_person: values.contactPerson,
      mobile: values.mobile,
      email: values.email,
      certification: values.certification,
      notes: values.notes || null,
    });
    returnUrl.searchParams.set("saved", "1");
    return seeOther(returnUrl.pathname + returnUrl.search);
  } catch {
    returnUrl.searchParams.set("error", "save");
    return seeOther(returnUrl.pathname + returnUrl.search);
  }
}
