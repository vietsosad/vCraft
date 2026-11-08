import { withApi, ok, parseBody, assertSameOrigin } from "@/lib/http";
import { prisma } from "@/lib/db";
import { requireArtisan } from "@/lib/auth/guards";
import { workshopUpdateSchema } from "@/lib/validators/catalog";
import { toSearchText, cleanText } from "@/lib/text";
import { GLAZES } from "@/lib/constants";
import type { GlazeType } from "@prisma/client";

/** GET /api/me/workshop – hồ sơ xưởng của nghệ nhân đang đăng nhập. */
export const GET = withApi(async () => {
  const user = await requireArtisan();
  return ok(await prisma.artisanProfile.findUniqueOrThrow({ where: { id: user.artisanId }, omit: { nationalIdEnc: true } }));
});

/** PATCH /api/me/workshop – cập nhật hồ sơ xưởng (chỉ của chính mình). */
export const PATCH = withApi(async (req) => {
  assertSameOrigin(req);
  const user = await requireArtisan();
  const input = await parseBody(req, workshopUpdateSchema);
  const updated = await prisma.artisanProfile.update({
    where: { id: user.artisanId },
    data: {
      ...input,
      workshopName: cleanText(input.workshopName),
      tagline: input.tagline || null,
      specialties: input.specialties as GlazeType[],
      coverImage: input.workshopImages[0] ?? undefined,
      searchText: toSearchText(
        input.workshopName,
        input.artisanName,
        input.tagline,
        ...input.specialties.map((s) => GLAZES[s as GlazeType].label),
      ),
    },
    omit: { nationalIdEnc: true },
  });
  return ok(updated);
});
