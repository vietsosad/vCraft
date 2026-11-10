import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireRole } from "@/lib/auth/guards";
import { reviewSchema } from "@/lib/validators/engagement";
import { createReview } from "@/lib/services/engagement-service";

/** POST /api/reviews – khách đánh giá xưởng sau đơn sỉ đã giao hoặc buổi trải nghiệm đã xong. */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireRole("BUYER");
  const input = await parseBody(req, reviewSchema);
  return ok(await createReview(user, input), { status: 201 });
});
