import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireRole } from "@/lib/auth/guards";
import { newsInputSchema } from "@/lib/validators/news";
import { deleteNews, updateNews } from "@/lib/services/admin-service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi<Ctx>(async (req, { params }) => {
  assertSameOrigin(req);
  const admin = await requireRole("ADMIN");
  const input = await parseBody(req, newsInputSchema);
  return ok(await updateNews(admin, (await params).id, input));
});

export const DELETE = withApi<Ctx>(async (req, { params }) => {
  assertSameOrigin(req);
  const admin = await requireRole("ADMIN");
  await deleteNews(admin, (await params).id);
  return ok({ deleted: true });
});
