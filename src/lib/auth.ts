import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PersistentRateLimiter } from "@/lib/rate-limit-persistent";

// Limite de 10 tentativas por 15 min por (ip + email normalizado).
const loginLimiter = new PersistentRateLimiter({
  limit: 10,
  windowMs: 15 * 60_000,
  lockMs: 15 * 60_000,
});

// Limite de 20 tentativas por minuto por IP (sem lock, janela estrita).
const ipLimiter = new PersistentRateLimiter({
  limit: 20,
  windowMs: 60_000,
  lockMs: 60_000,
});

// Em produção na Vercel, usa VERCEL_URL se NEXTAUTH_URL não estiver configurada.
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

// Valida que NEXTAUTH_SECRET está definido — sem ele, JWT assinatura falha
if (!process.env.NEXTAUTH_SECRET) {
  console.error(
    "\n❌ CRÍTICO: NEXTAUTH_SECRET não está definido!\n" +
    "   A assinatura JWT será inconsistente entre API (Node.js) e middleware (Edge).\n" +
    "   Defina NEXTAUTH_SECRET no Vercel Dashboard (Environment Variables).\n"
  );
}

// Em produção, NEXTAUTH_URL não pode apontar para localhost
if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXTAUTH_URL?.startsWith("http://localhost")
) {
  console.error(
    "\n❌ CRÍTICO: NEXTAUTH_URL aponta para localhost em produção!\n" +
    `   Valor atual: ${process.env.NEXTAUTH_URL}\n` +
    "   No Vercel, defina NEXTAUTH_URL como a URL real do site OU deixe sem definir\n" +
    "   (o código usará VERCEL_URL como fallback).\n"
  );
}

const isDev = process.env.NODE_ENV !== "production";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email:    { label: "E-mail",  type: "email"    },
        password: { label: "Senha",   type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          if (isDev) console.log("[AUTH] missing credentials");
          return null;
        }

        const ip = (req as unknown as { headers?: Record<string, string> })?.headers?.["x-forwarded-for"]
          ?? (req as unknown as { headers?: Record<string, string> })?.headers?.["x-real-ip"]
          ?? "unknown";
        const ipKey = Array.isArray(ip) ? ip[0] : (ip.split(",")[0]?.trim() ?? "unknown");
        const emailKey = credentials.email.toLowerCase().trim();
        const limiterKey = `${ipKey}:${emailKey}`;

        try {
          const ipLimitCheck = await ipLimiter.check(`login:ip:${ipKey}`);
          if (!ipLimitCheck.ok) {
            if (isDev) console.log("[AUTH] IP rate limited", ipKey);
            return null;
          }

          const limitCheck = await loginLimiter.check(limiterKey);
          if (!limitCheck.ok) {
            if (isDev) console.log("[AUTH] login rate limited", limiterKey);
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: emailKey },
          });

          const DUMMY_HASH = "$2a$12$p8Wdb0qYgyCoHypcOifC6uUd8xkiW2GRm2BIzXBIW6AB3uh7S/WXC";
          const hashToCompare = user?.password ?? DUMMY_HASH;
          let isValid = false;
          try {
            isValid = await compare(credentials.password, hashToCompare);
          } catch {
            isValid = false;
          }

          if (!user || !isValid) {
            return null;
          }

          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (err) {
          console.error("[AUTH] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id   = token.id as string;
        (session.user as { id?: string; role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
