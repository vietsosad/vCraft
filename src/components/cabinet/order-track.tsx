import type { QuoteStatus } from "@prisma/client";
import { QUOTE_STATUS } from "@/lib/constants";
import { ORDER_LEGS, legIndex } from "@/lib/order-legs";
import { cn } from "@/lib/cn";

/** Năm chặng của đơn: ô đặc là đã qua, ô gạch chéo là đang ở chặng đó. Hình dạng mang nghĩa, không chỉ màu. */
export function OrderTrack({ status, labels = true, className }: { status: QuoteStatus; labels?: boolean; className?: string }) {
  const idx = legIndex(status);
  if (idx === -2) return <p className={cn("text-sm text-tro line-through decoration-tro/50", className)}>Đơn đã hủy</p>;
  const delivered = status === "DELIVERED";
  return (
    <ol className={cn("grid grid-cols-5 gap-1", className)} aria-label={`Tiến độ đơn: ${QUOTE_STATUS[status].label}`}>
      {ORDER_LEGS.map((l, i) => {
        const done = delivered || i < idx;
        const current = !delivered && i === idx;
        return (
          <li key={l.status} className="min-w-0" aria-current={current ? "step" : undefined}>
            <span
              className={cn(
                "block h-2.5 rounded-[2px]",
                done && "bg-lam",
                current && "bg-[repeating-linear-gradient(135deg,var(--color-lam)_0_3px,transparent_3px_6px)] shadow-[inset_0_0_0_1px_var(--color-lam)]",
                !done && !current && "bg-muc/10",
              )}
            />
            {labels && <span className={cn("mt-1.5 block truncate text-[11.5px] leading-tight", current ? "font-semibold text-muc" : done ? "text-muc/80" : "text-tro")}>{l.label}</span>}
          </li>
        );
      })}
    </ol>
  );
}
