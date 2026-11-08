import { withApi, ok } from "@/lib/http";
import { prisma } from "@/lib/db";
import { requireArtisan } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/errors";

/** GET /api/me/batches/:code – chi tiết lô của xưởng mình. */
export const GET = withApi<{ params: Promise<{ code: string }> }>(async (_req, { params }) => {
  const user = await requireArtisan();
  const batch = await prisma.productBatch.findUnique({ where: { batchCode: (await params).code } });
  if (!batch || batch.artisanId !== user.artisanId) throw new NotFoundError("Không tìm thấy lô.");
  return ok(batch);
});
