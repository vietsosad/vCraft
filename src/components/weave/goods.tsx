import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BookingStatus } from "@prisma/client";
import { ArrowRight, CalendarPlus, Navigation, ShieldCheck } from "lucide-react";
import { GLAZES } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd, timeAgo } from "@/lib/format";
import type { BuyerQuote, TracedBatch } from "@/lib/services/buyer-zone";
import type { MediaImage } from "@/lib/types";
import { cutoutFor } from "@/lib/cutouts";
import { StatusMark } from "@/components/ui/primitives";
import { VImage } from "@/components/ui/vimage";
import { cn } from "@/lib/cn";
import { WeaveTrack } from "./woven";

/** Đồ trên tấm dệt: miếng vải đơn sỉ, miếng lịch hẹn, giấy truy xuất, món đồ bày trên vải. */

const DOW = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export function visitWhen(date: Date, slot: string) {
  return `${DOW[date.getUTCDay()]} ${date.getUTCDate()}/${date.getUTCMonth() + 1}, ${slot}`;
}

export function slotRange(slot: string, minutes = 120) {
  const [h, m] = slot.split(":").map(Number);
  const end = h! * 60 + m! + minutes;
  return `${slot} – ${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

export function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function dowOf(date: Date) {
  return DOW[date.getUTCDay()]!;
}

/* ---------------- Đơn sỉ ---------------- */

/** Một đơn sỉ trên miếng vải khâu: tên đơn, mã, tiến độ dệt, việc cần làm tiếp. */
export function OrderPatch({ q, compact = false }: { q: BuyerQuote; compact?: boolean }) {
  const href = `/account/quotes/${q.code}`;
  const next = q.next ? q.next.label : q.status === "DELIVERED" ? "Đơn đã hoàn tất" : q.status === "CANCELLED" ? "Đơn đã hủy" : "Đang chờ phía xưởng";
  const weight = q.next?.urgent ? "dense" : q.status === "DELIVERED" || q.status === "CANCELLED" ? "thin" : "";
  if (compact) {
    return (
      <article className={cn("patch lift group relative px-5 py-4", weight)} data-hue="n7">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
          <div className="min-w-0">
            <h3 className="truncate text-base leading-snug">
              <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">{q.title}</Link>
            </h3>
            <p className="mt-0.5 text-[13px] text-tro">
              <span className="code text-chu-nau">{q.code}</span> · <span className="tabular">{formatNumber(q.quantity)} sp</span> · {q.bids} chào giá
            </p>
            <WeaveTrack status={q.status} labels={false} className="mt-2.5 max-w-72 text-muc" />
          </div>
          <p className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", q.next?.urgent ? "text-chu-nau" : "text-tro")}>
            {next}
            {q.next && <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />}
          </p>
        </div>
      </article>
    );
  }
  return (
    <article className={cn("patch lift group relative", weight)} data-hue="n7">
      <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0">
          <h3 className="text-lg leading-snug">
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">{q.title}</Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-tro">
            <span className="code text-sm text-chu-nau">{q.code}</span>
            <span aria-hidden>·</span>
            <span>gửi {formatDate(q.createdAt)}</span>
            <span aria-hidden>·</span>
            <span>cập nhật {timeAgo(q.updatedAt)}</span>
          </p>
          <p className="mt-2 text-sm text-tro">
            <span className="tabular font-semibold text-muc">{formatNumber(q.quantity)}</span> sản phẩm · {GLAZES[q.glaze].label} · ngân sách {formatVnd(q.budget)}/sp · cần trong {q.deadlineDays} ngày
          </p>
          <WeaveTrack status={q.status} className="mt-4 max-w-xl text-muc" />
        </div>
        <div className="flex flex-col justify-between gap-4 md:border-l md:border-dashed md:border-muc/15 md:pl-5">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm md:grid-cols-1">
            <div>
              <dt className="nhan text-tro">Chào giá</dt>
              <dd className="so mt-0.5 text-[1.75rem] text-chu-nau">{q.bids}</dd>
            </div>
            {q.workshops.length > 0 && (
              <div>
                <dt className="nhan text-tro">Xưởng nhận làm</dt>
                <dd className="mt-1 font-medium leading-snug">{q.workshops.map((w) => w.workshopName).join(", ")}</dd>
              </div>
            )}
            {q.total > 0 && (
              <div>
                <dt className="nhan text-tro">Giá trị đã chốt</dt>
                <dd className="mt-1 font-semibold tabular">{formatVnd(q.total)}</dd>
              </div>
            )}
          </dl>
          <p className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", q.next ? "text-chu-nau" : "text-tro")}>
            {next}
            {q.next && <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />}
          </p>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Lịch hẹn ---------------- */

const VISIT_STATUS: Record<BookingStatus, { label: string; mark: "dot" | "diamond" | "square" | "ring" }> = {
  PENDING: { label: "Chờ xưởng xác nhận", mark: "diamond" },
  CONFIRMED: { label: "Đã xác nhận", mark: "dot" },
  COMPLETED: { label: "Đã diễn ra", mark: "square" },
  DECLINED: { label: "Xưởng từ chối", mark: "ring" },
  CANCELLED: { label: "Đã hủy", mark: "ring" },
};

export type VisitBooking = {
  code: string;
  visitDate: Date;
  slot: string;
  guests: number;
  totalVnd: number;
  status: BookingStatus;
  note?: string | null;
  artisanNote?: string | null;
  artisan: { workshopName: string; slug: string; address: string; latitude: number; longitude: number; phone?: string | null };
};

/** Liên kết thêm vào lịch và chỉ đường (chỉ cho lịch còn hiệu lực). */
export function VisitLinks({ b, className }: { b: VisitBooking; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-x-1 gap-y-2", className)}>
      <a href={`/api/bookings/${b.code}/ics`} download className="inline-flex min-h-11 items-center gap-1.5 rounded-[3px] px-2.5 text-sm font-semibold underline decoration-current/30 underline-offset-4 transition hover:decoration-current">
        <CalendarPlus className="size-4" aria-hidden /> Thêm vào lịch
      </a>
      <a href={directionsUrl(b.artisan.latitude, b.artisan.longitude)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-[3px] px-2.5 text-sm font-semibold underline decoration-current/30 underline-offset-4 transition hover:decoration-current">
        <Navigation className="size-4" aria-hidden /> Chỉ đường
      </a>
    </div>
  );
}

/** Một buổi trải nghiệm trên miếng vải: ngày lớn bên trái, xưởng và giờ bên phải. */
export function VisitPatch({ b, actions, className }: { b: VisitBooking; actions?: ReactNode; className?: string }) {
  const s = VISIT_STATUS[b.status];
  const live = b.status === "PENDING" || b.status === "CONFIRMED";
  return (
    <article className={cn("patch grid grid-cols-[5.5rem_minmax(0,1fr)] gap-0 overflow-hidden sm:grid-cols-[7rem_minmax(0,1fr)]", !live && "opacity-90", className)} data-hue="n6">
      <div className={cn("flex flex-col items-center justify-center px-2 py-5 text-center leading-none", live ? "bg-nau text-[#fbfaf5]" : "bg-muc/8 text-muc/75")}>
        <span className="nhan">{dowOf(b.visitDate)}</span>
        <span className="so my-1 text-[2rem]">{b.visitDate.getUTCDate()}</span>
        <span className="nhan">tháng {b.visitDate.getUTCMonth() + 1}</span>
      </div>
      <div className="min-w-0 px-5 py-4">
        <h3 className="text-lg leading-snug">
          <Link href={`/artisans/${b.artisan.slug}`} className="hover:underline">{b.artisan.workshopName}</Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] font-semibold text-tro">
          <StatusMark mark={s.mark} className={b.status === "CONFIRMED" ? "text-chu-nau" : b.status === "PENDING" ? "text-[#a8700f]" : "text-tro"} />
          {s.label}
          <span aria-hidden className="font-normal">·</span>
          <span className="code font-normal">{b.code}</span>
        </p>
        <p className="mt-1 text-sm tabular">{slotRange(b.slot)} · {b.guests} khách · {formatVnd(b.totalVnd)}</p>
        <p className="mt-0.5 text-sm text-tro">{b.artisan.address}{b.artisan.phone ? ` · ${b.artisan.phone}` : ""}</p>
        {b.artisanNote && <p className="mt-2 text-sm">Xưởng nhắn: “{b.artisanNote}”</p>}
        {(live || actions) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {live && <VisitLinks b={b} className="-ml-2.5 text-chu-nau" />}
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}

/* ---------------- Sổ truy xuất ---------------- */

export function TracePatch({ t, compact = false }: { t: TracedBatch; compact?: boolean }) {
  const href = `/trace/${t.code}`;
  if (compact) {
    return (
      <article className="patch lift group relative flex min-w-0 items-center gap-3 p-3" data-hue="n4">
        <VImage image={t.image} ratio="1/1" sizes="72px" className="w-16 shrink-0 rounded-[2px]" />
        <div className="min-w-0">
          <h3 className="truncate text-base leading-snug">
            <Link href={href} className="after:absolute after:inset-0">{t.product?.name ?? t.title}</Link>
          </h3>
          <p className="truncate text-[13px] text-tro">{t.artisan.workshopName}</p>
          <p className="code text-chu-nau">{t.code}</p>
        </div>
      </article>
    );
  }
  return (
    <article className="patch lift group relative grid min-w-0 overflow-hidden sm:grid-cols-[11rem_minmax(0,1fr)]" data-hue="n4">
      <div className="relative h-48 sm:h-auto sm:min-h-full">
        <div className="absolute inset-0">
          <VImage image={t.image} ratio="auto" sizes="(max-width: 640px) 100vw, 180px" className="h-full" imgClassName="transition-transform duration-300 group-hover:scale-[1.03]" />
        </div>
      </div>
      <div className="min-w-0 p-5">
        <h3 className="text-lg leading-snug">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">{t.product?.name ?? t.title}</Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-tro">
          <span className="code text-sm text-chu-nau">{t.code}</span>
          <span aria-hidden>·</span>
          <span>{GLAZES[t.glaze].label}</span>
        </p>
        <p className="mt-1 text-sm text-tro">
          {t.artisan.workshopName}
          {t.artisan.verificationStatus === "APPROVED" && (
            <span className="ml-1.5 inline-flex items-center gap-1 align-middle text-[13px] font-semibold text-datnung">
              <ShieldCheck className="size-3.5" aria-hidden /> Hộ nghề xác thực
            </span>
          )}
        </p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="nhan text-tro">Công đoạn</dt>
            <dd className="mt-0.5 font-semibold tabular">{t.stages} mốc</dd>
          </div>
          <div>
            <dt className="nhan text-tro">Nung</dt>
            <dd className="mt-0.5 font-semibold tabular">{formatNumber(t.peakTempC)}°C</dd>
          </div>
          <div>
            <dt className="nhan text-tro">{t.locked ? "Khóa nhật ký" : "Nhật ký"}</dt>
            <dd className="mt-0.5 font-semibold">{t.locked && t.lockedAt ? formatDate(t.lockedAt) : "đang ghi"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[13px] text-tro">Bạn đã quét {t.scans > 1 ? `${t.scans} lần, lần cuối` : ""} {timeAgo(t.lastScan)}</p>
      </div>
    </article>
  );
}

/* ---------------- Món đồ bày trên vải ---------------- */

/**
 * Tác phẩm đã lưu bày trên dải vải: ảnh đã tách nền thì món đồ đứng thẳng trên vải với bóng tiếp đất;
 * ảnh chưa tách được thì là một miếng ảnh khâu đính lên vải.
 */
export function LaidPiece({ href, name, image, sizes, className }: { href: string; name: string; image: MediaImage | null | undefined; sizes: string; className?: string }) {
  const cut = cutoutFor(image?.src);
  return (
    <Link href={href} className={cn("group relative block transition-transform duration-200 hover:-translate-y-1", className)} title={name}>
      {cut ? (
        <span className="relative block aspect-[4/5]">
          <span aria-hidden className="absolute inset-x-[10%] -bottom-1 h-2.5 rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_0_0/0.4),transparent)]" />
          <Image src={cut} alt={image?.alt || name} fill sizes={sizes} className="object-contain object-bottom drop-shadow-[0_10px_8px_rgb(0_0_0/0.25)]" />
        </span>
      ) : (
        <span className="patch block p-[7px]">
          <VImage image={image} ratio="4/5" sizes={sizes} className="rounded-[2px]" />
        </span>
      )}
      <span className="sr-only">{name}</span>
    </Link>
  );
}
