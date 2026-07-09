import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from "@prisma/client";
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient;
  pool: Pool;
};

const connectionString = `${process.env.DATABASE_URL}`;

// Em desenvolvimento, o Next.js dá hot-reload e destrói o Pool se não salvarmos no global
const pool = globalForPrisma.pool ?? new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
