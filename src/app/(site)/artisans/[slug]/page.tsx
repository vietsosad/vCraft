import type { Metadata } from "next";
import { RevealText } from "@/components/motion/reveal-text";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Award, Phone, Users, Factory, QrCode, Navigation } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { asImage, asImages, asCertifications, asStages } from "@/lib/types";
import { GLAZES } from "@/lib/constants";
import { getOpenState } from "@/lib/opening-hours";
import { favoriteIds } from "@/lib/services/engagement-service";
import { formatVnd, formatNumber, formatCoord, formatDate } from "@/lib/format";
import { VImage } from "@/components/ui/vimage";
import { Card, VerifiedSeal } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/exhibition/product-card";
import { Gallery } from "@/components/exhibition/gallery";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { FavoriteButton } from "@/components/engagement/favorite-button";
import { BookingWidget } from "@/components/engagement/booking-widget";
import { Stars } from "@/components/engagement/stars";
import { cn } from "@/lib/cn";

type Props = { params: Promise<{ slug: string }> };
const DAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

async function getWorkshop(slug: string) {
  return prisma.artisanProfile.findFirst({
    where: { slug, verificationStatus: "APPROVED", user: { status: "ACTIVE" } },
    omit: { nationalIdEnc: true, proofDocuments: true },
    include: {
      products: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, slug: true, name: true, glazeType: true, priceVnd: true, isUniquePiece: true, images: true, currentBatch: { select: { batchCode: true } } },
      },
      batches: { where: { quoteRequestId: null }, orderBy: { createdAt: "desc" }, take: 6 },
      reviews: { orderBy: { createdAt: "desc" }, take: 6, include: { author: { select: { name: true } }, booking: { select: { guests: true } } } },
      user: { select: { phone: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const w = await getWorkshop((await params).slug);
  return w ? { title: w.workshopName, description: w.tagline ?? w.familyHistory.slice(0, 150) } : { title: "Không tìm thấy xưởng" };
}

/** Gian trưng bày của một hộ nghề: câu chuyện, không gian xưởng, đặt lịch nặn gốm, đánh giá thật, tác phẩm. */
export default async function ArtisanPage({ params }: Props) {
  const w = await getWorkshop((await params).slug);
  if (!w) notFound();
  const user = await getCurrentUser();
  const fav = user?.role === "BUYER" ? await favoriteIds(user.id) : { products: [] as string[], artisans: [] as string[] };
  const canFav: boolean | "guest" = !user ? "guest" : user.role === "BUYER";
  const open = getOpenState(w);
  const cover = asImage(w.coverImage);
  // Không lặp ảnh: bìa riêng, hai viên ảnh ở đầu trang riêng, thư viện bắt đầu bằng ảnh chưa xuất hiện
  const rest = asImages(w.workshopImages).filter((g) => g.src !== cover?.src);
  const heroThumbs = rest.slice(0, 2);
  const gallery = rest.length > 2 ? [...rest.slice(2), ...heroThumbs] : rest;
  const certs = asCertifications(w.certifications);
  const me = user?.role === "BUYER" ? await prisma.user.findUnique({ where: { id: user.id }, select: { name: true, phone: true } }) : null;

  return (
    <>
      {/* Bức ghép đầu trang: ảnh bìa + ảnh xưởng + viên biển hiệu */}
      <section className="grout px-3 pb-8 pt-4 sm:px-4 md:px-6">
        <div className="mosaic mx-auto max-w-[1440px] grid-cols-6 md:grid-cols-12">
          <div className="tile animate-tile-set col-span-6 md:col-span-7 md:row-span-2" style={{ ["--d" as string]: "0ms" }}>
            <VImage image={cover} ratio="16/10" priority sizes="(max-width: 768px) 100vw, 58vw" className="h-full" imgClassName="h-full" />
          </div>
          <div className="tile tile-dat animate-tile-set col-span-6 flex flex-col justify-between gap-6 p-6 text-giay md:col-span-5 md:p-8" style={{ ["--d" as string]: "120ms" }}>
            <div>
              <div className="flex items-start justify-between gap-3">
                <RevealText as="h1" text={w.workshopName} delay={250} className="title-xl block !text-[clamp(2.4rem,5vw,4.4rem)]" />
                <FavoriteButton artisanId={w.id} initial={fav.artisans.includes(w.id)} canFavorite={canFav} className="shrink-0" />
              </div>
              <p className="mt-3 text-giay/85">
                {w.artisanTitle} {w.artisanName} · dòng họ {w.clanName} · đời thứ {w.generation} · từ năm {w.establishedYear}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="inline-flex items-center rounded-[4px] bg-giay px-2 py-1"><VerifiedSeal className="text-doson" /></span>
              {w.ratingCount > 0 && (
                <a href="#danh-gia" className="inline-flex items-center gap-2 rounded-[4px] bg-giay/12 px-2.5 py-1">
                  <Stars value={w.ratingAvg} /> <strong>{w.ratingAvg.toFixed(1)}</strong> · {w.ratingCount} đánh giá
                </a>
              )}
              <span className={cn("inline-flex items-center gap-2 rounded-[4px] px-2.5 py-1", open.isOpenNow ? "bg-[#2f5c4d]" : "bg-giay/12")}>
                <span className={cn("size-2 rounded-full", open.isOpenNow ? "animate-pulse bg-[#8fc7b1]" : "bg-giay/60")} aria-hidden /> {open.label}
              </span>
            </div>
          </div>
          {heroThumbs.map((g, i) => (
            <div key={g.src} className={cn("tile animate-tile-set col-span-3 hidden md:block", i === 0 ? "md:col-span-3" : "md:col-span-2")} style={{ ["--d" as string]: `${220 + i * 90}ms` }}>
              <VImage image={g} ratio="auto" sizes="25vw" className="h-full min-h-40" imgClassName="h-full" />
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-4 py-12 md:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <h2 className="title-md">Câu chuyện gia đình</h2>
          {w.tagline && <p className="mt-4 font-serif text-3xl italic leading-snug text-datnung">“{w.tagline}”</p>}
          <div className="prose-vcraft mt-4 text-[17px] leading-relaxed text-muc/85">
            {w.familyHistory.split("\n").map((para, i) => <p key={i}>{para}</p>)}
          </div>

          {gallery.length > 0 && (
            <section className="mt-14">
              <h2 className="title-md mb-5">Không gian xưởng</h2>
              <Gallery images={gallery} ratio="16/10" />
            </section>
          )}

          {w.experienceOffered && (
            <section id="dat-lich" className="mt-14 scroll-mt-28">
              <h2 className="title-md">Đặt lịch nặn gốm</h2>
              <p className="mb-6 mt-2 text-tro">
                {formatVnd(w.experiencePriceVnd)} mỗi khách, buổi 2 tiếng, tối đa {w.experienceCapacity} khách mỗi khung giờ. Đất, men và lò nung có sẵn; sản phẩm nung xong
                xưởng gửi về sau khoảng 10 ngày.
              </p>
              <Card className="p-5 md:p-6">
                <BookingWidget
                  artisanSlug={w.slug}
                  workshopName={w.workshopName}
                  openDays={w.isOpenForVisit ? w.openDays : []}
                  access={!user ? "guest" : user.role === "BUYER" ? "buyer" : "other"}
                  defaults={{ contactName: me?.name ?? "", contactPhone: me?.phone?.replace(/^\+84/, "0") ?? "" }}
                />
              </Card>
            </section>
          )}

          <section id="danh-gia" className="mt-14 scroll-mt-28">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="title-md">Khách nói gì</h2>
              {w.ratingCount > 0 && <p className="flex items-center gap-2 text-sm text-tro"><Stars value={w.ratingAvg} size="md" /> <strong className="text-lg text-muc">{w.ratingAvg.toFixed(1)}</strong> / 5 · {w.ratingCount} đánh giá</p>}
            </div>
            <p className="mt-2 text-sm text-tro">Chỉ khách đã ghé xưởng hoặc đã nhận đơn sỉ mới viết được đánh giá.</p>
            {w.reviews.length === 0 ? (
              <p className="mt-5 rounded-[var(--radius-tile)] bg-nga-dam p-5 text-sm text-tro">Xưởng chưa có đánh giá nào.</p>
            ) : (
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {w.reviews.map((r, i) => (
                  <li key={r.id} data-reveal style={{ ["--d" as string]: `${i * 60}ms` }} className="tile bg-su p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{r.author.name}</p>
                      <Stars value={r.rating} />
                    </div>
                    <p className="text-xs text-tro">{formatDate(r.createdAt)}{r.booking ? ` · trải nghiệm ${r.booking.guests} khách` : " · đơn sỉ"}</p>
                    <p className="mt-3 font-serif text-lg leading-snug">“{r.comment}”</p>
                    {r.artisanReply && <p className="mt-3 border-t border-vua pt-3 text-sm text-tro"><strong className="text-datnung">Xưởng:</strong> {r.artisanReply}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {certs.length > 0 && (
            <section className="mt-14">
              <h2 className="title-md mb-5">Chứng nhận chất lượng</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {certs.map((c) => (
                  <li key={c.name} className="tile flex gap-3 bg-su p-4">
                    <Award className="mt-0.5 size-5 shrink-0 text-datnung" aria-hidden />
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-tro">{c.issuer} · {c.year}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5"><MapPin className="size-4 shrink-0 text-tro" aria-hidden /><span>{w.address}<br /><span className="code text-tro">{formatCoord(w.latitude, w.longitude)}</span></span></li>
              <li className="flex gap-2.5"><Clock className="size-4 shrink-0 text-tro" aria-hidden /><span>{w.openingHours.replace("-", " – ")} · {w.openDays.length === 7 ? "Mở cả tuần" : w.openDays.map((d) => DAY[d]).join(", ")}</span></li>
              {w.experienceOffered && <li className="flex gap-2.5"><Users className="size-4 shrink-0 text-tro" aria-hidden /><span>Trải nghiệm nặn gốm: <strong>{formatVnd(w.experiencePriceVnd)}</strong>/khách · <a href="#dat-lich" className="font-semibold text-lam underline-offset-4 hover:underline">đặt lịch</a></span></li>}
              {w.acceptsWholesale && <li className="flex gap-2.5"><Factory className="size-4 shrink-0 text-tro" aria-hidden /><span>Nhận đơn sỉ · công suất {formatNumber(w.maxMonthlyCapacity)} sp/tháng</span></li>}
              {w.user.phone && <li className="flex gap-2.5"><Phone className="size-4 shrink-0 text-tro" aria-hidden /><a href={`tel:${w.user.phone}`} className="hover:text-lam">{w.user.phone}</a></li>}
            </ul>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {w.specialties.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-[4px] bg-nga-dam px-2.5 py-1 text-xs font-medium">
                  <span className="size-2.5 rounded-[2px]" style={{ background: GLAZES[s].color }} aria-hidden />{GLAZES[s].label}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-2">
              <ButtonLink href={`/map?focus=${w.slug}`}><MapPin className="size-4" /> Xem trên bản đồ làng</ButtonLink>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${w.latitude},${w.longitude}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-tile)] border border-muc/20 text-sm font-semibold hover:bg-nga-dam">
                <Navigation className="size-4" aria-hidden /> Chỉ đường (Google Maps)
              </a>
              <AskAiButton question={`Xưởng ${w.workshopName} có đang mở cửa không và nên đến lúc nào?`} className="justify-center" />
            </div>
          </Card>

          {w.batches.length > 0 && (
            <Card className="p-5">
              <h2 className="label mb-3">Lô có nhật ký truy xuất</h2>
              <ul className="space-y-1">
                {w.batches.map((b) => (
                  <li key={b.id}>
                    <Link href={`/trace/${b.batchCode}`} className="flex gap-3 rounded-[6px] p-2 transition hover:bg-nga-dam">
                      <QrCode className="mt-0.5 size-4 shrink-0 text-ngoc" aria-hidden />
                      <span>
                        <span className="block text-xs text-tro"><span className="code">{b.batchCode}</span> · {asStages(b.productionStages).length} mốc · {b.status === "COMPLETED" ? "đã khóa" : "đang làm"}</span>
                        <span className="block text-sm">{b.batchTitle}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>

      <section className="mx-auto max-w-[1440px] px-4 md:px-6">
        <h2 className="title-md mb-8">Tác phẩm của xưởng ({w.products.length})</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {w.products.map((p, i) => (
            <div key={p.slug} data-reveal style={{ ["--d" as string]: `${(i % 4) * 70}ms` }}>
              <ProductCard p={{ ...p, image: asImages(p.images)[0] ?? null, artisan: { workshopName: w.workshopName, slug: w.slug } }} favorite={{ on: fav.products.includes(p.id), can: canFav }} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
