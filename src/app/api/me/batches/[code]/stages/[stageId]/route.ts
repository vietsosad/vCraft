import { withApi, ok, assertSameOrigin } from "@/lib/http";
import { requireArtisan } from "@/lib/auth/guards";
import { removeStage } from "@/lib/services/batch-service";

/** DELETE /api/me/batches/:code/stages/:stageId – xóa mốc (409 nếu lô đã khóa). */
export const DELETE = withApi<{ params: Promise<{ code: string; stageId: string }> }>(async (req, { params }) => {
  assertSameOrigin(req);
  const user = await requireArtisan();
  const { code, stageId } = await params;
  await removeStage(user.artisanId, code, stageId);
  return ok({ deleted: true });
});
