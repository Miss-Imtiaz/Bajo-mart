import { PrismaClient } from "@prisma/client";

// A single shared Prisma client, reused across the whole app.
// In development, Next.js reloads files often — without this pattern,
// every reload would open a brand new database connection.

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
