import { z } from "zod";
import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireArtisan } from "@/lib/auth/guards";
import { bidUpdateSchema } from "@/lib/validators/quote";
import { updateBid, withdrawBid } from "@/lib/services/quotation-service";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/bids/:id – sửa chào giá, gửi kèm `version` đang xem (khóa lạc quan). */
export const PATCH = withApi<Ctx>(async (req, { params }) => {
  assertSameOrigin(req);
  const user = await requireArtisan({ verified: true });
  const input = await parseBody(req, bidUpdateSchema);
  return ok(await updateBid(user, (await params).id, input));
});

/** DELETE /api/bids/:id – rút chào giá khi yêu cầu chưa chốt. */
export const DELETE = withApi<Ctx>(async (req, { params }) => {
  assertSameOrigin(req);
  const user = await requireArtisan({ verified: true });
  const { version } = await parseBody(req, z.object({ version: z.number().int() }));
  await withdrawBid(user, (await params).id, version);
  return ok({ withdrawn: true });
});
