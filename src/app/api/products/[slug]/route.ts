import { withApi, ok } from "@/lib/http";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

/** GET /api/products/:slug – chi tiết một sản phẩm công khai. */
export const GET = withApi<{ params: Promise<{ slug: string }> }>(async (_req, { params }) => {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true, artisan: { verificationStatus: "APPROVED", user: { status: "ACTIVE" } } },
    include: {
      artisan: { select: { slug: true, workshopName: true, artisanName: true, artisanTitle: true } },
      currentBatch: { select: { batchCode: true, batchTitle: true, status: true } },
    },
  });
  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm.");
  return ok(product);
});
