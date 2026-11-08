import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Flame, Ruler, Layers, QrCode, ShieldCheck, Handshake } from "lucide-react";
import { prisma } from "@/lib/db";
import { asImages, asImage, asStages } from "@/lib/types";
import { GLAZES, categoryLabel } from "@/lib/constants";
import { formatVnd, formatNumber } from "@/lib/format";
import { Gallery } from "@/components/exhibition/gallery";
import { ProductCard } from "@/components/exhibition/product-card";
import { ButtonLink } from "@/components/ui/button";
import { VerifiedSeal } from "@/components/ui/primitives";
import { VImage } from "@/components/ui/vimage";
import { AskAiButton } from "@/components/ai/ask-ai-button";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isPublished: true, artisan: { verificationStatus: "APPROVED", user: { status: "ACTIVE" } } },
    include: {
      artisan: { select: { slug: true, workshopName: true, artisanName: true, artisanTitle: true, generation: true, establishedYear: true, coverImage: true, tagline: true } },
      currentBatch: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: "Không tìm thấy tác phẩm" };
  const img = asImages(p.images)[0];
  return {
    title: p.name,
    description: p.story.slice(0, 160),
    openGraph: { title: p.name, description: p.story.slice(0, 160), images: img ? [{ url: img.src }] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const images = asImages(p.images);
  const glaze = GLAZES[p.glazeType];
  const related = await prisma.product.findMany({
    where: { isPublished: true, id: { not: p.id }, OR: [{ artisanId: p.artisanId }, { glazeType: p.glazeType }], artisan: { verificationStatus: "APPROVED" } },
    take: 4,
    select: { slug: true, name: true, glazeType: true, priceVnd: true, isUniquePiece: true, images: true, artisan: { select: { workshopName: true, slug: true } }, currentBatch: { select: { batchCode: true } } },
  });
  const stages = p.currentBatch ? asStages(p.currentBatch.productionStages) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ash">
        <Link href="/products" className="hover:text-ink">Triển lãm</Link> /{" "}
        <Link href={`/products?category=${p.category}`} className="hover:text-ink">{categoryLabel(p.category)}</Link> /{" "}
        <span className="text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Gallery images={images} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bisque px-3 py-1 text-xs">
              <span className="size-2.5 rounded-full" style={{ background: glaze.color }} /> {glaze.label}
            </span>
            {p.isUniquePiece && <span className="rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-kaolin">Độc bản</span>}
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl">{p.name}</h1>
          <p className="mt-4 font-mono text-2xl tabular">{formatVnd(p.priceVnd)}</p>
          <p className="mt-6 text-[17px] leading-relaxed text-ink/80">{p.story}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-6 text-sm sm:grid-cols-4">
            <div><dt className="flex items-center gap-1 text-ash"><Ruler className="size-3.5" /> Kích thước</dt><dd className="mt-1">{p.dimensions}</dd></div>
            <div><dt className="flex items-center gap-1 text-ash"><Flame className="size-3.5" /> Nhiệt nung</dt><dd className="mt-1 font-mono">{formatNumber(p.firingTempC)}°C</dd></div>
            <div><dt className="flex items-center gap-1 text-ash"><Layers className="size-3.5" /> Lớp men</dt><dd className="mt-1 font-mono">{p.glazeThickness}</dd></div>
            <div><dt className="text-ash">Còn lại</dt><dd className="mt-1">{p.isUniquePiece ? "1 (độc bản)" : `${p.stock} sản phẩm`}</dd></div>
          </dl>

          {p.currentBatch && (
            <div className="mt-6 flex gap-4 rounded-[var(--radius-tile)] border border-celadon/30 bg-celadon-soft/50 p-4">
              <Image src={p.currentBatch.qrCodeDataUrl} alt={`Mã QR lô ${p.currentBatch.batchCode}`} width={96} height={96} unoptimized className="shrink-0 rounded" />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-celadon"><ShieldCheck className="size-4" /> Đã xác thực nguồn gốc</p>
                <p className="font-mono text-xs text-ash">{p.currentBatch.batchCode} · {stages.length} mốc nhật ký</p>
                <p className="mt-1 text-sm">Mọi sản phẩm cùng lô “{p.currentBatch.batchTitle}” dùng chung mã QR này.</p>
                <Link href={`/trace/${p.currentBatch.batchCode}`} className="mt-2 inline-flex items-center gap-1 text-sm text-terracotta">
                  <QrCode className="size-4" /> Xem hành trình ra đời
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={`/b2b-quotes/new?category=${p.category}&glaze=${p.glazeType}&ref=${encodeURIComponent(p.name)}`} variant="cobalt">
              <Handshake className="size-4" /> Yêu cầu báo giá sỉ
            </ButtonLink>
            <ButtonLink href={`/map?focus=${p.artisan.slug}`} variant="outline">Ghé xưởng xem trực tiếp</ButtonLink>
            <AskAiButton question={`Cho tôi biết thêm về ${glaze.label.toLowerCase()} và tác phẩm "${p.name}"`} />
          </div>

          <Link href={`/artisans/${p.artisan.slug}`} className="mt-8 flex items-center gap-4 rounded-[var(--radius-tile)] border border-line bg-white/70 p-4 hover:border-terracotta/40">
            <VImage image={asImage(p.artisan.coverImage)} ratio="1/1" sizes="64px" className="w-16 shrink-0 rounded-full" />
            <div>
              <VerifiedSeal />
              <p className="mt-1 font-display text-xl">{p.artisan.workshopName}</p>
              <p className="text-sm text-ash">{p.artisan.artisanTitle} {p.artisan.artisanName} · đời thứ {p.artisan.generation} · từ {p.artisan.establishedYear}</p>
            </div>
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-3xl">Có thể bạn cũng thích</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((r) => <ProductCard key={r.slug} p={{ ...r, image: asImages(r.images)[0] ?? null }} />)}
          </div>
        </section>
      )}
    </div>
  );
}
