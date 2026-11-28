import type { QuoteStatus } from "@prisma/client";
import { QUOTE_STATUS } from "@/lib/constants";
import { ORDER_LEGS, legIndex } from "@/lib/order-legs";
import { cn } from "@/lib/cn";
import { badgePaths, initials } from "./loom";

/**
 * Huy hiệu dệt: chữ cái pixel của xưởng (hoặc của khách) dệt giữa khung răng cưa.
 * Thay cho con triện của khu cũ; con dấu xác thực của Ban quản lý vẫn giữ nguyên ở nơi khác.
 */
export function WovenBadge({
  name,
  size = 56,
  tone = "band",
  faded,
  className,
}: {
  name: string;
  size?: number;
  /** band: màu theo dải đang đứng; ink: màu chữ hiện tại trên nền sáng */
  tone?: "band" | "ink";
  faded?: boolean;
  className?: string;
}) {
  const b = badgePaths(initials(name));
  const fg = tone === "band" ? "var(--band-ink, #fbfaf5)" : "currentColor";
  // mỗi ô sợi phải rộng đúng một số nguyên điểm ảnh, nếu không nét sắc bị làm tròn lệch và chữ trông xô lệch
  const cell = Math.max(1, Math.round(size / b.w));
  return (
    <svg
      viewBox={`0 0 ${b.w} ${b.h}`}
      width={cell * b.w}
      height={cell * b.h}
      role="img"
      aria-label={`Huy hiệu ${name}`}
      shapeRendering="crispEdges"
      className={cn("shrink-0", faded && "opacity-45", className)}
    >
      <path d={b.frame} fill={fg} fillOpacity={0.55} />
      <path d={b.glyph} fill={fg} />
    </svg>
  );
}

/**
 * Tiến độ đơn sỉ như một đoạn vải đang dệt: chặng đã qua dệt kín hoa văn, chặng đang làm dệt nửa,
 * chặng chưa tới chỉ còn sợi dọc. Hình dạng mang nghĩa, không chỉ màu.
 */
export function WeaveTrack({ status, labels = true, className }: { status: QuoteStatus; labels?: boolean; className?: string }) {
  const idx = legIndex(status);
  if (idx === -2) return <p className={cn("text-sm line-through opacity-70", className)}>Đơn đã hủy</p>;
  const delivered = status === "DELIVERED";
  return (
    <ol className={cn("grid grid-cols-5 gap-1", className)} aria-label={`Tiến độ đơn: ${QUOTE_STATUS[status].label}`}>
      {ORDER_LEGS.map((l, i) => {
        const done = delivered || i < idx;
        const now = !delivered && i === idx;
        return (
          <li key={l.status} className="min-w-0" aria-current={now ? "step" : undefined}>
            <span className={cn("warp block", done && "done", now && "now")} />
            {labels && <span className={cn("mt-1.5 block text-xs leading-snug", now ? "font-semibold" : "text-tro")}>{l.label}</span>}
          </li>
        );
      })}
    </ol>
  );
}
