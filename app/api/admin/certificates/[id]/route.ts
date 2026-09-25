import { getAdminApiUser } from "../../../../admin-user";
import { setCertificateStatus } from "../../../../../db/runtime";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  if (!(await getAdminApiUser())) return new Response("Unauthorized", { status: 401 });
  const [{ id }, form] = await Promise.all([params, request.formData()]);
  const action = String(form.get("action") ?? "");
  const issueDate = String(form.get("issueDate") ?? "");
  try {
    await setCertificateStatus(id, action, issueDate || undefined);
    return Response.redirect(new URL(`/admin/certificates/${id}`, request.url), 303);
  } catch {
    return Response.redirect(new URL(`/admin/certificates/${id}?error=1`, request.url), 303);
  }
}
