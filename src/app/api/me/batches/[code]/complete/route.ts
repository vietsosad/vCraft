import { withApi, ok, assertSameOrigin } from "@/lib/http";
import { requireArtisan } from "@/lib/auth/guards";
import { completeBatch } from "@/lib/services/batch-service";

/** POST /api/me/batches/:code/complete – hoàn tất và khóa nhật ký lô. */
export const POST = withApi<{ params: Promise<{ code: string }> }>(async (req, { params }) => {
  assertSameOrigin(req);
  const user = await requireArtisan();
  await completeBatch(user.artisanId, (await params).code);
  return ok({ completed: true });
});
