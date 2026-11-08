import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { prisma } from "@/lib/db";
import { requireArtisan } from "@/lib/auth/guards";
import { batchCreateSchema } from "@/lib/validators/batch";
import { createBatch } from "@/lib/services/batch-service";

/** GET /api/me/batches – các lô sản xuất của xưởng. */
export const GET = withApi(async () => {
  const user = await requireArtisan();
  const batches = await prisma.productBatch.findMany({
    where: { artisanId: user.artisanId },
    orderBy: { createdAt: "desc" },
    select: { id: true, batchCode: true, batchTitle: true, status: true, quantityProduced: true, scanCount: true, glazeType: true, createdAt: true },
  });
  return ok(batches);
});

/** POST /api/me/batches – mở lô mới, tự sinh mã lô và mã QR. */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireArtisan();
  const input = await parseBody(req, batchCreateSchema);
  return ok(await createBatch(user.artisanId, input), { status: 201 });
});
