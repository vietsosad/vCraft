import type { ReactNode } from "react";
import Link from "next/link";
import type { BookingStatus } from "@prisma/client";
import { ArrowRight, CalendarPlus, Navigation, ShieldCheck } from "lucide-react";
import { GLAZES, QUOTE_STATUS } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd, timeAgo } from "@/lib/format";
import type { BuyerQuote, TracedBatch } from "@/lib/services/cabinet-service";
import { OrderTrack } from "./order-track";
import { StatusMark } from "@/components/ui/primitives";
import { VImage } from "@/components/ui/vimage";
import { cn } from "@/lib/cn";

export { OrderTrack };

/** Đồ giấy trong tủ: phiếu đặt hàng (đơn sỉ), vé trải nghiệm (lịch hẹn), giấy truy xuất (lô đã quét). */

/** Nhãn trạng thái lịch hẹn (bản riêng phía server: hằng số trong module "use client" không đọc được ở đây). */
const TICKET_STATUS: Record<BookingStatus, { label: string; mark: "dot" | "diamond" | "square" | "ring" }> = {
  PENDING: { label: "Chờ xưởng xác nhận", mark: "diamond" },
  CONFIRMED: { label: "Đã xác nhận", mark: "dot" },
  COMPLETED: { label: "Đã diễn ra", mark: "square" },
  DECLINED: { label: "Xưởng từ chối", mark: "ring" },
  CANCELLED: { label: "Đã hủy", mark: "ring" },
};

const DOW = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export function visitWhen(date: Date, slot: string) {
  return `${DOW[date.getUTCDay()]} ${date.getUTCDate()}/${date.getUTCMonth() + 1}, ${slot}`;
}

export function slotRange(slot: string, minutes = 120) {
  const [h, m] = slot.split(":").map(Number);
  const end = h! * 60 + m! + minutes;
  return `${slot} – ${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

/* ---------------- Đơn sỉ ---------------- */

/** Phiếu đặt hàng: một đơn sỉ trên tờ giấy có cuống xé, việc cần làm tiếp nằm ở góc phải. */
export function OrderSlip({ q, compact = false }: { q: BuyerQuote; compact?: boolean }) {
  const href = `/account/quotes/${q.code}`;
  if (compact) {
    return (
      <article className="slip paper group relative transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] hover:-translate-y-0.5">
        <div className="grid gap-2 px-3.5 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-[1.08rem] font-bold leading-snug">
              <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">{q.title}</Link>
            </h3>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-tro">
              <span className="code text-lam">{q.code}</span>
              <span aria-hidden>·</span>
              <span className="tabular">{formatNumber(q.quantity)} sp</span>
            </p>
            <OrderTrack status={q.status} labels={false} className="mt-2 max-w-64" />
          </div>
          <p className={cn("text-sm font-semibold sm:text-right", q.next?.urgent ? "text-datnung" : "text-tro")}>
            {q.next ? q.next.label : q.status === "DRAFT_REQUEST" ? "Bản nháp" : QUOTE_STATUS[q.status].label}
          </p>
        </div>
      </article>
    );
  }
  return (
    <article className="slip paper group relative transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] hover:-translate-y-0.5">
      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0">
          <h3 className="font-serif text-[1.4rem] font-bold leading-tight">
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">{q.title}</Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-tro">
            <span className="code text-[0.9rem] text-lam">{q.code}</span>
            <span aria-hidden>·</span>
            <span>gửi {formatDate(q.createdAt)}</span>
            <span aria-hidden>·</span>
            <span>cập nhật {timeAgo(q.updatedAt)}</span>
          </p>
          <p className="mt-1 text-sm text-tro">
            <span className="tabular font-semibold text-muc">{formatNumber(q.quantity)}</span> sản phẩm · {GLAZES[q.glaze].label} · ngân sách {formatVnd(q.budget)}/sp · cần trong {q.deadlineDays} ngày
          </p>
          <OrderTrack status={q.status} className="mt-4 max-w-xl" />
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-dashed border-muc/15 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm md:grid-cols-1">
            <div>
              <dt className="text-xs text-tro">Chào giá</dt>
              <dd className="font-display text-2xl leading-none tabular">{q.bids}</dd>
            </div>
            {q.workshops.length > 0 ? (
              <div>
                <dt className="text-xs text-tro">Xưởng nhận làm</dt>
                <dd className="font-medium leading-snug">{q.workshops.map((w) => w.workshopName).join(", ")}</dd>
              </div>
            ) : null}
            {q.total > 0 && (
              <div>
                <dt className="text-xs text-tro">Giá trị đã chốt</dt>
                <dd className="font-semibold tabular">{formatVnd(q.total)}</dd>
              </div>
            )}
          </dl>
          {q.next ? (
            <p className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", q.next.urgent ? "text-datnung" : "text-lam")}>
              {q.next.label} <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
            </p>
          ) : (
            <p className="text-sm text-tro">{q.status === "DELIVERED" ? "Đơn đã hoàn tất" : q.status === "CANCELLED" ? "Đơn đã hủy" : "Đang chờ phía xưởng"}</p>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---------------- Lịch hẹn ---------------- */

export type TicketBooking = {
  code: string;
  visitDate: Date;
  slot: string;
  guests: number;
  totalVnd: number;
  status: BookingStatus;
  artisanNote?: string | null;
  artisan: { workshopName: string; slug: string; address: string; latitude: number; longitude: number; phone?: string | null };
};

export function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** Vé tham quan xưởng: cuống ngày tháng bên trái, đường xé có khuyết, thông tin và thao tác bên phải. */
export function VisitTicket({
  b,
  size = "full",
  actions,
  className,
}: {
  b: TicketBooking;
  size?: "full" | "compact";
  actions?: ReactNode;
  className?: string;
}) {
  const s = TICKET_STATUS[b.status];
  const live = b.status === "PENDING" || b.status === "CONFIRMED";
  const used = b.status === "COMPLETED";
  const compact = size === "compact";
  return (
    <div className={cn("ticket-shadow", className)}>
      <article className={cn("ticket paper", used && "ticket-punched")} style={compact ? { ["--stub" as string]: "84px" } : undefined}>
        <div
          className={cn(
            "flex flex-col items-center justify-center px-2 py-4 text-center leading-none",
            b.status === "CONFIRMED" ? "tile-lam text-giay" : live ? "bg-lam-nhat text-lam" : "bg-nga-sau text-tro",
          )}
        >
          <span className="text-[11px] font-semibold">{DOW[b.visitDate.getUTCDay()]}</span>
          <span className={cn("font-display tabular", compact ? "my-1 text-[2.6rem]" : "my-1.5 text-[3.2rem]")}>{b.visitDate.getUTCDate()}</span>
          <span className="text-[11px] font-semibold">tháng {b.visitDate.getUTCMonth() + 1}</span>
        </div>
        <div className={cn("min-w-0", compact ? "py-3 pl-5 pr-3.5" : "py-4 pl-6 pr-4 sm:pr-5")}>
          <h3 className={cn("font-serif font-bold leading-tight", compact ? "text-[1.15rem]" : "text-[1.45rem]")}>
            <Link href={`/artisans/${b.artisan.slug}`} className="hover:text-lam">{b.artisan.workshopName}</Link>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-tro">
            <StatusMark mark={s.mark} className={cn(b.status === "CONFIRMED" ? "text-lam" : b.status === "PENDING" ? "text-vangrom-dam" : "text-tro")} />
            {s.label}
            {!compact && (
              <>
                <span aria-hidden className="font-normal">·</span>
                <span className="code font-normal">{b.code}</span>
              </>
            )}
          </p>
          <p className="mt-0.5 text-sm tabular text-muc/85">
            {slotRange(b.slot)} · {b.guests} khách{!compact && <> · {formatVnd(b.totalVnd)}</>}
          </p>
          {!compact && <p className="mt-0.5 text-sm text-tro">{b.artisan.address}{b.artisan.phone ? ` · ${b.artisan.phone}` : ""}</p>}
          {!compact && b.artisanNote && <p className="mt-2 font-serif text-[1.02rem] italic text-muc/85">Xưởng nhắn: “{b.artisanNote}”</p>}
          {((live && !compact) || actions) && (
            <div className={cn("flex flex-wrap items-center gap-x-1 gap-y-2", compact ? "mt-2" : "mt-3.5")}>
              {live && !compact && (
                <>
                  <a href={`/api/bookings/${b.code}/ics`} download className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-tile)] px-2.5 text-sm font-semibold text-lam transition hover:bg-lam-nhat">
                    <CalendarPlus className="size-4" aria-hidden /> Thêm vào lịch
                  </a>
                  <a href={directionsUrl(b.artisan.latitude, b.artisan.longitude)} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-tile)] px-2.5 text-sm font-semibold text-lam transition hover:bg-lam-nhat">
                    <Navigation className="size-4" aria-hidden /> Chỉ đường
                  </a>
                </>
              )}
              {actions}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

/* ---------------- Sổ truy xuất ---------------- */

/** Giấy truy xuất: ảnh món đồ, mã lô, xưởng làm ra, ngày khóa nhật ký và số lần khách đã quét. */
export function TraceSheet({ t, size = "full" }: { t: TracedBatch; size?: "full" | "compact" }) {
  const href = `/trace/${t.code}`;
  if (size === "compact") {
    return (
      <article className="paper group relative flex min-w-0 gap-3 rounded-[4px] p-2.5 shadow-[0_10px_18px_-14px_rgb(28_18_12/0.6)] transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] hover:-translate-y-0.5">
        <VImage image={t.image} ratio="1/1" sizes="72px" className="w-16 shrink-0 rounded-[3px]" />
        <div className="min-w-0">
          <h3 className="truncate font-serif text-[1.02rem] font-bold leading-snug">
            <Link href={href} className="after:absolute after:inset-0">{t.product?.name ?? t.title}</Link>
          </h3>
          <p className="truncate text-xs text-tro">{t.artisan.workshopName}</p>
          <p className="code text-lam">{t.code}</p>
        </div>
      </article>
    );
  }
  return (
    <article className="paper group relative grid min-w-0 overflow-hidden rounded-[6px] shadow-[0_1px_0_rgb(28_18_12/0.06),0_16px_28px_-20px_rgb(28_18_12/0.6)] sm:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="relative h-48 sm:h-auto sm:min-h-full">
        <div className="absolute inset-0">
          <VImage image={t.image} ratio="auto" sizes="(max-width: 640px) 100vw, 180px" className="h-full" imgClassName="transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out-expo)] group-hover:scale-105" />
        </div>
      </div>
      <div className="min-w-0 p-4 sm:p-5">
        <h3 className="font-serif text-[1.35rem] font-bold leading-tight">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">{t.product?.name ?? t.title}</Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-tro">
          <span className="code text-[0.9rem] text-lam">{t.code}</span>
          <span aria-hidden>·</span>
          <span>{GLAZES[t.glaze].label}</span>
        </p>
        <p className="mt-0.5 text-sm text-tro">
          {t.artisan.workshopName}
          {t.artisan.verificationStatus === "APPROVED" && (
            <span className="ml-1.5 inline-flex items-center gap-1 align-middle text-xs font-semibold text-datnung">
              <ShieldCheck className="size-3.5" aria-hidden /> Hộ nghề xác thực
            </span>
          )}
        </p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="text-xs text-tro">Công đoạn</dt>
            <dd className="font-semibold tabular">{t.stages} mốc</dd>
          </div>
          <div>
            <dt className="text-xs text-tro">Nung</dt>
            <dd className="font-semibold tabular">{formatNumber(t.peakTempC)}°C</dd>
          </div>
          <div>
            <dt className="text-xs text-tro">{t.locked ? "Khóa nhật ký" : "Nhật ký"}</dt>
            <dd className="font-semibold">{t.locked && t.lockedAt ? formatDate(t.lockedAt) : "đang ghi"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-tro">
          Bạn đã quét {t.scans > 1 ? `${t.scans} lần, lần cuối` : ""} {timeAgo(t.lastScan)}
        </p>
      </div>
    </article>
  );
}
