import { createEnquiry } from "../../../db/runtime";
import { seeOther } from "@/lib/http";

function textValue(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

export async function POST(request: Request) {
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

  if (Object.entries(values).some(([key, value]) => key !== "notes" && !value)) {
    return new Response("Required enquiry details are missing.", { status: 400 });
  }

  await createEnquiry({
    company_name: values.companyName,
    address: values.address,
    scope: values.scope,
    contact_person: values.contactPerson,
    mobile: values.mobile,
    email: values.email,
    certification: values.certification,
    notes: values.notes || null,
  });

  return seeOther("/enquire?submitted=1");
}
