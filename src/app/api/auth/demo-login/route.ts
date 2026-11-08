import { z } from "zod";
import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

const PERSONA_EMAIL: Record<string, string | null> = {
  guest: null,
  buyer: "lan.uet@vcraft.test",
  artisan: "ongtu@vcraft.test",
  artisan2: "hungphat@vcraft.test",
  admin: "admin@vcraft.test",
};

/**
 * POST /api/auth/demo-login – chuyển vai trò nhanh khi demo vấn đáp.
 * Chỉ hoạt động khi DEMO_MODE=true. Vẫn tạo phiên thật nên mọi kiểm tra phân quyền giữ nguyên.
 */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  if (process.env.DEMO_MODE !== "true") throw new ForbiddenError("Chế độ demo đang tắt.");
  const { persona } = await parseBody(req, z.object({ persona: z.enum(["guest", "buyer", "artisan", "artisan2", "admin"]) }));

  await destroySession();
  const email = PERSONA_EMAIL[persona];
  if (!email) return ok({ persona });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundError("Chưa có dữ liệu demo. Hãy chạy `npm run db:seed`.");
  await createSession(user.id);
  return ok({ persona, name: user.name, role: user.role });
});
