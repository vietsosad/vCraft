import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireArtisan } from "@/lib/auth/guards";
import { productInputSchema } from "@/lib/validators/catalog";
import { deleteProduct, getOwnProduct, updateProduct } from "@/lib/services/product-service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi<Ctx>(async (_req, { params }) => {
  const user = await requireArtisan();
  return ok(await getOwnProduct(user.artisanId, (await params).id));
});

/** PATCH /api/me/products/:id – chỉ sửa được sản phẩm thuộc xưởng mình (chống IDOR). */
export const PATCH = withApi<Ctx>(async (req, { params }) => {
  assertSameOrigin(req);
  const user = await requireArtisan();
  const input = await parseBody(req, productInputSchema);
  return ok(await updateProduct(user, (await params).id, input));
});

export const DELETE = withApi<Ctx>(async (req, { params }) => {
  assertSameOrigin(req);
  const user = await requireArtisan();
  await deleteProduct(user.artisanId, (await params).id);
  return ok({ deleted: true });
});
