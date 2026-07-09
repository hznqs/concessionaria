import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

export type AdminSession = NonNullable<Awaited<ReturnType<typeof getServerSession<NextAuthOptions>>>>;

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

/**
 * Garante que a requisição tem sessao autenticada com role admin/super_admin.
 * Retorna a sessao ou null (para quem chama responder 401/403).
 */
export async function requireAdmin(): Promise<AdminSession | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const role = (session.user as { role?: string } | undefined)?.role;
  if (!role || !ADMIN_ROLES.has(role)) return null;
  return session;
}

export function isAdminRole(role: string | undefined | null): boolean {
  return !!role && ADMIN_ROLES.has(role);
}

/**
 * CSRF protection for state-changing API routes.
 * Requires custom header `x-requested-by: autoprime` on all non-GET requests.
 * Throws on invalid requests — caller should catch and return 403.
 */
export function requireCsrf(request: NextRequest): void {
  if (request.method === 'GET' || request.method === 'HEAD') return;
  const requestedBy = request.headers.get('x-requested-by');
  if (requestedBy !== 'autoprime') {
    throw new Error('CSRF validation failed');
  }
}