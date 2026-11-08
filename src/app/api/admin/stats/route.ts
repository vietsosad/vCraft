import { withApi, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth/guards";
import { getStats } from "@/lib/services/admin-service";

/** GET /api/admin/stats – số liệu tổng quan toàn làng. */
export const GET = withApi(async () => {
  await requireRole("ADMIN");
  return ok(await getStats());
});
