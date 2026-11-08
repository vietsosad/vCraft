import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

type Db = PrismaClient | Prisma.TransactionClient;

/** Ghi nhật ký thao tác quan trọng (duyệt hộ, khóa tài khoản, đăng tin, chốt đơn…). */
export async function audit(
  actorId: string | null,
  action: string,
  entity: string,
  entityId: string,
  meta: Prisma.InputJsonValue = {},
  db: Db = prisma,
) {
  await db.auditLog.create({ data: { actorId, action, entity, entityId, meta } });
}
