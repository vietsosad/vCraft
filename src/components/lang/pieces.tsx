import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BookingStatus, QuoteStatus } from "@prisma/client";
import { CalendarPlus, Navigation, ShieldCheck } from "lucide-react";
import { GLAZES, QUOTE_STATUS } from "@/lib/constants";
import { formatDate, formatNumber, formatVnd, timeAgo } from "@/lib/format";
import type { BuyerQuote, TracedBatch } from "@/lib/services/buyer-zone";
import type { MediaImage } from "@/lib/types";
import { cutoutFor } from "@/lib/cutouts";
import { StatusMark } from "@/components/ui/primitives";
import { VImage } from "@/components/ui/vimage";
import { NotificationLink } from "@/components/account/notification-link";
import { cn } from "@/lib/cn";
import { ArrowGo, HoiVan, TramIcon, type TramKind } from "./glyphs";
import { CONG_DOAN, hoaDau, soChu, stageOf } from "./words";

export { CONG_DOAN, hoaDau, soChu, stageOf };

/* ================= Nút và liên kết của đường làng ================= */

const men = "shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-2px_0_rgb(0_0_0/0.12)] active:translate-y-px";
export const NUT = {
  /** men lam: hành động chính */
  lam: `inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-lam px-5 text-[15px] font-semibold text-on transition hover:bg-lam-sang ${men}`,
  /** đất nung: tạo mới (yêu cầu báo giá) */
  dat: `inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-datnung px-5 text-[15px] font-semibold text-on transition hover:bg-datnung-dam ${men}`,
  /** viền: hành động phụ */
  vien: "inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-muc/20 bg-su/70 px-5 text-[15px] font-semibold text-muc transition hover:border-muc/45 hover:bg-su active:translate-y-px",
};
export const LIEN_KET = "inline-flex min-h-11 items-center gap-1.5 font-semibold text-lam underline-offset-4 hover:underline";

/* ================= Ngày giờ, chỉ đường ================= */

const DOW = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
export function dowOf(date: Date) {
  return DOW[date.getUTCDay()]!;
}
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

/* ================= Sáu công đoạn: tên đất của sáu trạng thái đơn sỉ ================= */

/** Dải sáu viên công đoạn: viên đã qua nung đỏ đất, viên hiện tại cam lửa, viên chưa tới màu đất sống. */
export function StageTrack({ status, className }: { status: QuoteStatus; className?: string }) {
  const k = stageOf(status);
  const label = k === 0 ? "Đơn đã hủy" : k === 7 ? "Đã qua đủ sáu công đoạn" : `Công đoạn ${k}/6: ${CONG_DOAN[k - 1]}`;
  return (
    <span role="img" aria-label={label} className={cn("grid grid-cols-6 gap-1.5", className)}>
      {CONG_DOAN.map((c, i) => (
        <span key={c} title={c} className={cn("o", k === 0 ? "huy" : i + 1 < k ? "da" : i + 1 === k ? "nay" : "")} />
      ))}
    </span>
  );
}

/* ================= Đơn sỉ ================= */

export function OrderCard({ q, compact = false }: { q: BuyerQuote; compact?: boolean }) {
  const href = `/account/quotes/${q.code}`;
  const next = q.next ? q.next.label : q.status === "DELIVERED" ? "Đơn đã hoàn tất" : q.status === "CANCELLED" ? "Đơn đã hủy" : "Đang chờ phía xưởng";
  return (
    <article className="viec relative flex-col items-stretch gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={cn("min-w-0 leading-snug", compact ? "text-base" : "text-lg")}>
          <Link href={href} className="phu-ca after:absolute after:inset-0 focus-visible:outline-none">{q.title}</Link>
        </h3>
        <span className="code shrink-0 text-[13px] text-lam">{q.code}</span>
      </div>
      <StageTrack status={q.status} />
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <span className="text-tro">
          {QUOTE_STATUS[q.status].label} · <span className="tabular">{formatNumber(q.quantity)}</span> sp · {q.bids} chào giá
          {!compact && <> · {GLAZES[q.glaze].label} · ngân sách {formatVnd(q.budget)}/sp</>}
        </span>
        <span className={cn("inline-flex items-center gap-1.5 font-semibold", q.next?.urgent ? "text-datnung" : q.next ? "text-lam" : "text-tro")}>
          {next}
          {q.next && <ArrowGo className="size-4" />}
        </span>
      </div>
      {!compact && (q.workshops.length > 0 || q.total > 0) && (
        <p className="border-t border-dashed border-vua pt-2.5 text-sm text-tro">
          {q.workshops.length > 0 && <>Xưởng nhận làm: <span className="font-medium text-muc">{q.workshops.map((w) => w.workshopName).join(", ")}</span></>}
          {q.total > 0 && <> · giá trị đã chốt <span className="tabular font-semibold text-muc">{formatVnd(q.total)}</span></>}
          <> · cập nhật {timeAgo(q.updatedAt)}</>
        </p>
      )}
    </article>
  );
}

/** Đồng hồ lò: kim chỉ chặng hiện tại của đơn đang được chờ nhiều nhất (cung 240°, mỗi chặng 40°). */
export function KilnDial({ q }: { q: BuyerQuote }) {
  const k = Math.min(6, Math.max(1, stageOf(q.status)));
  const angle = -120 + 40 * (k - 0.5);
  const seg = [
    "M36.86 168 A96 96 0 0 1 25.46 103.33", "M25.46 103.33 A96 96 0 0 1 58.29 46.46", "M58.29 46.46 A96 96 0 0 1 120 24",
    "M120 24 A96 96 0 0 1 181.71 46.46", "M181.71 46.46 A96 96 0 0 1 214.54 103.33", "M214.54 103.33 A96 96 0 0 1 203.14 168",
  ];
  return (
    <div className="relative overflow-hidden rounded-[12px] p-6 shadow-lift ke-then">
      <svg viewBox="0 0 240 200" className="mx-auto block w-full max-w-[300px]" role="img" aria-label={`Đồng hồ lò: chặng ${k}/6, ${CONG_DOAN[k - 1]}`}>
        <circle cx="120" cy="120" r="112" fill="#2b1f19" />
        {seg.map((d, i) => (
          <path key={d} d={d} fill="none" strokeWidth="14" className={i + 1 === k ? "ho-hap" : undefined} stroke={i + 1 < k ? "#a34a23" : i + 1 === k ? "#ee8a43" : "#4a3a30"} />
        ))}
        <g stroke="#1e1511" strokeWidth="3"><path d="M17.07 104.79 L33.06 107.6" /><path d="M53.15 40.34 L63.43 52.6" /><path d="M120 12 V28" /><path d="M186.85 40.34 L176.57 52.6" /><path d="M222.93 104.79 L206.94 107.6" /></g>
        <g className="kim" style={{ ["--kim" as string]: `${angle}deg` }}><path d="M120 120 L120 42" stroke="#fffdf8" strokeWidth="4" strokeLinecap="round" /></g>
        <circle cx="120" cy="120" r="10" fill="#c9a24e" /><circle cx="120" cy="120" r="4" fill="#1e1511" />
        <text x="120" y="160" textAnchor="middle" fill="#f3dc9f" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26 }}>{k}/6</text>
      </svg>
      <p className="mt-1.5 text-center font-serif text-[1.25rem] font-bold leading-snug text-[#fffdf8] giong-ke">{hoaDau(CONG_DOAN[k - 1]!.toLowerCase())}: {q.title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-center text-sm text-[#e6d9bf]">
        {QUOTE_STATUS[q.status].label} · {formatNumber(q.quantity)} sp · {q.bids} chào giá{q.next ? `. Việc của bạn: ${q.next.label.toLowerCase()}.` : "."}
      </p>
      <div className="mt-4 flex justify-center">
        <Link href={`/account/quotes/${q.code}`} className="inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-[#f3dc9f] px-5 font-semibold text-[#1e1511] hover:bg-[#f7e6b8]">Vào phòng báo giá <ArrowGo className="size-4" /></Link>
      </div>
    </div>
  );
}

/* ================= Việc chờ bạn ================= */

export type Task = { key: string; href: string; title: string; detail: string; urgent: boolean; code?: string };

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2.5">
      {tasks.map((t, i) => (
        <li key={t.key} className="gan-vien" style={{ animationDelay: `${i * 85}ms` }}>
          <Link href={t.href} className="viec">
            <span className={cn("tile grid size-11 shrink-0 place-items-center text-giay", t.urgent ? "tile-dat" : "tile-ngoc")} aria-hidden>
              <StatusMark mark={t.urgent ? "diamond" : "dot"} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-snug">{t.title}</span>
              <span className="block truncate text-sm text-tro">{t.detail}</span>
            </span>
            {t.code && <span className="code hidden shrink-0 text-[13px] text-tro sm:inline">{t.code}</span>}
            <ArrowGo className="shrink-0 text-tro" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ================= Lịch nặn gốm ================= */

const VISIT_STATUS: Record<BookingStatus, { label: string; mark: "dot" | "diamond" | "square" | "ring"; tone: string }> = {
  PENDING: { label: "Chờ xưởng xác nhận", mark: "diamond", tone: "text-vangrom-dam" },
  CONFIRMED: { label: "Đã xác nhận", mark: "dot", tone: "text-ngoc" },
  COMPLETED: { label: "Đã diễn ra", mark: "square", tone: "text-tro" },
  DECLINED: { label: "Xưởng từ chối", mark: "ring", tone: "text-tro" },
  CANCELLED: { label: "Đã hủy", mark: "ring", tone: "text-tro" },
};

export type VisitBooking = {
  code: string; visitDate: Date; slot: string; guests: number; totalVnd: number; status: BookingStatus;
  note?: string | null; artisanNote?: string | null;
  artisan: { workshopName: string; slug: string; address: string; latitude: number; longitude: number; phone?: string | null };
};

export function VisitLinks({ b, className }: { b: VisitBooking; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-x-1 gap-y-1", className)}>
      <a href={`/api/bookings/${b.code}/ics`} download className="inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-2.5 text-sm font-semibold text-lam underline decoration-current/30 underline-offset-4 hover:decoration-current">
        <CalendarPlus className="size-4" aria-hidden /> Thêm vào lịch
      </a>
      <a href={directionsUrl(b.artisan.latitude, b.artisan.longitude)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-2.5 text-sm font-semibold text-lam underline decoration-current/30 underline-offset-4 hover:decoration-current">
        <Navigation className="size-4" aria-hidden /> Chỉ đường
      </a>
    </div>
  );
}

/** Một buổi nặn gốm: cuống ngày như vé đò bên trái, xưởng và giờ bên phải. */
export function VisitCard({ b, actions, past = false }: { b: VisitBooking; actions?: ReactNode; past?: boolean }) {
  const s = VISIT_STATUS[b.status];
  const live = !past && (b.status === "PENDING" || b.status === "CONFIRMED");
  return (
    <article className={cn("grid grid-cols-[5.5rem_minmax(0,1fr)] overflow-hidden rounded-[10px] border border-vua bg-su shadow-soft sm:grid-cols-[7rem_minmax(0,1fr)]", past && "opacity-90")}>
      <div className={cn("flex flex-col items-center justify-center px-2 py-5 text-center", live ? "tile-lam text-giay" : "bg-nga-dam text-muc/75")}>
        <span className="text-[13px] font-semibold">{dowOf(b.visitDate)}</span>
        <span className="font-display text-[2.4rem] leading-none dau-hieu">{b.visitDate.getUTCDate()}</span>
        <span className="text-[13px] font-semibold">tháng {b.visitDate.getUTCMonth() + 1}</span>
      </div>
      <div className="min-w-0 px-5 py-4">
        <h3 className="font-serif text-[1.25rem] font-bold leading-snug giong-ke">
          <Link href={`/artisans/${b.artisan.slug}`} className="hover:underline">{b.artisan.workshopName}</Link>
        </h3>
        <p className={cn("mt-1 flex flex-wrap items-center gap-x-2 text-[13px] font-semibold", s.tone)}>
          <StatusMark mark={s.mark} /> {s.label}
          <span aria-hidden className="font-normal text-tro">·</span>
          <span className="code font-normal text-tro">{b.code}</span>
        </p>
        <p className="mt-1 text-sm tabular">{slotRange(b.slot)} · {b.guests} khách · {formatVnd(b.totalVnd)}</p>
        <p className="mt-0.5 text-sm text-tro">{b.artisan.address}{b.artisan.phone ? ` · ${b.artisan.phone}` : ""}</p>
        {b.artisanNote && <p className="mt-2 text-sm">Xưởng nhắn: “{b.artisanNote}”</p>}
        {(live || actions) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {live && <VisitLinks b={b} className="-ml-2.5" />}
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}

/** Bàn xoay: bình men lam xoay trên bàn (vòng hoa văn trôi ngang dưới lớp bóng hình trụ, bàn xoay nghiêng phối cảnh). */
export function PotteryWheel({ id, className }: { id: string; className?: string }) {
  const clip = `${id}-vo`, shade = `${id}-bong`, band = `${id}-hoa`;
  const vase = "M106 240 C 88 222, 82 194, 90 170 C 96 152, 110 144, 112 130 C 113 120, 108 112, 106 102 L 154 102 C 152 112, 147 120, 148 130 C 150 144, 164 152, 170 170 C 178 194, 172 222, 154 240 Z";
  return (
    <svg viewBox="0 0 260 290" className={cn("block", className)} aria-hidden>
      <defs>
        <clipPath id={clip}><path d={vase} /></clipPath>
        <linearGradient id={shade} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".32" />
          <stop offset=".28" stopColor="#fff" stopOpacity=".45" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".38" />
        </linearGradient>
        <g id={band}>
          <path d="M0 170 c6 -11 18 -11 20 0 c2 -11 14 -11 20 0" fill="none" stroke="#1f4e9a" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M10 204 q10 -20 20 0 q-10 7 -20 0z" fill="#1f4e9a" opacity=".9" />
          <circle cx="20" cy="186" r="2.4" fill="#1f4e9a" />
        </g>
      </defs>
      <ellipse cx="130" cy="262" rx="112" ry="16" fill="#1c1a17" opacity=".14" />
      <g transform="translate(130 246) scale(1 .26)">
        <g className="quay-nhanh">
          <circle r="112" fill="#5a3323" />
          <circle r="98" fill="none" stroke="#7a4632" strokeWidth="5" />
          <path d="M0 -110 V110 M-110 0 H110 M-78 -78 L78 78 M-78 78 L78 -78" stroke="#ecdfc6" strokeWidth="5" opacity=".7" />
        </g>
      </g>
      <g clipPath={`url(#${clip})`}>
        <rect x="80" y="96" width="100" height="150" fill="#fffdf8" />
        <g className="troi-hoa">
          {[50, 90, 130, 170, 210].map((x) => <use key={x} href={`#${band}`} x={x} />)}
        </g>
        <rect x="80" y="118" width="100" height="3" fill="#1f4e9a" />
        <rect x="80" y="125" width="100" height="1.5" fill="#1f4e9a" />
        <rect x="80" y="226" width="100" height="3" fill="#1f4e9a" />
        <rect x="80" y="96" width="100" height="150" fill={`url(#${shade})`} />
      </g>
      <path d={vase} fill="none" stroke="#163a73" strokeWidth="1.2" opacity=".35" />
    </svg>
  );
}

export type OpenWorkshop = { slug: string; workshopName: string; artisanName: string; artisanTitle: string; openLabel: string; isOpenNow: boolean };

export function OpenWorkshopRow({ w, delay = 0 }: { w: OpenWorkshop; delay?: number }) {
  return (
    <li className="viec gan-vien justify-between" style={{ animationDelay: `${delay}ms` }}>
      <span className="min-w-0">
        <span className="block font-serif text-[1.15rem] font-bold giong-ke">{w.workshopName}</span>
        <span className="block text-sm text-tro">{w.artisanTitle} {w.artisanName}</span>
        <span className={cn("mt-1.5 inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-xs font-semibold", w.isOpenNow ? "bg-ngoc-nhat text-ngoc" : "bg-tro/10 text-tro")}>
          <StatusMark mark={w.isOpenNow ? "dot" : "ring"} /> {w.openLabel}
        </span>
      </span>
      <Link href={`/artisans/${w.slug}#dat-lich`} className="inline-flex min-h-11 shrink-0 items-center rounded-[6px] bg-lam px-4 text-[15px] font-semibold text-on shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-2px_0_rgb(0_0_0/0.12)] hover:bg-lam-sang">Đặt buổi nặn</Link>
    </li>
  );
}

/* ================= Kệ sơn then ================= */

export type ShelfItem = { key: string; href: string; name: string; image: MediaImage | null | undefined; note?: string; sub?: string; extra?: ReactNode };

/**
 * Kệ sơn then viền chỉ vàng: tác phẩm có ảnh tách nền đứng thẳng trên kệ với bóng tiếp đất, còn lại là khung ảnh.
 * Mỗi hàng kệ có tấm ván riêng ngay dưới chân tác phẩm và nhãn tên bên dưới ván (ván vẽ bằng nền lặp của .ke-hang),
 * nên kệ nhiều tầng trên điện thoại vẫn đọc đúng món nào tên nấy.
 */
export function Shelf({ items, sizes = "(max-width: 768px) 30vw, 220px" }: { items: ShelfItem[]; sizes?: string }) {
  return (
    <div className="ke-then overflow-hidden rounded-[14px]">
      <ul className="ke-hang grid grid-cols-2 gap-x-5 px-4 pb-1 pt-7 sm:grid-cols-3 sm:px-8 lg:grid-cols-4">
        {items.map((p, i) => {
          const cut = cutoutFor(p.image?.src);
          return (
            <li key={p.key} className="gan-vien relative flex min-w-0 flex-col" style={{ animationDelay: `${Math.min(i, 8) * 110}ms` }}>
              <div className="relative flex h-[var(--anh)] items-end justify-center">
                <Link href={p.href} tabIndex={-1} aria-hidden className="mon relative flex h-full w-full items-end justify-center">
                  {cut ? (
                    <span className="relative block h-[calc(100%-14px)] w-full">
                      <Image src={cut} alt="" fill sizes={sizes} className="object-contain object-bottom drop-shadow-[0_10px_8px_rgb(0_0_0/0.35)]" />
                    </span>
                  ) : (
                    <span className="block aspect-[4/5] h-[calc(100%-22px)] max-w-full rounded-[4px] bg-[#fbf4e4] p-[6px] shadow-[0_10px_18px_-10px_rgb(0_0_0/0.8)]">
                      <VImage image={p.image} ratio="auto" sizes={sizes} className="h-full rounded-[2px]" />
                    </span>
                  )}
                </Link>
                <span aria-hidden className="pointer-events-none absolute -bottom-1 left-1/2 h-2.5 w-[70%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_0_0/0.5),transparent)]" />
                {p.extra}
              </div>
              <div className="h-[var(--van)]" aria-hidden />
              <div className="h-[var(--chu)] overflow-hidden pt-2.5 text-center">
                <Link href={p.href} className="line-clamp-2 font-serif text-[1.05rem] font-bold leading-snug text-[#fffdf8] hover:underline giong-ke">{p.name}</Link>
                {p.note && <span className="mt-0.5 block text-sm text-[#f3dc9f]">{p.note}</span>}
                {p.sub && <span className="mt-0.5 block truncate text-[13px] text-[#ddd0b8]">{p.sub}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ================= Hộ chiếu làng nghề ================= */

/** Một con triện son: mã lô và tên xưởng, bấm để mở trang truy xuất của lô. */
export function Stamp({ t, delay = 0 }: { t: TracedBatch; delay?: number }) {
  return (
    <Link href={`/trace/${t.code}`} className="trien dong-dau" style={{ animationDelay: `${delay}ms` }} title={t.product?.name ?? t.title}>
      <span className="code text-xs font-semibold">{t.code}</span>
      <span className="font-display text-xs font-extrabold uppercase leading-tight dau-hieu">{t.artisan.workshopName}</span>
    </Link>
  );
}

/** Sổ hộ chiếu mở đôi: trang trái lời dẫn, trang phải những con triện đã đóng. */
export function Passport({ left, stamps, empty }: { left: ReactNode; stamps: TracedBatch[]; empty: number }) {
  return (
    <div className="[perspective:1600px]">
      <div className="so-ho-chieu grid grid-cols-1 overflow-hidden rounded-[12px] shadow-lift md:grid-cols-2">
        <div className="p-7 md:origin-right md:[transform:rotateY(4deg)] md:shadow-[inset_-24px_0_30px_-24px_rgb(60_40_20/0.5)]">{left}</div>
        <div className="trang-phai grid grid-cols-3 content-start gap-4 p-7 md:origin-left md:[transform:rotateY(-4deg)] md:shadow-[inset_24px_0_30px_-24px_rgb(60_40_20/0.45)]">
          {stamps.map((t, i) => <Stamp key={t.code} t={t} delay={i * 220} />)}
          {Array.from({ length: empty }, (_, i) => (
            <span key={i} className="trien trien-trong text-center text-xs" aria-hidden>chỗ cho triện tiếp theo</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Giấy truy xuất đầy đủ của một lô (trang Hộ chiếu). */
export function TraceCard({ t }: { t: TracedBatch }) {
  return (
    <article className="viec group relative grid min-w-0 grid-cols-1 items-stretch gap-0 overflow-hidden p-0 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <div className="relative h-44 sm:h-auto">
        <div className="absolute inset-0"><VImage image={t.image} ratio="auto" sizes="(max-width: 640px) 100vw, 160px" className="h-full" imgClassName="transition-transform duration-300 group-hover:scale-[1.03]" /></div>
      </div>
      <div className="min-w-0 p-5">
        <h3 className="font-serif text-[1.25rem] font-bold leading-snug giong-ke">
          <Link href={`/trace/${t.code}`} className="phu-ca after:absolute after:inset-0 focus-visible:outline-none">{t.product?.name ?? t.title}</Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-tro">
          <span className="code text-sm text-lam">{t.code}</span><span aria-hidden>·</span><span>{GLAZES[t.glaze].label}</span>
        </p>
        <p className="mt-1 text-sm text-tro">
          {t.artisan.workshopName}
          {t.artisan.verificationStatus === "APPROVED" && (
            <span className="ml-1.5 inline-flex items-center gap-1 align-middle text-[13px] font-semibold text-doson"><ShieldCheck className="size-3.5" aria-hidden /> Hộ nghề xác thực</span>
          )}
        </p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div><dt className="text-[13px] text-tro">Công đoạn</dt><dd className="mt-0.5 font-semibold tabular">{t.stages} mốc</dd></div>
          <div><dt className="text-[13px] text-tro">Nung</dt><dd className="mt-0.5 font-semibold tabular">{formatNumber(t.peakTempC)}°C</dd></div>
          <div><dt className="text-[13px] text-tro">{t.locked ? "Khóa nhật ký" : "Nhật ký"}</dt><dd className="mt-0.5 font-semibold">{t.locked && t.lockedAt ? formatDate(t.lockedAt) : "đang ghi"}</dd></div>
        </dl>
        <p className="mt-3 text-[13px] text-tro">Bạn đã quét {t.scans > 1 ? `${t.scans} lần, lần cuối ` : ""}{timeAgo(t.lastScan)}</p>
      </div>
    </article>
  );
}

/* ================= Thư giấy dó ================= */

export type Letter = { id: string; title: string; body: string; link: string | null; readAt: Date | null; createdAt: Date };

/** Một lá thư trên giấy dó; thư chưa đọc mang dấu son "Mới". Mở thư thì được đánh dấu đã đọc. */
export function LetterCard({ n }: { n: Letter }) {
  return (
    <NotificationLink
      id={n.id}
      href={n.link}
      read={!!n.readAt}
      className="viec thu-do relative h-full w-full flex-col items-start gap-2 text-left"
    >
      {!n.readAt && <span className="dau-moi absolute right-3.5 top-3.5"><span aria-hidden>Mới</span><span className="sr-only">Thư chưa đọc</span></span>}
      <span className="muc-do text-[13px]">{timeAgo(n.createdAt)}</span>
      <span className={cn("pr-14 font-serif text-[1.2rem] leading-snug giong-ke", n.readAt ? "font-medium" : "font-bold")}>{n.title}</span>
      <span className="muc-do text-sm">{n.body}</span>
    </NotificationLink>
  );
}

/* ================= Ấn xưởng ================= */

/** Chữ tắt của tên xưởng/tên người: hai chữ cái đầu của hai tiếng cuối ("Gốm Minh Hải" → "MH"). */
export function chuTat(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(-2).map((w) => w.charAt(0)).join("").toUpperCase();
}

/**
 * Ấn xưởng: viên men lam vuông mang chữ tắt của xưởng như con dấu phường hội.
 * faded: xưởng bạn chưa đánh giá – viên còn để mộc (nền ngà, viền đứt).
 */
export function Seal({ name, size = 48, faded = false, className }: { name: string; size?: number; faded?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center font-display font-extrabold uppercase leading-none dau-hieu",
        faded ? "rounded-[6px] border-2 border-dashed border-lam/45 bg-nga-dam text-lam" : "tile tile-lam text-giay",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {chuTat(name)}
    </span>
  );
}

/* ================= Đầu trang của từng điểm dừng ================= */

/**
 * Đầu trang con: một dải trời làng thu nhỏ (mái ngói, lò bầu tỏa khói) với biểu tượng điểm dừng,
 * tiêu đề biển hiệu, lời dẫn giọng kể và các thao tác.
 */
export function LangHead({ icon, title, count, lead, actions, back }: { icon: TramKind; title: string; count?: number; lead?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <header className="lang-scene relative">
      <svg viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 block size-full" aria-hidden>
        <defs>
          <linearGradient id="lang-troi-dau" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="stop-sky-top" />
            <stop offset="1" className="stop-sky-mid" />
          </linearGradient>
        </defs>
        <rect width="1440" height="220" fill="url(#lang-troi-dau)" />
        <g className="lop-sao" fill="#fffdf8">
          <circle className="sao" cx="980" cy="40" r="1.4" /><circle className="sao" cx="1180" cy="70" r="1.2" style={{ animationDelay: "1.2s" }} /><circle className="sao" cx="1340" cy="30" r="1.6" style={{ animationDelay: ".6s" }} />
        </g>
        <path className="f-hill-far" d="M-20 196 C 200 176 420 186 700 180 C 960 174 1200 170 1460 182 V 220 H -20 Z" opacity=".9" />
        <g opacity=".95">
          <path className="f-roof" d="M1012 196 V170 C1012 160 1022 154 1028 150 V120 H1040 V150 C1046 154 1056 160 1056 170 V196 Z" />
          <path className="f-fire lua-lo" d="M1026 196 V186 a8 8 0 0 1 16 0 V196 Z" />
          <circle className="khoi f-smoke" cx="1034" cy="112" r="7" /><circle className="khoi f-smoke" cx="1034" cy="112" r="8" style={{ animationDelay: "2.6s" }} /><circle className="khoi f-smoke" cx="1034" cy="112" r="6" style={{ animationDelay: "5.1s" }} />
          <rect className="f-wall" x="1090" y="168" width="110" height="30" />
          <path className="f-roof" d="M1076 172 L1096 146 H1194 L1214 172 Q1145 165 1076 172 Z" />
          <rect className="f-wall" x="1250" y="172" width="90" height="26" />
          <path className="f-roof" d="M1238 176 L1256 154 H1334 L1352 176 Q1295 170 1238 176 Z" />
          <g className="lop-den"><ellipse cx="1145" cy="160" rx="4" ry="5.5" fill="#d9502e" /><circle cx="1145" cy="160" r="11" fill="#ffb56b" opacity=".3" /><ellipse cx="1295" cy="166" rx="4" ry="5.5" fill="#d9502e" /><circle cx="1295" cy="166" r="11" fill="#ffb56b" opacity=".3" /></g>
        </g>
      </svg>
      <div className="relative mx-auto max-w-7xl px-4 pb-9 pt-8 md:px-6 md:pb-11 md:pt-10">
        {back && <div className="mb-3">{back}</div>}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="flex min-w-0 max-w-3xl items-start gap-4">
            <span className="tile tile-lam hidden size-16 shrink-0 place-items-center text-giay sm:grid"><TramIcon kind={icon} size={40} /></span>
            <div className="min-w-0">
              <h1 className="font-display text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.02] text-[var(--hero-ink)] dau-hieu">
                {count ? <span className="text-lam">{count} </span> : null}{title}
              </h1>
              {lead && <div className="mt-2.5 max-w-2xl font-serif text-[1.15rem] leading-[1.5] text-[var(--hero-soft)] giong-ke md:text-[1.25rem]">{lead}</div>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
        </div>
      </div>
      <HoiVan id={`lang-hoi-van-${icon}`} className="relative text-lam opacity-30" />
    </header>
  );
}

/** Khối trống mời hành động (không nói "không có dữ liệu"). */
export function Invite({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="viec max-w-2xl flex-col items-start gap-2 p-7">
      <h2 className="font-serif text-[1.5rem] font-bold leading-snug giong-ke">{title}</h2>
      <div className="text-tro">{children}</div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
