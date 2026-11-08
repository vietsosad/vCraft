import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireRole } from "@/lib/auth/guards";
import { newsInputSchema } from "@/lib/validators/news";
import { createNews } from "@/lib/services/admin-service";

/** POST /api/admin/news – đăng tin cộng đồng (tin khẩn tự thông báo tới các hộ). */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const admin = await requireRole("ADMIN");
  const input = await parseBody(req, newsInputSchema);
  return ok(await createNews(admin, input), { status: 201 });
});
