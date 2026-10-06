import { getAdminApiUser } from "@/app/admin-user";
import { can } from "@/db/auth";
import { getCertificateDesignTemplate, updateCertificateDesignTemplate } from "@/db/runtime";
import { seeOther } from "@/lib/http";

type Props = { params: Promise<{ code: string }> };
const colorPattern = /^#[0-9a-fA-F]{6}$/;

export async function POST(request: Request, { params }: Props) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!can(user, "settings")) return new Response("Forbidden", { status: 403 });
  const { code } = await params;
  if (!await getCertificateDesignTemplate(code)) return new Response("Not found", { status: 404 });
  const form = await request.formData();
  const value = (key: string) => String(form.get(key) ?? "").trim();
  const input = {
    standard_label: value("standardLabel"),
    heading: value("heading"),
    opening_text: value("openingText"),
    conformity_text: value("conformityText"),
    scope_heading: value("scopeHeading"),
    clarification_text: value("clarificationText"),
    footer_text: value("footerText"),
    primary_color: value("primaryColor"),
    accent_color: value("accentColor"),
  };
  const templateUrl = `/admin/templates/${encodeURIComponent(code)}`;
  if (Object.values(input).some((text) => !text || text.length > 600) ||
    !colorPattern.test(input.primary_color) || !colorPattern.test(input.accent_color)) {
    return seeOther(`${templateUrl}?error=1`);
  }
  await updateCertificateDesignTemplate(code, input);
  return seeOther(`${templateUrl}?saved=1`);
}
