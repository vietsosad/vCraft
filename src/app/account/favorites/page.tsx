import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { asImage, asImages } from "@/lib/types";
import { getOpenState } from "@/lib/opening-hours";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { ProductCard } from "@/components/exhibition/product-card";
import { ArtisanCard } from "@/components/exhibition/artisan-card";

export const metadata: Metadata = { title: "Đã lưu" };
export const dynamic = "force-dynamic";

export default async function AccountFavorites() {
  const user = await pageRequireRole("/account/favorites", "BUYER");
  const rows = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true, slug: true, name: true, glazeType: true, priceVnd: true, isUniquePiece: true, images: true, isPublished: true,
          artisan: { select: { workshopName: true, slug: true } }, currentBatch: { select: { batchCode: true } },
        },
      },
      artisan: true,
    },
  });
  const products = rows.flatMap((r) => (r.product?.isPublished ? [r.product] : []));
  const workshops = rows.flatMap((r) => (r.artisan ? [r.artisan] : []));

  return (
    <>
      <PageHeader title="Đã lưu" description="Tác phẩm và xưởng bạn muốn quay lại. Bấm trái tim lần nữa để bỏ lưu." />
      {rows.length === 0 ? (
        <EmptyState icon={<Heart />} title="Chưa lưu gì" description="Trong phòng triển lãm, bấm biểu tượng trái tim trên tác phẩm hoặc gian trưng bày của xưởng." action={<ButtonLink href="/products">Vào phòng triển lãm</ButtonLink>} />
      ) : (
        <div className="space-y-12">
          {products.length > 0 && (
            <section>
              <h2 className="label mb-4">Tác phẩm ({products.length})</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} p={{ ...p, image: asImages(p.images)[0] ?? null }} favorite={{ on: true, can: true }} />
                ))}
              </div>
            </section>
          )}
          {workshops.length > 0 && (
            <section>
              <h2 className="label mb-4">Xưởng ({workshops.length})</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workshops.map((w) => (
                  <ArtisanCard key={w.id} a={{ ...w, coverImage: asImage(w.coverImage), openState: getOpenState(w) }} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
