export const roles = ["admin", "operator", "reviewer", "viewer"] as const;
export type Role = (typeof roles)[number];
export type AdminUser = { id: string; name: string; email: string; role: Role; active: number };
export type Permission = "create" | "prepare" | "review" | "print" | "users" | "settings";

export function can(user: AdminUser, permission: Permission): boolean {
  if (user.role === "admin") return true;
  if (user.role === "operator") return ["create", "prepare", "review", "print"].includes(permission);
  if (user.role === "reviewer") return permission === "review";
  return false;
}

export function validRole(value: string): value is Role {
  return roles.some((role) => role === value);
}
