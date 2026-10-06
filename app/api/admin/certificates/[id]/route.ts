import { getAdminApiUser } from "../../../../admin-user";
import { setCertificateStatus } from "../../../../../db/runtime";
import { can } from "@/db/auth";
import { seeOther } from "@/lib/http";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const user = await getAdminApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const [{ id }, form] = await Promise.all([params, request.formData()]);
  const action = String(form.get("action") ?? "");
  const permission = action === "approve" || action === "changes_requested" ? "review" : action === "print" ? "print" : "prepare";
  if (!can(user, permission)) return new Response("Forbidden", { status: 403 });
  const issueDate = String(form.get("issueDate") ?? "");
  const checklist = ["applicationChecked", "legalChecked", "continuityChecked", "documentationChecked"].map((name) => form.has(name));
  try {
    await setCertificateStatus(id, action, issueDate || undefined, checklist);
    return seeOther(`/admin/certificates/${id}`);
  } catch {
    return seeOther(`/admin/certificates/${id}?error=1`);
  }
}
