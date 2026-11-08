import { z } from "zod";
import { withApi, ok, parseQuery } from "@/lib/http";
import { listWorkshops } from "@/lib/services/catalog-service";
import { prisma } from "@/lib/db";
import { GLAZE_KEYS } from "@/lib/constants";

const flag = z.enum(["1", "0"]).optional().transform((v) => v === "1");

/** GET /api/workshops – xưởng và điểm di sản cho bản đồ, kèm trạng thái mở cửa (giờ Việt Nam). */
export const GET = withApi(async (req) => {
  const q = parseQuery(
    req,
    z.object({
      openNow: flag,
      experience: flag,
      wholesale: flag,
      heritage: flag,
      glaze: z.enum(GLAZE_KEYS as [string, ...string[]]).optional(),
    }),
  );
  const [workshops, heritage] = await Promise.all([
    listWorkshops({ openNow: q.openNow, experience: q.experience, wholesale: q.wholesale, glaze: q.glaze }),
    q.heritage === false && new URL(req.url).searchParams.has("heritage") ? [] : prisma.heritageSite.findMany(),
  ]);
  return ok({ workshops, heritage });
});
