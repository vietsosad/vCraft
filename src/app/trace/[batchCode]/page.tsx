import type { Metadata } from "next";
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
import { VerifiedSeal, EmptyState } from "@/components/ui/primitives";
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
      <header className="relative overflow-hidden bg-ink text-kaolin">
        <div className="absolute inset-0 opacity-45">
          <VImage image={cover} ratio="auto" priority sizes="100vw" className="h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-16 md:px-6 md:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ember">Hồ sơ truy xuất nguồn gốc · {b.batchCode}</p>
          <h1 className="mt-4 max-w-3xl text-4xl md:text-6xl">{b.batchTitle}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {verified && <VerifiedSeal className="border-ember text-ember" label="Xác thực bởi BQL làng gốm Bát Tràng" />}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm">
              {locked ? <><Lock className="size-3.5" /> Nhật ký đã khóa {b.lockedAt ? `ngày ${formatDate(b.lockedAt)}` : ""}</> : <><Loader className="size-3.5" /> Đang thực hiện · cập nhật {formatDate(b.updatedAt)}</>}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm">
              <ScanLine className="size-3.5" /> {formatNumber(b.scanCount)} lượt quét
            </span>
          </div>
        </div>
      </header>

      {/* Người làm & thông số */}
      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:px-6">
        <Link href={`/artisans/${b.artisan.slug}`} className="flex gap-4 rounded-[var(--radius-tile)] border border-line bg-white/70 p-5 hover:border-terracotta/40">
          <VImage image={asImage(b.artisan.coverImage)} ratio="1/1" sizes="88px" className="w-[88px] shrink-0 rounded-full" />
          <div>
            <p className="eyebrow">Người làm ra lô này</p>
            <p className="mt-1 font-display text-2xl">{b.artisan.workshopName}</p>
            <p className="text-sm text-ash">{b.artisan.artisanTitle} {b.artisan.artisanName} · dòng họ {b.artisan.clanName} · đời thứ {b.artisan.generation}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-ash"><MapPin className="size-3.5" /> {formatCoord(b.artisan.latitude, b.artisan.longitude)}</p>
          </div>
        </Link>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-tile)] border border-line bg-line text-sm">
          {[
            { icon: Mountain, label: "Nguồn đất", value: b.clayOrigin },
            { icon: Flame, label: "Đỉnh nhiệt", value: `${formatNumber(b.peakTempC)}°C · ${b.kilnType}` },
            { icon: Timer, label: "Thời gian nung", value: `${b.firingDurationHr} giờ liên tục` },
            { icon: Package, label: "Số lượng lô", value: `${formatNumber(b.quantityProduced)} sản phẩm · ${GLAZES[b.glazeType].label}` },
          ].map((x) => (
            <div key={x.label} className="bg-kaolin p-4">
              <dt className="flex items-center gap-1.5 text-xs text-ash"><x.icon className="size-3.5" /> {x.label}</dt>
              <dd className="mt-1 leading-snug">{x.value}</dd>
            </div>
          ))}
        </dl>
        {b.quoteRequest && (
          <p className="rounded-[var(--radius-tile)] bg-cobalt/10 p-4 text-sm text-cobalt md:col-span-2">
            Lô này là một phần của đơn sỉ <strong>{b.quoteRequest.requestCode}</strong> cho {b.quoteRequest.organizationName}.
          </p>
        )}
      </section>

      {/* Hành trình */}
      <section className="crackle-bg py-16">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-6">
          <p className="eyebrow">Hành trình ra đời</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Từ bể đánh đến lửa 1.300°C</h2>
          <p className="mx-auto mt-3 max-w-xl text-ash">{stages.length} mốc nhật ký, mỗi mốc kèm ảnh chụp tại xưởng. Cuộn xuống để đi theo mạch lửa.</p>
        </div>
        <div className="mt-14 px-4 md:px-6">
          {stages.length ? <KilnTimeline stages={stages} startDate={startDate} /> : <p className="text-center text-ash">Lô vừa được mở, xưởng chưa ghi mốc nào.</p>}
        </div>
      </section>

      {/* Sản phẩm cùng lô & chứng nhận QR */}
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-[1fr_280px] md:px-6">
        <div>
          <h2 className="text-3xl">Sản phẩm cùng lô</h2>
          <p className="mt-2 text-sm text-ash">Mọi sản phẩm dưới đây dùng chung một mã QR của lô {b.batchCode}.</p>
          {b.products.length ? (
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {b.products.map((p) => (
                <li key={p.slug}>
                  <Link href={`/products/${p.slug}`} className="group block">
                    <VImage image={asImages(p.images)[0]} ratio="4/5" sizes="200px" className="rounded-[var(--radius-tile)]" />
                    <p className="mt-2 font-display text-lg leading-tight group-hover:text-terracotta">{p.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-ash">{b.quoteRequest ? "Lô sản xuất theo đơn đặt riêng, không bày bán lẻ." : "Chưa có sản phẩm nào được gắn vào lô."}</p>
          )}
        </div>
        <aside className="rounded-[var(--radius-tile)] border-2 border-dashed border-terracotta/40 bg-white/70 p-5 text-center">
          <p className="eyebrow">Chứng nhận QR của lô</p>
          <Image src={b.qrCodeDataUrl} alt={`Mã QR ${b.batchCode}`} width={200} height={200} unoptimized className="mx-auto mt-3" />
          <p className="mt-2 font-mono text-sm">{b.batchCode}</p>
          <p className="text-xs text-ash">{b.artisan.workshopName}</p>
          <PrintButton />
        </aside>
      </section>
    </article>
  );
}
