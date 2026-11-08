import { z } from "zod";
import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { prisma } from "@/lib/db";
import { requireArtisan } from "@/lib/auth/guards";
import { getOpenState } from "@/lib/opening-hours";

/** POST /api/me/open-status – bật/tắt nhận khách tham quan; bản đồ cập nhật ngay. */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireArtisan();
  const { isOpenForVisit } = await parseBody(req, z.object({ isOpenForVisit: z.boolean() }));
  const w = await prisma.artisanProfile.update({
    where: { id: user.artisanId },
    data: { isOpenForVisit },
    select: { isOpenForVisit: true, openingHours: true, openDays: true },
  });
  return ok({ ...w, openState: getOpenState(w) });
});
