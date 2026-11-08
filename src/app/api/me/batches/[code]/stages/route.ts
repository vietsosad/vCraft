import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireArtisan } from "@/lib/auth/guards";
import { stageInputSchema } from "@/lib/validators/batch";
import { addStage } from "@/lib/services/batch-service";

/** POST /api/me/batches/:code/stages – thêm mốc công đoạn có ảnh minh chứng. */
export const POST = withApi<{ params: Promise<{ code: string }> }>(async (req, { params }) => {
  assertSameOrigin(req);
  const user = await requireArtisan();
  const input = await parseBody(req, stageInputSchema);
  return ok(await addStage(user.artisanId, user.id, (await params).code, input), { status: 201 });
});
