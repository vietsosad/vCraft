import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { GLAZES } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import { asImage, asImages } from "@/lib/types";
import { getOpenState } from "@/lib/opening-hours";
import { VImage } from "@/components/ui/vimage";
import { FavoriteButton } from "@/components/engagement/favorite-button";
import { Band, BandHead } from "@/components/weave/band";
import { LaidPiece } from "@/components/weave/goods";
import { WovenBadge } from "@/components/weave/woven";
import { cn } from "@/lib/cn";

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
          artisan: { select: { workshopName: true, slug: true } },
        },
      },
      artisan: true,
    },
  });
  const products = rows.flatMap((r) => (r.product?.isPublished ? [r.product] : []));
  const workshops = rows.flatMap((r) => (r.artisan ? [r.artisan] : []));

  return (
    <div data-hue="n5">
      <BandHead
        hue="n5"
        title={products.length ? "tác phẩm đã lưu" : "Đã lưu"}
        description="Tác phẩm bạn yêu thích và những xưởng bạn muốn ghé lại."
        count={products.length}
        actions={<Link href="/products" className="btn-moc">Vào phòng triển lãm</Link>}
      />
      {products.length === 0 && workshops.length === 0 ? (
        <div className="account-container py-10">
          <p className="max-w-xl text-lg">Chưa lưu gì. Trong phòng triển lãm, bấm trái tim trên tác phẩm hoặc gian trưng bày của xưởng.</p>
        </div>
      ) : (
        <>
          {products.length > 0 && (
            <Band hue="n5" tone="quiet" label="Tác phẩm" bodyClassName="pt-8">
              <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <li key={p.id} data-reveal="weave" className="flex flex-col">
                    <div className="relative mx-auto w-full max-w-[15rem]">
                      <LaidPiece href={`/products/${p.slug}`} name={p.name} image={asImages(p.images)[0]} sizes="(max-width: 768px) 45vw, 22vw" />
                      <FavoriteButton productId={p.id} initial canFavorite className="absolute right-1.5 top-1.5 z-10" />
                    </div>
                    <div className="mx-auto mt-4 w-full max-w-[15rem]">
                      <p className="line-clamp-2 font-semibold leading-snug">
                        <Link href={`/products/${p.slug}`} className="hover:underline">{p.name}</Link>
                      </p>
                      <p className="soft mt-0.5 truncate text-xs">{p.artisan.workshopName} · {GLAZES[p.glazeType].short}</p>
                      <p className="so mt-1.5 text-lg">{formatVnd(p.priceVnd)}</p>
                      {p.isUniquePiece && <p className="nhan soft mt-1">Độc bản</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </Band>
          )}
          {workshops.length > 0 && (
            <div className="account-container pb-16 pt-8">
              <h2 className="mb-5 flex items-baseline gap-2">Xưởng <span className="nhan text-tro">{workshops.length}</span></h2>
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {workshops.map((w) => {
                  const open = getOpenState(w);
                  return (
                    <li key={w.id} data-reveal="weave">
                      <article className="patch group relative overflow-hidden">
                        <VImage image={asImage(w.coverImage)} ratio="16/10" sizes="(max-width: 768px) 100vw, 33vw" imgClassName="transition-transform duration-300 group-hover:scale-[1.03]" />
                        <div className="flex items-start gap-3 p-5">
                          <WovenBadge name={w.workshopName} size={48} tone="ink" className="text-chu-nau" />
                          <div className="min-w-0">
                            <h3 className="leading-snug">
                              <Link href={`/artisans/${w.slug}`} className="after:absolute after:inset-0">{w.workshopName}</Link>
                            </h3>
                            <p className="mt-0.5 text-sm text-tro">{w.artisanTitle} {w.artisanName} · đời thứ {w.generation}</p>
                            <p className={cn("mt-2 inline-flex items-center gap-1.5 text-xs font-semibold", open.isOpenNow ? "text-chu-nau" : "text-tro")}>
                              <span className={cn("size-2", open.isOpenNow ? "bg-nghe" : "bg-tro/50")} aria-hidden />
                              {open.label}
                            </p>
                          </div>
                        </div>
                        <FavoriteButton artisanId={w.id} initial canFavorite className="absolute right-2 top-2 z-10" />
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
