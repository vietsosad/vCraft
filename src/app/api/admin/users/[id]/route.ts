import { z } from "zod";
import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireRole } from "@/lib/auth/guards";
import { setUserSuspended } from "@/lib/services/admin-service";

/** PATCH /api/admin/users/:id – tạm khóa hoặc mở khóa tài khoản. */
export const PATCH = withApi<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  assertSameOrigin(req);
  const admin = await requireRole("ADMIN");
  const { suspended, reason } = await parseBody(req, z.object({ suspended: z.boolean(), reason: z.string().trim().max(300).optional() }));
  await setUserSuspended(admin, (await params).id, suspended, reason);
  return ok({ suspended });
});
