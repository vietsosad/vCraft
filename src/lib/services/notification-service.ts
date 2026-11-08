import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

type Db = PrismaClient | Prisma.TransactionClient;

export type NotificationInput = {
  type: string;
  title: string;
  body: string;
  link?: string;
};

/** Gửi thông báo trong ứng dụng tới một hoặc nhiều người dùng. */
export async function notify(userIds: string | string[], input: NotificationInput, db: Db = prisma) {
  const ids = [...new Set(Array.isArray(userIds) ? userIds : [userIds])];
  if (ids.length === 0) return;
  await db.notification.createMany({
    data: ids.map((userId) => ({ userId, ...input })),
  });
}

/** Gửi thông báo tới toàn bộ Ban quản lý. */
export async function notifyAdmins(input: NotificationInput, db: Db = prisma) {
  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await notify(admins.map((a) => a.id), input, db);
}

/** Gửi thông báo tới chủ của các xưởng (theo artisanId). */
export async function notifyArtisans(artisanIds: string[], input: NotificationInput, db: Db = prisma) {
  if (artisanIds.length === 0) return;
  const owners = await db.artisanProfile.findMany({ where: { id: { in: artisanIds } }, select: { userId: true } });
  await notify(owners.map((o) => o.userId), input, db);
}
