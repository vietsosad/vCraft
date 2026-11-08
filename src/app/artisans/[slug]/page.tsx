import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Award, Phone, Users, Factory } from "lucide-react";
import { prisma } from "@/lib/db";
import { asImage, asImages, asCertifications, asStages } from "@/lib/types";
import { GLAZES } from "@/lib/constants";
import { getOpenState } from "@/lib/opening-hours";
import { formatVnd, formatNumber, formatCoord } from "@/lib/format";
import { VImage } from "@/components/ui/vimage";
import { VerifiedSeal } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/exhibition/product-card";
import { Gallery } from "@/components/exhibition/gallery";
import { AskAiButton } from "@/components/ai/ask-ai-button";
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
        select: { slug: true, name: true, glazeType: true, priceVnd: true, isUniquePiece: true, images: true, currentBatch: { select: { batchCode: true } } },
      },
      batches: { where: { quoteRequestId: null }, orderBy: { createdAt: "desc" }, take: 6 },
      user: { select: { phone: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const w = await getWorkshop((await params).slug);
  return w ? { title: w.workshopName, description: w.tagline ?? w.familyHistory.slice(0, 150) } : { title: "Không tìm thấy xưởng" };
}

export default async function ArtisanPage({ params }: Props) {
  const w = await getWorkshop((await params).slug);
  if (!w) notFound();
  const open = getOpenState(w);
  const cover = asImage(w.coverImage);
  const gallery = asImages(w.workshopImages);
  const certs = asCertifications(w.certifications);

  return (
    <>
      <section className="relative">
        <VImage image={cover} ratio="21/8" priority sizes="100vw" className="max-h-[520px] min-h-[300px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-8 text-kaolin md:px-6">
            <VerifiedSeal className="border-kaolin text-kaolin" />
            <h1 className="mt-3 text-5xl md:text-7xl">{w.workshopName}</h1>
            <p className="mt-2 text-lg text-kaolin/85">
              {w.artisanTitle} {w.artisanName} · dòng họ {w.clanName} · đời thứ {w.generation} · từ năm {w.establishedYear}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 md:px-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {w.tagline && <p className="font-display text-3xl italic text-terracotta">“{w.tagline}”</p>}
          <h2 className="mt-8 text-3xl">Câu chuyện gia đình</h2>
          <div className="prose-vcraft mt-4 text-[17px] leading-relaxed text-ink/80">
            {w.familyHistory.split("\n").map((para, i) => <p key={i}>{para}</p>)}
          </div>

          {gallery.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-5 text-3xl">Không gian xưởng</h2>
              <Gallery images={gallery} ratio="16/10" />
            </section>
          )}

          {certs.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-5 text-3xl">Chứng nhận chất lượng</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {certs.map((c) => (
                  <li key={c.name} className="flex gap-3 rounded-[var(--radius-tile)] border border-line bg-white/70 p-4">
                    <Award className="mt-0.5 size-5 shrink-0 text-terracotta" />
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-ash">{c.issuer} · {c.year}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius-tile)] border border-line bg-white/80 p-6 shadow-soft">
            <p className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm", open.isOpenNow ? "bg-celadon text-kaolin" : "bg-bisque text-ash")}>
              <span className={cn("size-2 rounded-full", open.isOpenNow ? "animate-pulse bg-kaolin" : "bg-ash")} /> {open.label}
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex gap-2.5"><MapPin className="size-4 shrink-0 text-ash" /><span>{w.address}<br /><span className="font-mono text-xs text-ash">{formatCoord(w.latitude, w.longitude)}</span></span></li>
              <li className="flex gap-2.5"><Clock className="size-4 shrink-0 text-ash" /><span>{w.openingHours.replace("-", " – ")} · {w.openDays.length === 7 ? "Mở cả tuần" : w.openDays.map((d) => DAY[d]).join(", ")}</span></li>
              {w.experienceOffered && <li className="flex gap-2.5"><Users className="size-4 shrink-0 text-ash" /><span>Trải nghiệm chuốt gốm: <strong>{formatVnd(w.experiencePriceVnd)}</strong>/người</span></li>}
              {w.acceptsWholesale && <li className="flex gap-2.5"><Factory className="size-4 shrink-0 text-ash" /><span>Nhận đơn sỉ · công suất {formatNumber(w.maxMonthlyCapacity)} sp/tháng</span></li>}
              {w.user.phone && <li className="flex gap-2.5"><Phone className="size-4 shrink-0 text-ash" /><a href={`tel:${w.user.phone}`} className="hover:text-terracotta">{w.user.phone}</a></li>}
            </ul>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {w.specialties.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full bg-bisque px-2.5 py-1 text-xs">
                  <span className="size-2 rounded-full" style={{ background: GLAZES[s].color }} />{GLAZES[s].label}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-2">
              <ButtonLink href={`/map?focus=${w.slug}`}>Xem trên bản đồ làng</ButtonLink>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${w.latitude},${w.longitude}`} target="_blank" rel="noreferrer" className="rounded-[var(--radius-tile)] border border-ink/20 py-2.5 text-center text-sm hover:bg-bisque">
                Chỉ đường (Google Maps)
              </a>
              <AskAiButton question={`Xưởng ${w.workshopName} có đang mở cửa không và nên đến lúc nào?`} className="justify-center" />
            </div>
          </div>

          {w.batches.length > 0 && (
            <div className="rounded-[var(--radius-tile)] border border-line bg-white/70 p-5">
              <p className="eyebrow mb-3 !text-celadon">Lô có nhật ký truy xuất</p>
              <ul className="space-y-2.5">
                {w.batches.map((b) => (
                  <li key={b.id}>
                    <Link href={`/trace/${b.batchCode}`} className="block rounded-md p-2 hover:bg-bisque">
                      <p className="font-mono text-xs text-ash">{b.batchCode} · {asStages(b.productionStages).length} mốc · {b.status === "COMPLETED" ? "đã khóa" : "đang làm"}</p>
                      <p className="text-sm">{b.batchTitle}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="mb-8 text-3xl">Tác phẩm của xưởng ({w.products.length})</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {w.products.map((p) => (
            <ProductCard key={p.slug} p={{ ...p, image: asImages(p.images)[0] ?? null, artisan: { workshopName: w.workshopName, slug: w.slug } }} />
          ))}
        </div>
      </section>
    </>
  );
}
