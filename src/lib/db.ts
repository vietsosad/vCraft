import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient dùng chung (Singleton).
 * Khi chạy `next dev`, module được nạp lại liên tục nên ta giữ instance trên globalThis
 * để không mở quá nhiều kết nối tới PostgreSQL.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG === "query" ? ["query", "warn", "error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
