export function seeOther(path: string): Response {
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Redirect must stay on this site.");
  return new Response(null, { status: 303, headers: { Location: path } });
}

export function hasSameHostOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
