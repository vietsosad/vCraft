import { withApi, ok, parseQuery } from "@/lib/http";
import { availabilityQuery } from "@/lib/validators/engagement";
import { availability } from "@/lib/services/engagement-service";

/** GET /api/workshops/:slug/availability?date=YYYY-MM-DD – khung giờ trải nghiệm còn chỗ. */
export const GET = withApi<{ params: Promise<{ slug: string }> }>(async (req, { params }) => {
  const { date } = parseQuery(req, availabilityQuery);
  return ok(await availability((await params).slug, date));
});
