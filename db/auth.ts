import { database } from "./postgres";
import { ensureDatabase } from "./runtime";

export const roles = ["admin", "operator", "reviewer", "viewer"] as const;
export type Role = (typeof roles)[number];
export type AdminUser = { id: string; name: string; email: string; role: Role; active: number };
export type Permission = "create" | "prepare" | "review" | "print" | "users" | "settings";

export function can(user: AdminUser, permission: Permission): boolean {
  if (user.role === "admin") return true;
  if (user.role === "operator") return ["create", "prepare", "print"].includes(permission);
  if (user.role === "reviewer") return permission === "review";
  return false;
}

export function validRole(value: string): value is Role {
  return roles.includes(value as Role);
}

const ITERATIONS = 600_000;
const SESSION_MS = 8 * 60 * 60 * 1000;

function hex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function unhex(value: string): Uint8Array {
  return new Uint8Array(value.match(/.{2}/g)?.map((part) => parseInt(part, 16)) ?? []);
}

async function digest(value: string): Promise<string> {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

async function passwordHash(password: string, salt = hex(crypto.getRandomValues(new Uint8Array(16)))): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unhex(salt) as BufferSource, iterations: ITERATIONS }, key, 256);
  return `pbkdf2-sha256:${ITERATIONS}:${salt}:${hex(new Uint8Array(bits))}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, iterations, salt, expected] = stored.split(":");
  if (algorithm !== "pbkdf2-sha256" || !/^\d+$/.test(iterations) || Number(iterations) < 100_000 || Number(iterations) > 2_000_000 || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{64}$/.test(expected)) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unhex(salt) as BufferSource, iterations: Number(iterations) }, key, 256);
  const actual = hex(new Uint8Array(bits));
  let mismatch = 0;
  for (let index = 0; index < actual.length; index++) mismatch |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  return mismatch === 0;
}

export function validPassword(password: string): boolean {
  return password.length >= 12 && password.length <= 128;
}

export async function userCount(): Promise<number> {
  await ensureDatabase();
  await bootstrapConfiguredAdmin();
  const row = await database.prepare("SELECT COUNT(*) AS count FROM admin_users").first<{ count: string }>();
  return Number(row?.count ?? 0);
}

export async function listUsers(): Promise<AdminUser[]> {
  await ensureDatabase();
  const rows = await database.prepare("SELECT id, name, email, role, active FROM admin_users ORDER BY created_at, name").all<AdminUser>();
  return rows.results;
}

export async function addUser(input: { name: string; email: string; role: Role; password: string }, initial = false): Promise<void> {
  if (!input.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || !validPassword(input.password)) throw new Error("Invalid account details.");
  await ensureDatabase();
  const hash = await passwordHash(input.password);
  const query = initial
    ? "INSERT INTO admin_users (id, name, email, role, password_hash, active, created_at) SELECT ?, ?, ?, 'admin', ?, 1, ? WHERE NOT EXISTS (SELECT 1 FROM admin_users) RETURNING id"
    : "INSERT INTO admin_users (id, name, email, role, password_hash, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?) RETURNING id";
  const values = initial
    ? [crypto.randomUUID(), input.name.trim(), input.email.trim().toLowerCase(), hash, new Date().toISOString()]
    : [crypto.randomUUID(), input.name.trim(), input.email.trim().toLowerCase(), input.role, hash, new Date().toISOString()];
  const row = await database.prepare(query).bind(...values).first<{ id: string }>();
  if (!row) throw new Error("Initial account already exists.");
}

export async function authenticate(email: string, password: string): Promise<AdminUser | null> {
  await ensureDatabase();
  await bootstrapConfiguredAdmin();
  const row = await database.prepare("SELECT id, name, email, role, active, password_hash FROM admin_users WHERE email = ? AND active = 1")
    .bind(email.trim().toLowerCase()).first<AdminUser & { password_hash: string }>();
  if (!row || !(await verifyPassword(password, row.password_hash))) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role, active: row.active };
}

async function bootstrapConfiguredAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || !process.env.AUTH_SECRET) return;
  const existing = await database.prepare("SELECT 1 AS found FROM admin_users LIMIT 1").first<{ found: number }>();
  if (existing) return;
  await database.prepare("INSERT INTO admin_users (id, name, email, role, password_hash, active, created_at) SELECT ?, ?, ?, 'admin', ?, 1, ? WHERE NOT EXISTS (SELECT 1 FROM admin_users) ON CONFLICT DO NOTHING")
    .bind(crypto.randomUUID(), "Prudential Admin", email, await passwordHash(password), new Date().toISOString()).run();
}

export async function createSession(userId: string): Promise<string> {
  await ensureDatabase();
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await database.prepare("INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await digest(token), userId, new Date(Date.now() + SESSION_MS).toISOString()).run();
  return token;
}

export async function userFromSession(token: string): Promise<AdminUser | null> {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  await ensureDatabase();
  return database.prepare("SELECT u.id, u.name, u.email, u.role, u.active FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1")
    .bind(await digest(token), new Date().toISOString()).first<AdminUser>();
}

export async function deleteSession(token: string): Promise<void> {
  if (!/^[a-f0-9]{64}$/.test(token)) return;
  await ensureDatabase();
  await database.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(await digest(token)).run();
}

export async function updateUser(id: string, actorId: string, role: Role, active: boolean, newPassword: string): Promise<void> {
  await ensureDatabase();
  const existing = await database.prepare("SELECT role, active FROM admin_users WHERE id = ?").bind(id).first<{ role: Role; active: number }>();
  if (!existing) throw new Error("User not found.");
  if (id === actorId && (role !== "admin" || !active)) throw new Error("You cannot remove your own admin access.");
  if (existing.role === "admin" && existing.active && (role !== "admin" || !active)) {
    const count = await database.prepare("SELECT COUNT(*) AS count FROM admin_users WHERE role = 'admin' AND active = 1").first<{ count: string }>();
    if (Number(count?.count ?? 0) <= 1) throw new Error("Keep at least one active admin.");
  }
  if (newPassword && !validPassword(newPassword)) throw new Error("Password must be 12 to 128 characters.");
  if (newPassword) {
    await database.prepare("UPDATE admin_users SET role = ?, active = ?, password_hash = ? WHERE id = ?")
      .bind(role, Number(active), await passwordHash(newPassword), id).run();
    await database.prepare("DELETE FROM admin_sessions WHERE user_id = ?").bind(id).run();
  } else {
    await database.prepare("UPDATE admin_users SET role = ?, active = ? WHERE id = ?").bind(role, Number(active), id).run();
    if (!active) await database.prepare("DELETE FROM admin_sessions WHERE user_id = ?").bind(id).run();
  }
}

export async function changeOwnPassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
  if (!validPassword(newPassword)) throw new Error("Password must be 12 to 128 characters.");
  await ensureDatabase();
  const row = await database.prepare("SELECT password_hash FROM admin_users WHERE id = ? AND active = 1").bind(id).first<{ password_hash: string }>();
  if (!row || !(await verifyPassword(currentPassword, row.password_hash))) throw new Error("Current password is incorrect.");
  await database.prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?").bind(await passwordHash(newPassword), id).run();
  await database.prepare("DELETE FROM admin_sessions WHERE user_id = ?").bind(id).run();
}
