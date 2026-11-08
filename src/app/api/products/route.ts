import { withApi, ok, parseQuery } from "@/lib/http";
import { productQuerySchema } from "@/lib/validators/catalog";
import { listProducts } from "@/lib/services/catalog-service";

/** GET /api/products – danh sách sản phẩm có lọc, sắp xếp, phân trang (JSON). */
export const GET = withApi(async (req) => {
  const query = parseQuery(req, productQuerySchema);
  const result = await listProducts(query);
  return ok(result.items, { meta: { total: result.total, page: result.page, pageSize: result.pageSize, pageCount: result.pageCount } });
});
