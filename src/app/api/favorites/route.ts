import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireRole } from "@/lib/auth/guards";
import { favoriteSchema } from "@/lib/validators/engagement";
import { favoriteIds, toggleFavorite } from "@/lib/services/engagement-service";

/** GET /api/favorites – id các sản phẩm và xưởng khách đã lưu. */
export const GET = withApi(async () => {
  const user = await requireRole("BUYER");
  return ok(await favoriteIds(user.id));
});

/** POST /api/favorites – bật/tắt yêu thích { productId } hoặc { artisanId }. */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireRole("BUYER");
  const input = await parseBody(req, favoriteSchema);
  return ok(await toggleFavorite(user.id, input));
});
