import { getAdminApiUser } from "../../../admin-user";
import { updateCertificateSettings } from "../../../../db/runtime";

function value(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function POST(request: Request) {
  if (!(await getAdminApiUser())) return new Response("Unauthorized", { status: 401 });
  const form = await request.formData();
  const settings = {
    brand_name: value(form, "brandName"),
    office_address: value(form, "officeAddress"),
    registration_heading: value(form, "registrationHeading"),
    intro_wording: value(form, "introWording"),
    conformity_wording: value(form, "conformityWording"),
    footer_wording: value(form, "footerWording"),
    signatory_name: value(form, "signatoryName") || null,
    signatory_title: value(form, "signatoryTitle"),
  };
  if (!settings.brand_name || !settings.registration_heading || !settings.intro_wording || !settings.conformity_wording || !settings.footer_wording || !settings.signatory_title) {
    return Response.redirect(new URL("/admin/settings?error=1", request.url), 303);
  }
  await updateCertificateSettings(settings);
  return Response.redirect(new URL("/admin/settings?saved=1", request.url), 303);
}
