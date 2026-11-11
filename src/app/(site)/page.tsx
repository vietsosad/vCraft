import Link from "next/link";
import type { GlazeType } from "@prisma/client";
import { ArrowRight, CalendarDays, FilePlus2, Megaphone, QrCode, Scale, Users, Lock } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { asImage, asImages, asStages } from "@/lib/types";
import { GLAZE_KEYS, STAGE_TEMPLATES, NEWS_CATEGORIES } from "@/lib/constants";
import { listWorkshops } from "@/lib/services/catalog-service";
import { favoriteIds } from "@/lib/services/engagement-service";
import { formatDate, formatNumber, formatVnd } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/primitives";
import { VImage } from "@/components/ui/vimage";
import { ProductCard } from "@/components/exhibition/product-card";
import { ArtisanCard } from "@/components/exhibition/artisan-card";
import { GlazeExplorer } from "@/components/exhibition/glaze-explorer";
import { MosaicHero } from "@/components/exhibition/mosaic-hero";
import { HistoryScroll, type Era } from "@/components/exhibition/history-scroll";
import { VillageMarquee, WaveRule, DrumFace } from "@/components/motion/ornaments";
import { RevealText } from "@/components/motion/reveal-text";
import { cn } from "@/lib/cn";
import manifest from "../../../public/seed/manifest.json";

export const dynamic = "force-dynamic";

const VISIBLE = { verificationStatus: "APPROVED" as const, user: { status: "ACTIVE" as const } };

/** Các làng gốm Việt Nam – dải chữ chạy dưới bức ghép mở màn. */
const VILLAGES = ["Bát Tràng", "Chu Đậu", "Phù Lãng", "Thổ Hà", "Hương Canh", "Bàu Trúc", "Thanh Hà", "Biên Hòa", "Lái Thiêu"];

/**
 * Sáu thế kỷ của làng – nội dung lịch sử viết thận trọng theo truyền ngôn và hiện vật bảo tàng,
 * chú thích ảnh lấy đúng từ nguồn Wikimedia Commons (xem /credits).
 */
const ERAS: Era[] = [
  {
    era: "Thế kỷ XIV–XV",
    title: "Đất trắng bên sông Cái",
    body: "Theo truyền ngôn, thợ gốm làng Bồ Bát (Thanh Hóa) theo sông ra bãi bồi ven sông Hồng, gặp mạch đất sét trắng và lập phường gốm Bạch Thổ. Cái tên Bát Tràng ra đời từ đó.",
    image: manifest["clay-heap"],
    caption: "Đất sét thô tập kết chờ xử lý tại Bát Tràng",
  },
  {
    era: "Thế kỷ XV",
    title: "Men lam theo thuyền ra biển",
    body: "Đồ gốm men lam Đại Việt theo các thuyền buôn tới Đông Nam Á và xa hơn. Nét bút lông coban trên men trắng trở thành gương mặt của gốm Việt.",
    image: manifest["chu-dau-jar"],
    caption: "Bình men lam Chu Đậu, thế kỷ XV – Bảo tàng Lịch sử Quốc gia",
  },
  {
    era: "Thế kỷ XVI",
    title: "Minh văn trên đồ thờ",
    body: "Thời Mạc, nhiều cây đèn, lư hương men lam được khắc minh văn ghi năm làm, người cung tiến và cả tên người thợ – những dòng chữ còn đọc được đến hôm nay.",
    image: manifest["lamp-stand-2"],
    caption: "Cây đèn thờ men lam thời Mạc, năm 1589 – Bảo tàng Lịch sử Quốc gia",
  },
  {
    era: "Thế kỷ XIX",
    title: "Chóe, lư triều Nguyễn",
    body: "Lò Bát Tràng làm chóe, lư hương, bát đĩa cho cả cung đình lẫn nhà dân. Men rạn đánh mực tàu và men lam vẽ linh vật, phong cảnh đều có mặt trong các bảo tàng.",
    image: manifest["storage-jar"],
    caption: "Chóe men lam Bát Tràng, niên hiệu Gia Long (1802–1819)",
  },
  {
    era: "Thế kỷ XX",
    title: "Tường than, ngõ cổ",
    body: "Than được đóng bánh, dán lên tường phơi khô để đốt lò. Những bức tường loang lổ ấy vẫn còn trong ngõ làng, như dấu tay của nhiều đời thợ.",
    image: manifest["coal-wall"],
    caption: "Bức tường dán bánh than trong làng cổ Bát Tràng",
  },
  {
    era: "2010",
    title: "Con đường gốm sứ",
    body: "Bức tranh gốm ghép dài gần bốn cây số chạy dọc đê sông Hồng, phần lớn làm từ gốm Bát Tràng, được ghi nhận là bức tranh gốm ghép dài nhất thế giới.",
    mosaic: true,
  },
  {
    era: "Hôm nay",
    title: "Mỗi lô một tem",
    body: "Các hộ nghề ghi nhật ký từng mẻ gốm, Ban quản lý xác thực, và mỗi lô có một mã QR. Khách quét tem là thấy cả hành trình của món đồ trong tay.",
    image: manifest["market-hall"],
    caption: "Chợ gốm Bát Tràng",
  },
];

/**
 * Lửa lên dần qua sáu công đoạn: từ màu đất sét sẫm tới màu gạch nung đỏ lửa.
 * Các men đủ đậm để chữ trắng 13px đạt tương phản ≥ 4,5:1.
 */
const STAGE_FIRE = ["#5f4d35", "#674628", "#743f22", "#80391c", "#8e3416", "#9c3a14"];

export default async function HomePage() {
  const user = await getCurrentUser();
  const [products, workshops, batches, news, glazeCounts, verified] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, artisan: VISIBLE },
      orderBy: [{ isUniquePiece: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true, slug: true, name: true, glazeType: true, priceVnd: true, isUniquePiece: true, images: true,
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
    prisma.artisanProfile.count({ where: VISIBLE }),
  ]);
  const favs = user?.role === "BUYER" ? await favoriteIds(user.id) : { products: [] as string[], artisans: [] as string[] };
  const canFav: boolean | "guest" = !user ? "guest" : user.role === "BUYER";

  const samples = Object.fromEntries(
    GLAZE_KEYS.map((g) => {
      const sample = products.find((p) => p.glazeType === g);
      return [g, { image: sample ? asImages(sample.images)[0] ?? null : null, count: glazeCounts.find((c) => c.glazeType === g)?._count._all ?? 0 }];
    }),
  ) as Record<GlazeType, { image: ReturnType<typeof asImage>; count: number }>;
  const fallbackFor: Record<GlazeType, keyof typeof manifest> = {
    MEN_RAN_CO: "crackle-lime-3", MEN_LAM_CO: "lam-jar-peony", MEN_NGOC: "ngoc-jar", MEN_HOA_BIEN: "crackle-lime-1", MEN_TRANG_NGA: "cups-batch",
  };
  for (const g of GLAZE_KEYS) if (!samples[g].image) samples[g].image = manifest[fallbackFor[g]];

  const urgent = news.find((n) => n.isUrgent);
  const openNow = workshops.filter((w) => w.openState.isOpenNow).length;
  // Khi chưa xưởng nào mở: lấy giờ mở cửa sớm nhất ("hôm nay" trước "sáng mai")
  const closedLabels = workshops.filter((w) => w.isOpenForVisit).map((w) => w.openState.label);
  const nextOpen =
    openNow > 0
      ? null
      : [...closedLabels].sort((a, b) => Number(!a.includes("hôm nay")) - Number(!b.includes("hôm nay")) || a.localeCompare(b))[0] ?? null;
  const experiences = workshops.filter((w) => w.experienceOffered).sort((a, b) => Number(b.openState.isOpenNow) - Number(a.openState.isOpenNow));
  const pieces = products.map((p) => ({ image: asImages(p.images)[0] ?? null, href: `/products/${p.slug}`, name: p.name }));

  return (
    <>
      {urgent && (
        <Link href={`/news/${urgent.slug}`} className="tile-dat block text-giay">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2.5 text-sm md:px-6">
            <Megaphone className="size-4 shrink-0" aria-hidden />
            <span className="shrink-0 rounded-[3px] bg-giay/15 px-1.5 py-0.5 text-[11px] font-semibold">Thông báo khẩn</span>
            <span className="truncate">{urgent.title}</span>
            <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden />
          </div>
        </Link>
      )}

      <MosaicHero pieces={pieces} hands={manifest["hands-wheel"]} openNow={openNow} nextOpen={nextOpen} verified={verified} traceCode={batches[0]?.batchCode ?? "BT-2026-RAN-001"} />

      <div className="border-y border-vua bg-nga py-6 text-muc/85">
        <VillageMarquee items={VILLAGES} />
      </div>

      <HistoryScroll eras={ERAS} />

      {/* Dòng men */}
      <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-6 md:py-28">
        <SectionHeading title="Nhất xương, nhì da, thứ ba đến lửa" description="Năm dòng men làm nên tên tuổi Bát Tràng. Chọn một viên men để xem nó khác các dòng còn lại thế nào." className="mb-12" />
        <GlazeExplorer samples={samples} />
      </section>

      {/* Tác phẩm */}
      <section className="crackle-bg py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <SectionHeading
            title="Tác phẩm mới ra lò"
            description="Độc bản và đồ dùng hằng ngày của các hộ đã được Ban quản lý xác thực."
            action={<ButtonLink href="/products" variant="outline">Xem toàn bộ triển lãm <ArrowRight className="size-4" /></ButtonLink>}
            className="mb-12"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <div key={p.slug} data-reveal style={{ ["--d" as string]: `${(i % 4) * 70}ms` }}>
                <ProductCard p={{ ...p, image: asImages(p.images)[0] ?? null }} favorite={{ on: favs.products.includes(p.id), can: canFav }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Truy xuất: lửa lên dần qua sáu công đoạn */}
      <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-6 md:py-28">
        <SectionHeading
          title="Sáu công đoạn, sáu bằng chứng"
          description="Mỗi lô gốm lưu nhật ký có ảnh thật ở từng công đoạn. Khi ra lò, nhật ký được khóa và in thành tem QR dùng chung cho cả lô."
          className="mb-12"
        />
        <ol data-progress="520" className="fire-steps mosaic grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {STAGE_TEMPLATES.map((s, i) => (
            <li
              key={s.key}
              style={{ ["--k" as string]: (i / 6).toFixed(3), background: `linear-gradient(160deg, ${STAGE_FIRE[i]}, color-mix(in oklab, ${STAGE_FIRE[i]} 78%, #1c1a17))` }}
              className="tile flex min-h-52 flex-col justify-between p-5 text-giay"
            >
              <span className="flex items-baseline justify-between">
                <span className="font-display text-4xl leading-none">{i + 1}</span>
                {s.temperatureC ? <span className="text-sm font-semibold tabular">{formatNumber(s.temperatureC)}°C</span> : null}
              </span>
              <span>
                <span className="block font-serif text-xl font-bold leading-tight">{s.title}</span>
                <span className="mt-1.5 block text-[13px] leading-snug text-giay/90">{s.hint}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {batches.map((b, i) => (
            <Link key={b.id} href={`/trace/${b.batchCode}`} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="tile glaze group block bg-su">
              <VImage image={asImage(b.coverImage)} ratio="16/10" sizes="(max-width: 768px) 100vw, 33vw" imgClassName="transition-transform duration-[900ms] group-hover:scale-[1.04]" />
              <div className="p-5">
                <p className="flex items-center gap-2 text-xs text-ngoc"><QrCode className="size-3.5" aria-hidden /><span className="code">{b.batchCode}</span> · {formatNumber(b.scanCount)} lượt quét</p>
                <p className="mt-1 font-serif text-xl font-bold transition-colors group-hover:text-lam">{b.batchTitle}</p>
                <p className="text-sm text-tro">{b.artisan.workshopName} · {asStages(b.productionStages).length} mốc nhật ký</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nghệ nhân */}
      <section className="bg-nga-dam py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <SectionHeading title="Những người giữ lửa" description="Mỗi gian trưng bày là câu chuyện của một dòng họ làm gốm." action={<ButtonLink href="/artisans" variant="outline">Tất cả nghệ nhân <ArrowRight className="size-4" /></ButtonLink>} className="mb-12" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {workshops.slice(0, 3).map((w, i) => (
              <div key={w.slug} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
                <ArtisanCard a={{ ...w, coverImage: asImage(w.coverImage) }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Khúc nghỉ: ca dao */}
      <section aria-label="Ca dao về Bát Tràng" className="relative overflow-hidden bg-dem py-28 text-giay md:py-40">
        <div data-parallax="0.18" className="absolute inset-x-0 -inset-y-[20%] opacity-35">
          <VImage image={manifest["coal-wall"]} ratio="auto" sizes="100vw" className="h-full" imgClassName="h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-dem via-dem/60 to-dem" aria-hidden />
        <DrumFace className="absolute left-1/2 top-1/2 size-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 text-[#f5c9a6] opacity-[0.12]" />
        <figure className="relative mx-auto max-w-4xl px-4 text-center">
          <blockquote>
            <RevealText as="p" text="Ước gì anh lấy được nàng," className="block font-serif text-[clamp(2rem,5vw,4.2rem)] italic leading-tight" />
            <RevealText as="p" text="Để anh mua gạch Bát Tràng về xây." delay={260} className="block font-serif text-[clamp(2rem,5vw,4.2rem)] italic leading-tight text-[#f5c9a6]" />
          </blockquote>
          <figcaption data-reveal style={{ ["--d" as string]: "500ms", ["--rot" as string]: "0deg" }} className="mt-8 text-sm text-giay/70">Ca dao Bắc Bộ</figcaption>
        </figure>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 md:px-6"><WaveRule className="my-16" /></div>

      {/* Trải nghiệm nặn gốm */}
      <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-6 md:py-28">
        <div className="mosaic grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          <div className="tile tile-hoavan relative flex flex-col justify-between gap-10 p-8 md:p-12">
            <div className="max-w-lg rounded-[8px] bg-su/92 p-6 shadow-soft backdrop-blur-[2px] md:p-8">
              <h2 className="title-lg">Một buổi chiều bên bàn xoay</h2>
              <p className="mt-4 text-tro">
                Đặt lịch nặn gốm, vẽ men lam ngay tại xưởng. Chọn ngày, khung giờ còn chỗ và số người; nghệ nhân xác nhận trong ngày, bạn
                nhận thông báo ngay khi xưởng trả lời.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <ButtonLink href="/map"><CalendarDays className="size-4" /> Chọn xưởng trên bản đồ</ButtonLink>
              </div>
            </div>
          </div>
          <ul className="grid gap-[6px]">
            {experiences.slice(0, 4).map((w, i) => (
              <li key={w.slug} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
                <Link href={`/artisans/${w.slug}#dat-lich`} className="tile glaze flex items-center gap-4 bg-su p-3">
                  <VImage image={asImage(w.coverImage)} ratio="1/1" sizes="96px" className="w-20 shrink-0 rounded-[4px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-lg font-bold">{w.workshopName}</span>
                    <span className="block text-sm text-tro">{w.openState.label}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-semibold tabular">{formatVnd(w.experiencePriceVnd)}</span>
                    <span className="block text-xs text-tro">mỗi khách</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Đặt hàng sỉ */}
      <section className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="mosaic grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
          <div className="tile tile-lam p-8 text-giay md:p-12">
            <h2 className="title-lg">Cần 5.000 chiếc cốc trong một tháng?</h2>
            <p className="mt-4 max-w-xl text-giay/85">
              Gửi một yêu cầu báo giá, hệ thống mời đúng các xưởng có sở trường và đủ công suất. Các xưởng chào giá kín, bạn so sánh trên
              cùng mặt bằng rồi chia đơn cho nhiều hộ cùng làm. Mỗi phần đơn có lô sản xuất và mã QR riêng.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Users, t: "Mời đúng xưởng" },
                { icon: Scale, t: "So giá kín" },
                { icon: Lock, t: "Chốt chống trùng" },
              ].map((x) => (
                <li key={x.t} className="flex items-center gap-2 rounded-[var(--radius-tile)] bg-giay/10 px-3 py-2.5 text-sm font-semibold">
                  <x.icon className="size-4 shrink-0" aria-hidden /> {x.t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/account/quotes/new" className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-tile)] bg-giay px-6 font-semibold text-[#163a73] transition hover:bg-white">
                <FilePlus2 className="size-4" aria-hidden /> Tạo yêu cầu báo giá
              </Link>
              <Link href="/b2b-quotes" className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-tile)] px-5 font-semibold text-giay ring-1 ring-inset ring-giay/35 transition hover:bg-giay/10">
                Xem cách hoạt động
              </Link>
            </div>
          </div>
          <div className="tile">
            <div data-reveal="mask" className="h-full"><VImage image={manifest["glazing-cups"]} ratio="4/3" sizes="(max-width: 1024px) 100vw, 45vw" className="h-full" imgClassName="h-full" /></div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 md:px-6"><WaveRule className="mt-20" tone="datnung" /></div>

      {/* Bản tin */}
      <section className="mx-auto max-w-[1440px] px-4 pt-20 md:px-6 md:pt-28">
        <SectionHeading title="Từ Ban quản lý" description="Giá nguyên liệu, lịch cúp điện, chính sách và sự kiện của làng." action={<ButtonLink href="/news" variant="ghost">Tất cả tin <ArrowRight className="size-4" /></ButtonLink>} className="mb-10" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {news.map((n, i) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="group block">
              <div className="tile glaze" data-reveal="mask" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <VImage image={asImage(n.coverImage)} ratio="16/10" sizes="(max-width: 768px) 100vw, 33vw" imgClassName="transition-transform duration-[900ms] group-hover:scale-[1.04]" />
              </div>
              <p className={cn("mt-4 text-xs font-semibold", n.isUrgent ? "text-doson" : "text-tro")}>
                {n.isUrgent && "Khẩn · "}
                {NEWS_CATEGORIES[n.category]} · {formatDate(n.publishedAt)}
              </p>
              <p className="mt-1 font-serif text-xl font-bold leading-snug transition-colors group-hover:text-lam">{n.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
