import { z } from "zod";
import { withApi, ok, parseBody, parseQuery, assertSameOrigin } from "@/lib/http";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

/** GET /api/notifications – thông báo của người dùng hiện tại và số chưa đọc. */
export const GET = withApi(async (req) => {
  const user = await requireUser();
  const { limit } = parseQuery(req, z.object({ limit: z.coerce.number().int().min(1).max(100).default(20) }));
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: limit }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return ok({ items, unread });
});

/** POST /api/notifications – đánh dấu đã đọc (một số id hoặc tất cả). */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const body = await parseBody(req, z.object({ ids: z.array(z.string()).optional(), all: z.boolean().optional() }));
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null, ...(body.all ? {} : { id: { in: body.ids ?? [] } }) },
    data: { readAt: new Date() },
  });
  return ok({ ok: true });
});
