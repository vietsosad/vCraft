import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { GLAZES } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import { asImage, asImages } from "@/lib/types";
import { getOpenState } from "@/lib/opening-hours";
import { VImage } from "@/components/ui/vimage";
import { StatusMark } from "@/components/ui/primitives";
import { FavoriteButton } from "@/components/engagement/favorite-button";
import { Invite, LangHead, NUT, Shelf, hoaDau, soChu } from "@/components/lang/pieces";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Kệ trưng bày" };
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
      <LangHead
        icon="ke"
        title={products.length ? "tác phẩm trên kệ của bạn" : "Kệ trưng bày"}
        count={products.length}
        lead={
          <p>
            {products.length || workshops.length
              ? `Những món bạn thương${workshops.length ? ` và ${soChu(workshops.length)} xưởng bạn muốn ghé lại` : ""}. Bấm trái tim lần nữa để cất món đó khỏi kệ.`
              : "Trong phòng triển lãm, bấm trái tim trên tác phẩm hay gian trưng bày của xưởng: món đó sẽ đứng trên kệ sơn then này."}
          </p>
        }
        actions={<Link href="/products" className={NUT.lam}>Vào phòng triển lãm</Link>}
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-16 pt-9 md:px-6">
        {products.length === 0 && workshops.length === 0 ? (
          <Invite title="Kệ còn trống chờ món đầu tiên" action={<Link href="/products" className={NUT.lam}>Xem tác phẩm của làng</Link>}>
            <p>Bình men lam, chén men rạn, đĩa men ngọc: mỗi món trong phòng triển lãm đều ghi rõ xưởng làm, men gì và lô sản xuất nào.</p>
          </Invite>
        ) : (
          <>
            {products.length > 0 && (
              <section aria-labelledby="ke-tac-pham">
                <h2 id="ke-tac-pham" className="sr-only">Tác phẩm đã lưu</h2>
                <Shelf
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
                  items={products.map((p) => ({
                    key: p.id,
                    href: `/products/${p.slug}`,
                    name: p.name,
                    image: asImages(p.images)[0],
                    note: formatVnd(p.priceVnd),
                    sub: `${p.artisan.workshopName} · ${GLAZES[p.glazeType].short}${p.isUniquePiece ? " · độc bản" : ""}`,
                    extra: <FavoriteButton productId={p.id} initial canFavorite className="absolute right-0 top-1 z-10 !size-11" />,
                  }))}
                />
              </section>
            )}

            {workshops.length > 0 && (
              <section aria-labelledby="ke-xuong">
                <h2 id="ke-xuong" className="mb-5 flex flex-wrap items-baseline gap-x-3 font-serif text-[1.6rem] font-bold leading-tight giong-ke">
                  {hoaDau(soChu(workshops.length))} xưởng bạn muốn ghé lại
                </h2>
                <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {workshops.map((w, i) => {
                    const open = getOpenState(w);
                    return (
                      <li key={w.id} className="gan-vien" style={{ animationDelay: `${i * 90}ms` }}>
                        <article className="viec group relative h-full flex-col items-stretch gap-0 overflow-hidden p-0">
                          <VImage image={asImage(w.coverImage)} ratio="16/10" sizes="(max-width: 768px) 100vw, 33vw" imgClassName="transition-transform duration-500 group-hover:scale-[1.04]" />
                          <div className="p-5">
                            <h3 className="font-serif text-[1.3rem] font-bold leading-snug giong-ke">
                              <Link href={`/artisans/${w.slug}`} className="phu-ca after:absolute after:inset-0 focus-visible:outline-none">{w.workshopName}</Link>
                            </h3>
                            <p className="mt-0.5 text-sm text-tro">{w.artisanTitle} {w.artisanName} · đời thứ {w.generation}</p>
                            <p className={cn("mt-2.5 inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[13px] font-semibold", open.isOpenNow ? "bg-ngoc-nhat text-ngoc" : "bg-tro/10 text-tro")}>
                              <StatusMark mark={open.isOpenNow ? "dot" : "ring"} /> {open.label}
                            </p>
                          </div>
                          <FavoriteButton artisanId={w.id} initial canFavorite className="absolute right-2 top-2 z-10 !size-11" />
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
