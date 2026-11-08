import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireArtisan, requireRole, requireUser } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/errors";
import { acceptSchema, bidSchema, versionedActionSchema } from "@/lib/validators/quote";
import { z } from "zod";
import {
  acceptBids,
  cancelQuote,
  getAllocationSuggestion,
  inviteArtisans,
  markDelivered,
  sendQuote,
  startProduction,
  submitBid,
} from "@/lib/services/quotation-service";

type Ctx = { params: Promise<{ code: string; action: string }> };

/**
 * POST /api/quotes/:code/:action – các hành động chuyển trạng thái của luồng báo giá.
 *   send · bids · accept · start-production · deliver · cancel · invite
 */
export const POST = withApi<Ctx>(async (req, { params }) => {
  assertSameOrigin(req);
  const { code, action } = await params;

  switch (action) {
    case "send": {
      const user = await requireRole("BUYER", "ADMIN");
      const { expectedVersion } = await parseBody(req, versionedActionSchema);
      const result = await sendQuote(user, code, expectedVersion);
      return ok({ status: result.quote.status, version: result.quote.version, invited: result.invited });
    }
    case "bids": {
      const user = await requireArtisan({ verified: true });
      const input = await parseBody(req, bidSchema);
      return ok(await submitBid(user, code, input), { status: 201 });
    }
    case "accept": {
      const user = await requireRole("BUYER", "ADMIN");
      const input = await parseBody(req, acceptSchema);
      return ok({ batches: await acceptBids(user, code, input) });
    }
    case "start-production": {
      const user = await requireRole("BUYER", "ADMIN");
      const { expectedVersion } = await parseBody(req, versionedActionSchema);
      await startProduction(user, code, expectedVersion);
      return ok({ status: "IN_PRODUCTION" });
    }
    case "deliver": {
      const user = await requireRole("BUYER", "ADMIN");
      const { expectedVersion } = await parseBody(req, versionedActionSchema);
      await markDelivered(user, code, expectedVersion);
      return ok({ status: "DELIVERED" });
    }
    case "cancel": {
      const user = await requireRole("BUYER", "ADMIN");
      const { expectedVersion, reason } = await parseBody(req, versionedActionSchema);
      await cancelQuote(user, code, expectedVersion, reason);
      return ok({ status: "CANCELLED" });
    }
    case "invite": {
      const user = await requireRole("ADMIN");
      const { artisanIds } = await parseBody(req, z.object({ artisanIds: z.array(z.string()).min(1) }));
      await inviteArtisans(user, code, artisanIds);
      return ok({ invited: artisanIds.length });
    }
    default:
      throw new NotFoundError("Hành động không tồn tại.");
  }
});

/** GET /api/quotes/:code/suggestion – gợi ý phân bổ tối ưu chi phí. */
export const GET = withApi<Ctx>(async (_req, { params }) => {
  const { code, action } = await params;
  if (action !== "suggestion") throw new NotFoundError();
  const user = await requireUser();
  return ok(await getAllocationSuggestion(user, code));
});
