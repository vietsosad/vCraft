import { z } from "zod";
import { withApi, ok, parseQuery } from "@/lib/http";
import { suggest } from "@/lib/services/catalog-service";

/** GET /api/search/suggest?q= – gợi ý tức thì (không dấu) cho ô tìm kiếm. */
export const GET = withApi(async (req) => {
  const { q } = parseQuery(req, z.object({ q: z.string().trim().max(60).default("") }));
  if (q.length < 2) return ok({ products: [], artisans: [] });
  return ok(await suggest(q));
});
