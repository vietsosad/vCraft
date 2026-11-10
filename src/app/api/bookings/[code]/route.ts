import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { requireUser } from "@/lib/auth/guards";
import { bookingActionSchema } from "@/lib/validators/engagement";
import { actOnBooking } from "@/lib/services/engagement-service";

/** PATCH /api/bookings/:code – xưởng xác nhận/từ chối/hoàn tất, khách hủy. Có khóa lạc quan theo version. */
export const PATCH = withApi<{ params: Promise<{ code: string }> }>(async (req, { params }) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const { action, note, version } = await parseBody(req, bookingActionSchema);
  return ok(await actOnBooking(user, (await params).code, action, version, note || undefined));
});
