import Link from "next/link";
import type { GlazeType } from "@prisma/client";
import { ArrowRight, QrCode, MapPin, Handshake, Megaphone } from "lucide-react";
import { prisma } from "@/lib/db";
import { asImage, asImages, asStages } from "@/lib/types";
import { GLAZE_KEYS, STAGE_TEMPLATES, NEWS_CATEGORIES } from "@/lib/constants";
import { listWorkshops } from "@/lib/services/catalog-service";
import { formatDate, formatNumber } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/primitives";
import { VImage } from "@/components/ui/vimage";
import { ProductCard } from "@/components/exhibition/product-card";
import { ArtisanCard } from "@/components/exhibition/artisan-card";
import { GlazeExplorer } from "@/components/exhibition/glaze-explorer";
import manifest from "../../public/seed/manifest.json";

export const dynamic = "force-dynamic";

const VISIBLE = { verificationStatus: "APPROVED" as const, user: { status: "ACTIVE" as const } };

export default async function HomePage() {
  const [products, workshops, batches, news, glazeCounts, stats] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, artisan: VISIBLE },
      orderBy: [{ isUniquePiece: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        slug: true, name: true, glazeType: true, priceVnd: true, isUniquePiece: true, images: true,
        artisan: { select: { workshopName: true, slug: true } }, currentBatch: { select: { batchCode: true } },
      },
    }),
    listWorkshops(),
    prisma.productBatch.findMany({
      where: { status: "COMPLETED", artisan: VISIBLE },
      orderBy: { scanCount: "desc" },
      take: 3,
      include: { artisan: { select: { workshopName: true } } },
    }),
    prisma.communityNews.findMany({ where: { isPublished: true }, orderBy: [{ isUrgent: "desc" }, { publishedAt: "desc" }], take: 3 }),
    prisma.product.groupBy({ by: ["glazeType"], where: { isPublished: true }, _count: { _all: true } }),
    Promise.all([
      prisma.artisanProfile.count({ where: VISIBLE }),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.productBatch.aggregate({ _sum: { scanCount: true } }),
    ]),
  ]);

  const samples = Object.fromEntries(
    GLAZE_KEYS.map((g) => {
      const sample = products.find((p) => p.glazeType === g);
      return [g, { image: sample ? asImages(sample.images)[0] ?? null : null, count: glazeCounts.find((c) => c.glazeType === g)?._count._all ?? 0 }];
    }),
  ) as Record<GlazeType, { image: ReturnType<typeof asImage>; count: number }>;
  // Bổ sung ảnh cho dòng men chưa có trong 8 sản phẩm đầu
  const fallbackFor: Record<GlazeType, keyof typeof manifest> = {
    MEN_RAN_CO: "crackle-lime-3", MEN_LAM_CO: "lam-jar-peony", MEN_NGOC: "ngoc-jar", MEN_HOA_BIEN: "crackle-lime-1", MEN_TRANG_NGA: "cups-batch",
  };
  for (const g of GLAZE_KEYS) if (!samples[g].image) samples[g].image = manifest[fallbackFor[g]];

  const urgent = news.find((n) => n.isUrgent);
  const openNow = workshops.filter((w) => w.openState.isOpenNow).length;
  const hero = manifest["hands-wheel"];

  return (
    <>
      {urgent && (
        <Link href={`/news/${urgent.slug}`} className="block bg-terracotta text-kaolin">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 text-sm md:px-6">
            <Megaphone className="size-4 shrink-0" />
            <span className="font-mono text-[11px] uppercase tracking-widest">Thông báo khẩn</span>
            <span className="truncate">{urgent.title}</span>
            <ArrowRight className="ml-auto size-4 shrink-0" />
          </div>
        </Link>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 md:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pb-24 lg:pt-16">
          <div className="animate-fade-up">
            <p className="eyebrow">Triển lãm số · Làng gốm Bát Tràng · từ thế kỷ XIV</p>
            <h1 className="mt-5 text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[4.6rem]">
              Tinh hoa làng nghề,
              <br />
              <em className="text-terracotta">muôn phương lan tỏa.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink/75">
              Mỗi món gốm ở đây có một câu chuyện và bạn kiểm chứng được nó: quét mã QR để xem toàn bộ hành trình từ ngày
              ngâm đất ở bể đánh đến khi ra lò 1.300°C.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/products" size="lg">
                Vào phòng triển lãm <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/map" size="lg" variant="outline">
                <MapPin className="size-4" /> {openNow} xưởng đang mở cửa
              </ButtonLink>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
              <div>
                <dt className="text-xs text-ash">Hộ nghề xác thực</dt>
                <dd className="font-display text-4xl tabular">{stats[0]}</dd>
              </div>
              <div>
                <dt className="text-xs text-ash">Tác phẩm trưng bày</dt>
                <dd className="font-display text-4xl tabular">{stats[1]}</dd>
              </div>
              <div>
                <dt className="text-xs text-ash">Lượt quét QR</dt>
                <dd className="font-display text-4xl tabular">{formatNumber(stats[2]._sum.scanCount ?? 0)}</dd>
              </div>
            </dl>
          </div>
          <div className="relative">
            <VImage image={hero} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 48vw" className="rounded-[var(--radius-tile)] shadow-lift" />
            <div className="absolute -bottom-6 -left-4 hidden w-64 rounded-lg border border-line bg-kaolin p-4 shadow-lift sm:block">
              <p className="eyebrow !text-celadon">Đã xác thực nguồn gốc</p>
              <p className="mt-1 font-display text-xl">Bình hút lộc men rạn</p>
              <p className="font-mono text-xs text-ash">BT-2026-RAN-001 · 6 công đoạn</p>
              <Link href="/trace/BT-2026-RAN-001" className="mt-2 inline-flex items-center gap-1 text-sm text-terracotta">
                <QrCode className="size-4" /> Xem hành trình
              </Link>
            </div>
          </div>
        </div>
        <div className="wave-divider" />
      </section>

      {/* Dòng men */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <SectionHeading eyebrow="Năm dòng men trứ danh" title="Nhất xương, nhì da, thứ ba đến lửa" className="mb-10" />
        <GlazeExplorer samples={samples} />
      </section>

      {/* Tác phẩm */}
      <section className="crackle-bg py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Phòng trưng bày"
            title="Tác phẩm mới ra lò"
            description="Độc bản và sản phẩm ứng dụng của các hộ đã được Ban quản lý xác thực."
            action={<ButtonLink href="/products" variant="outline">Xem toàn bộ triển lãm</ButtonLink>}
            className="mb-10"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.slug} priority={i < 2} p={{ ...p, image: asImages(p.images)[0] ?? null }} />
            ))}
          </div>
        </div>
      </section>

      {/* Quy trình */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <SectionHeading eyebrow="Truy xuất nguồn gốc" title="Sáu công đoạn, sáu bằng chứng" description="Mỗi lô gốm lưu nhật ký có ảnh thật ở từng công đoạn. Khi ra lò, nhật ký được khóa và in thành tem QR dùng chung cho cả lô." className="mb-12" />
        <ol className="grid gap-px overflow-hidden rounded-[var(--radius-tile)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {STAGE_TEMPLATES.map((s, i) => (
            <li key={s.key} className="bg-kaolin p-6">
              <p className="font-mono text-xs text-terracotta">0{i + 1}{s.temperatureC ? ` · ${formatNumber(s.temperatureC)}°C` : ""}</p>
              <p className="mt-2 font-display text-2xl">{s.title}</p>
              <p className="mt-2 text-sm text-ash">{s.hint}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {batches.map((b) => (
            <Link key={b.id} href={`/trace/${b.batchCode}`} className="group overflow-hidden rounded-[var(--radius-tile)] border border-line bg-white/70">
              <VImage image={asImage(b.coverImage)} ratio="16/10" sizes="(max-width: 768px) 100vw, 33vw" imgClassName="transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="p-5">
                <p className="font-mono text-xs text-celadon">{b.batchCode} · {formatNumber(b.scanCount)} lượt quét</p>
                <p className="mt-1 font-display text-xl group-hover:text-terracotta">{b.batchTitle}</p>
                <p className="text-sm text-ash">{b.artisan.workshopName} · {asStages(b.productionStages).length} mốc nhật ký</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nghệ nhân */}
      <section className="bg-bisque/60 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading eyebrow="Những người giữ lửa" title="Nghệ nhân và xưởng tiêu biểu" action={<ButtonLink href="/artisans" variant="outline">Tất cả nghệ nhân</ButtonLink>} className="mb-10" />
          <div className="grid gap-6 md:grid-cols-3">
            {workshops.slice(0, 3).map((w) => (
              <ArtisanCard key={w.slug} a={{ ...w, coverImage: asImage(w.coverImage) }} />
            ))}
          </div>
        </div>
      </section>

      {/* B2B */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="grid overflow-hidden rounded-[var(--radius-tile)] bg-cobalt text-kaolin lg:grid-cols-2">
          <div className="p-8 md:p-12">
            <p className="eyebrow !text-ember">Đặt hàng sỉ · Điều phối nhiều hộ</p>
            <h2 className="mt-4 text-4xl md:text-5xl">Cần 5.000 chiếc cốc trong một tháng?</h2>
            <p className="mt-4 text-kaolin/80">
              Gửi một yêu cầu báo giá, hệ thống mời đúng các xưởng có sở trường và đủ công suất. Các xưởng chào giá kín, bạn
              so sánh trên cùng mặt bằng, rồi chia đơn cho nhiều hộ cùng làm. Mỗi phần đơn có lô sản xuất và mã QR riêng.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/b2b-quotes/new" variant="primary">
                <Handshake className="size-4" /> Tạo yêu cầu báo giá
              </ButtonLink>
              <ButtonLink href="/b2b-quotes" variant="outline" className="border-kaolin/30 text-kaolin hover:bg-white/10">
                Xem cách hoạt động
              </ButtonLink>
            </div>
          </div>
          <VImage image={manifest["glazing-cups"]} ratio="4/3" sizes="(max-width: 1024px) 100vw, 50vw" className="h-full" />
        </div>
      </section>

      {/* Bản tin */}
      <section className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
        <SectionHeading eyebrow="Bản tin làng" title="Từ Ban quản lý" action={<ButtonLink href="/news" variant="ghost">Tất cả tin →</ButtonLink>} className="mb-8" />
        <div className="grid gap-6 md:grid-cols-3">
          {news.map((n) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="group block">
              <VImage image={asImage(n.coverImage)} ratio="16/10" sizes="(max-width: 768px) 100vw, 33vw" className="rounded-[var(--radius-tile)]" />
              <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-terracotta">
                {n.isUrgent && "Khẩn · "}{NEWS_CATEGORIES[n.category]} · {formatDate(n.publishedAt)}
              </p>
              <p className="mt-1 font-display text-xl group-hover:text-terracotta">{n.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
