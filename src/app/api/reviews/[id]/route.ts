import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireArtisan } from "@/lib/auth/guards";
import { reviewReplySchema } from "@/lib/validators/engagement";
import { replyReview } from "@/lib/services/engagement-service";

/** PATCH /api/reviews/:id – nghệ nhân trả lời đánh giá của xưởng mình. */
export const PATCH = withApi<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  assertSameOrigin(req);
  const user = await requireArtisan();
  const { reply } = await parseBody(req, reviewReplySchema);
  return ok(await replyReview(user, (await params).id, reply));
});
