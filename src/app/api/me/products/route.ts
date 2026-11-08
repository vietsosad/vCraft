import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireArtisan } from "@/lib/auth/guards";
import { productInputSchema } from "@/lib/validators/catalog";
import { createProduct, listOwnProducts } from "@/lib/services/product-service";

/** GET /api/me/products – sản phẩm của xưởng mình (kể cả bản nháp). */
export const GET = withApi(async () => {
  const user = await requireArtisan();
  return ok(await listOwnProducts(user.artisanId));
});

/** POST /api/me/products – đăng sản phẩm (xưởng chưa được duyệt chỉ lưu được bản nháp). */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireArtisan();
  const input = await parseBody(req, productInputSchema);
  return ok(await createProduct(user, input), { status: 201 });
});
