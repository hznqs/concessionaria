import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);
const isDev = process.env.NODE_ENV !== "production";

export async function middleware(req: NextRequest) {
  if (!process.env.NEXTAUTH_SECRET) {
    if (isDev) console.error("[AUTH:middleware] NEXTAUTH_SECRET não definido!");
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const role = (token as { role?: string }).role;
  if (!role || !ADMIN_ROLES.has(role)) {
    if (isDev) console.log("[AUTH:middleware] Role não autorizada", { role, path: req.nextUrl.pathname });
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*"],
};
