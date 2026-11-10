import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireUser } from "@/lib/auth/guards";
import { bookingCreateSchema } from "@/lib/validators/engagement";
import { createBooking } from "@/lib/services/engagement-service";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** POST /api/bookings – khách đặt lịch trải nghiệm nặn gốm. */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireUser();
  rateLimit(`booking:${clientIp(req)}:${user.id}`, 10, 10 * 60 * 1000);
  const input = await parseBody(req, bookingCreateSchema);
  return ok(await createBooking(user, input), { status: 201 });
});
