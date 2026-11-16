import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { GLAZES } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import { asImage, asImages } from "@/lib/types";
import { getOpenState } from "@/lib/opening-hours";
import { ButtonLink } from "@/components/ui/button";
import { VImage } from "@/components/ui/vimage";
import { FavoriteButton } from "@/components/engagement/favorite-button";
import { DrawerHead, ShelfTitle } from "@/components/cabinet/drawer-head";
import { ShelfPiece } from "@/components/cabinet/shelf-piece";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Kệ đã lưu" };
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
    <>
      <DrawerHead
        title="Kệ đã lưu"
        description="Những tác phẩm và xưởng bạn muốn quay lại. Bấm trái tim lần nữa để cất khỏi kệ."
        actions={<ButtonLink href="/products" variant="outline">Vào phòng triển lãm</ButtonLink>}
      />
      {rows.length === 0 ? (
        <div className="max-w-2xl">
          <p className="mb-4 font-serif text-xl">Kệ còn trống. Trong phòng triển lãm, bấm trái tim trên tác phẩm hoặc gian trưng bày của xưởng để đặt lên kệ.</p>
          <div className="shelf-board" />
        </div>
      ) : (
        <div className="space-y-14">
          {products.length > 0 && (
            <section aria-label="Tác phẩm">
              <ShelfTitle count={products.length}>Tác phẩm</ShelfTitle>
              {/* Mỗi tầng kệ bốn món (hai món trên điện thoại); tên món treo trên thẻ giấy dưới mặt kệ */}
              <ul className="grid grid-cols-2 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((p, i) => (
                  <li key={p.id} className="relative flex flex-col" data-reveal style={{ ["--d" as string]: `${(i % 4) * 60}ms` }}>
                    <div className="relative mx-3 mt-6 sm:mx-6">
                      <ShelfPiece href={`/products/${p.slug}`} name={p.name} image={asImages(p.images)[0]} sizes="(max-width: 768px) 45vw, 22vw" />
                      <FavoriteButton productId={p.id} initial canFavorite className="absolute right-1.5 top-1.5 z-10" />
                    </div>
                    <div className="shelf-board rounded-none" aria-hidden />
                    <div className="mx-3 mt-2.5 sm:mx-6">
                      <p className="line-clamp-2 font-serif text-[1.05rem] font-bold leading-snug">
                        <Link href={`/products/${p.slug}`} className="hover:text-lam">{p.name}</Link>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-tro">{p.artisan.workshopName} · {GLAZES[p.glazeType].short}</p>
                      <p className="mt-0.5 text-sm font-semibold tabular">{p.isUniquePiece ? "Độc bản · " : ""}{formatVnd(p.priceVnd)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {workshops.length > 0 && (
            <section aria-label="Xưởng">
              <ShelfTitle count={workshops.length}>Xưởng</ShelfTitle>
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {workshops.map((w, i) => {
                  const open = getOpenState(w);
                  return (
                    <li key={w.id} data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
                      {/* Bảng hiệu xưởng: ảnh xưởng trên, tấm biển sơn then khắc tên dưới */}
                      <article className="group relative overflow-hidden rounded-[6px] shadow-[0_18px_30px_-22px_rgb(28_18_12/0.7)]">
                        <VImage image={asImage(w.coverImage)} ratio="16/10" sizes="(max-width: 768px) 100vw, 33vw" imgClassName="transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out-expo)] group-hover:scale-105" />
                        <div className="lacquer relative px-4 pb-3.5 pt-3 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-chi)_70%,transparent)]">
                          <h3 className="font-display text-[1.3rem] leading-tight text-chi-nhat">
                            <Link href={`/artisans/${w.slug}`} className="after:absolute after:inset-0">{w.workshopName}</Link>
                          </h3>
                          <p className="mt-0.5 text-sm text-giay/70">{w.artisanTitle} {w.artisanName} · đời thứ {w.generation}</p>
                          <p className={cn("mt-2 inline-flex items-center gap-1.5 text-xs font-semibold", open.isOpenNow ? "text-[#9fd4bf]" : "text-giay/55")}>
                            <span className={cn("size-2 rounded-full", open.isOpenNow ? "bg-[#9fd4bf]" : "bg-giay/40")} aria-hidden />
                            {open.label}
                          </p>
                        </div>
                        <FavoriteButton artisanId={w.id} initial canFavorite className="absolute right-2 top-2 z-10" />
                      </article>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}
