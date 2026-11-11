import type { Metadata } from "next";
import { RevealText } from "@/components/motion/reveal-text";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Lock, Loader, MapPin, ScanLine, Mountain, Flame, Timer, Package } from "lucide-react";
import { getTrace } from "@/lib/services/batch-service";
import { asImage, asImages, asStages } from "@/lib/types";
import { GLAZES } from "@/lib/constants";
import { formatDate, formatNumber, formatCoord } from "@/lib/format";
import { KilnTimeline } from "@/components/trace/kiln-timeline";
import { VImage } from "@/components/ui/vimage";
import { VerifiedSeal, EmptyState, SealStamp } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { PrintButton } from "@/components/trace/print-button";

type Props = { params: Promise<{ batchCode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { batchCode } = await params;
  const b = await getTrace(decodeURIComponent(batchCode));
  if (!b) return { title: "Không tìm thấy lô" };
  const cover = asImage(b.coverImage);
  return {
    title: `Truy xuất ${b.batchCode}`,
    description: `${b.batchTitle} – ${b.artisan.workshopName}. Hành trình ${asStages(b.productionStages).length} công đoạn.`,
    openGraph: { images: cover ? [{ url: cover.src }] : [] },
  };
}

export default async function TracePage({ params }: Props) {
  const { batchCode } = await params;
  if (batchCode === "not-found") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState title="Mã QR không hợp lệ" description="Không tìm thấy lô sản phẩm với mã này. Sản phẩm có thể không thuộc mạng lưới hộ nghề được Ban quản lý xác thực." action={<ButtonLink href="/products">Về phòng triển lãm</ButtonLink>} />
      </div>
    );
  }
  const b = await getTrace(decodeURIComponent(batchCode));
  if (!b) notFound();

  const stages = asStages(b.productionStages);
  const cover = asImage(b.coverImage);
  const verified = b.artisan.verificationStatus === "APPROVED";
  const locked = b.status === "COMPLETED";
  const startDate = stages[0]?.occurredAt ?? b.createdAt.toISOString();

  return (
    <article>
      {/* Phần đầu */}
      <header className="relative overflow-hidden bg-dem text-giay">
        <div data-parallax="0.25" className="absolute inset-x-0 -inset-y-[15%] opacity-45">
          <VImage image={cover} ratio="auto" priority sizes="100vw" className="h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-muc via-muc/70 to-muc/30" />
        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-16 md:px-6 md:pt-24">
                    <RevealText as="h1" text={b.batchTitle} className="title-xl block max-w-4xl !text-[clamp(2.3rem,5.4vw,4.6rem)]" />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-giay/10 px-3 py-1.5 text-sm"><span className="code text-[#f5c9a6]">{b.batchCode}</span></span>
            {verified && <VerifiedSeal className="rounded-[4px] bg-giay px-2 py-1 text-doson" label="Xác thực bởi BQL làng gốm Bát Tràng" />}
            <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-giay/10 px-3 py-1.5 text-sm">
              {locked ? <><Lock className="size-3.5" /> Nhật ký đã khóa {b.lockedAt ? `ngày ${formatDate(b.lockedAt)}` : ""}</> : <><Loader className="size-3.5" /> Đang thực hiện · cập nhật {formatDate(b.updatedAt)}</>}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-giay/10 px-3 py-1.5 text-sm">
              <ScanLine className="size-3.5" /> {formatNumber(b.scanCount)} lượt quét
            </span>
          </div>
        </div>
      </header>

      {/* Người làm & thông số */}
      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:px-6">
        <Link href={`/artisans/${b.artisan.slug}`} className="tile glaze flex gap-4 bg-su p-5">
          <VImage image={asImage(b.artisan.coverImage)} ratio="1/1" sizes="88px" className="w-[88px] shrink-0 rounded-[6px]" />
          <div>
            <p className="font-serif text-2xl font-bold">{b.artisan.workshopName}</p>
            <p className="text-sm text-tro">{b.artisan.artisanTitle} {b.artisan.artisanName} · dòng họ {b.artisan.clanName} · đời thứ {b.artisan.generation}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-tro"><MapPin className="size-3.5" /> {formatCoord(b.artisan.latitude, b.artisan.longitude)}</p>
          </div>
        </Link>
        <dl className="mosaic grid-cols-2 text-sm">
          {[
            { icon: Mountain, label: "Nguồn đất", value: b.clayOrigin },
            { icon: Flame, label: "Đỉnh nhiệt", value: `${formatNumber(b.peakTempC)}°C · ${b.kilnType}` },
            { icon: Timer, label: "Thời gian nung", value: `${b.firingDurationHr} giờ liên tục` },
            { icon: Package, label: "Số lượng lô", value: `${formatNumber(b.quantityProduced)} sản phẩm · ${GLAZES[b.glazeType].label}` },
          ].map((x) => (
            <div key={x.label} className="tile bg-su p-4">
              <dt className="flex items-center gap-1.5 text-xs text-tro"><x.icon className="size-3.5" /> {x.label}</dt>
              <dd className="mt-1 leading-snug">{x.value}</dd>
            </div>
          ))}
        </dl>
        {b.quoteRequest && (
          <p className="rounded-[var(--radius-tile)] bg-lam-nhat p-4 text-sm text-lam md:col-span-2">
            Lô này là một phần của đơn sỉ <strong>{b.quoteRequest.requestCode}</strong> cho {b.quoteRequest.organizationName}.
          </p>
        )}
      </section>

      {/* Hành trình */}
      <section className="crackle-bg py-16">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-6">
          <h2 className="title-lg">Từ bể đánh đến lửa 1.300°C</h2>
          <p className="mx-auto mt-3 max-w-xl text-tro">{stages.length} mốc nhật ký, mỗi mốc kèm ảnh chụp tại xưởng. Cuộn xuống để đi theo mạch lửa.</p>
        </div>
        <div className="mt-14 px-4 md:px-6">
          {stages.length ? <KilnTimeline stages={stages} startDate={startDate} /> : <p className="text-center text-tro">Lô vừa được mở, xưởng chưa ghi mốc nào.</p>}
        </div>
      </section>

      {/* Sản phẩm cùng lô & chứng nhận QR */}
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-[1fr_280px] md:px-6">
        <div>
          <h2 className="title-md">Sản phẩm cùng lô</h2>
          <p className="mt-2 text-sm text-tro">Mọi sản phẩm dưới đây dùng chung một mã QR của lô {b.batchCode}.</p>
          {b.products.length ? (
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {b.products.map((p) => (
                <li key={p.slug}>
                  <Link href={`/products/${p.slug}`} className="group block">
                    <div className="tile glaze"><VImage image={asImages(p.images)[0]} ratio="4/5" sizes="200px" /></div>
                    <p className="mt-2 font-serif text-lg font-bold leading-tight group-hover:text-lam">{p.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-tro">{b.quoteRequest ? "Lô sản xuất theo đơn đặt riêng, không bày bán lẻ." : "Chưa có sản phẩm nào được gắn vào lô."}</p>
          )}
        </div>
        <aside className="tile relative h-fit overflow-visible bg-su p-5 text-center">
          {verified && <SealStamp className="absolute -top-6 right-1 size-20 sm:-right-5" />}
          <p className="label">Chứng nhận QR của lô</p>
          <Image src={b.qrCodeDataUrl} alt={`Mã QR ${b.batchCode}`} width={200} height={200} unoptimized className="mx-auto mt-3" />
          <p className="code mt-2 block text-sm">{b.batchCode}</p>
          <p className="text-xs text-tro">{b.artisan.workshopName}</p>
          <PrintButton />
        </aside>
      </section>
    </article>
  );
}
