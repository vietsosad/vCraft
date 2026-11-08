import { z } from "zod";
import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireRole } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/errors";
import { approveArtisan, rejectArtisan } from "@/lib/services/admin-service";

/** POST /api/admin/applications/:id/approve|reject – BQL kiểm duyệt hồ sơ hộ nghề. */
export const POST = withApi<{ params: Promise<{ id: string; action: string }> }>(async (req, { params }) => {
  assertSameOrigin(req);
  const admin = await requireRole("ADMIN");
  const { id, action } = await params;
  const { note } = await parseBody(req, z.object({ note: z.string().trim().max(500).optional() }));
  if (action === "approve") await approveArtisan(admin, id, note);
  else if (action === "reject") await rejectArtisan(admin, id, note ?? "");
  else throw new NotFoundError();
  return ok({ id, action });
});
