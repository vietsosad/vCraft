import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { RevealText } from "@/components/motion/reveal-text";

type Tone = "terracotta" | "cobalt" | "celadon" | "gold" | "ash" | "ink" | "danger";

const tones: Record<Tone, string> = {
  terracotta: "bg-datnung-nhat text-datnung ring-datnung/25",
  cobalt: "bg-lam-nhat text-lam ring-lam/25",
  celadon: "bg-ngoc-nhat text-ngoc ring-ngoc/30",
  gold: "bg-vangrom/15 text-vangrom-dam ring-vangrom/35",
  ash: "bg-tro/10 text-tro ring-tro/25",
  ink: "bg-muc text-nga ring-muc",
  danger: "bg-doson/10 text-doson ring-doson/30",
};

/**
 * Nhãn trạng thái. Trạng thái được mang bởi cả HÌNH dấu (shape) lẫn màu, để người mù màu
 * vẫn phân biệt: ● đang chạy, ◆ cần xử lý, ■ đã xong, ○ đã đóng.
 */
export function Badge({
  tone = "ash",
  mark,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone | string; mark?: "dot" | "diamond" | "square" | "ring" }) {
  return (
    <span
      data-badge=""
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap",
        tones[(tone as Tone) in tones ? (tone as Tone) : "ash"],
        className,
      )}
      {...props}
    >
      {mark && <StatusMark mark={mark} />}
      {children}
    </span>
  );
}

export function StatusMark({ mark, className }: { mark: "dot" | "diamond" | "square" | "ring"; className?: string }) {
  const shape = {
    dot: "size-[7px] rounded-full bg-current",
    diamond: "size-[7px] rotate-45 rounded-[1px] bg-current",
    square: "size-[7px] rounded-[1px] bg-current",
    ring: "size-[8px] rounded-full border-[1.5px] border-current",
  }[mark];
  return <span aria-hidden className={cn("inline-block shrink-0", shape, className)} />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-card="" className={cn("rounded-[8px] border border-vua bg-su shadow-soft", className)} {...props} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[var(--radius-tile)] bg-nga-sau/80", className)} aria-hidden />;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[8px] border border-dashed border-vua bg-su/60 px-6 py-14 text-center", className)}>
      <div aria-hidden className="mx-auto mb-5 grid w-fit grid-cols-3 gap-[3px] rounded-[6px] bg-vua p-[3px] opacity-90">
        <span className="tile tile-hoavan size-7 rounded-[3px]" />
        <span className="tile tile-ran size-7 rounded-[3px]" />
        <span className="tile tile-lam grid size-7 place-items-center rounded-[3px] text-giay">{icon && <span className="[&_svg]:size-4">{icon}</span>}</span>
      </div>
      <p className="text-lg font-semibold">{title}</p>
      {description && <p className="mx-auto mt-1.5 max-w-md text-[15px] text-tro">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

/** Tiêu đề mục: biển hiệu Phudu, không có dòng kicker phía trên. */
export function SectionHeading({
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {typeof title === "string" ? <RevealText as="h2" text={title} className="title-lg" /> : <h2 className="title-lg">{title}</h2>}
        {description && <p data-reveal style={{ ["--d" as string]: "180ms", ["--rot" as string]: "0deg" }} className="mt-3 max-w-xl text-tro">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Đầu trang trong các khu làm việc: tiêu đề → mô tả ngắn → hành động (chữ theo phạm vi thao tác). */
export function PageHeader({ title, description, actions, className }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="op-h1">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-tro">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Con dấu "Hộ nghề xác thực" – triện son vuông của Ban quản lý. */
export function VerifiedSeal({ className, label = "Hộ nghề xác thực" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-[12px] font-semibold text-doson", className)}
      title="Đã được Ban quản lý làng nghề Bát Tràng xác thực"
    >
      <svg viewBox="0 0 24 24" className="size-6 shrink-0 -rotate-3" aria-hidden>
        <rect x="1.5" y="1.5" width="21" height="21" rx="2.5" fill="currentColor" />
        <rect x="4" y="4" width="16" height="16" rx="1" fill="none" stroke="#fffdf8" strokeWidth="1.1" />
        <path d="m7.6 12.4 2.9 2.9 5.9-6.4" fill="none" stroke="#fffdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  );
}

/** Triện son cỡ lớn – đóng lên chứng nhận lô như con dấu của Ban quản lý làng. */
export function SealStamp({ className, lines = ["ĐÃ XÁC THỰC", "BQL BÁT TRÀNG"] }: { className?: string; lines?: [string, string] }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("size-24 -rotate-6 text-doson drop-shadow-[0_2px_2px_rgb(0_0_0/0.15)]", className)} role="img" aria-label="Con dấu xác thực của Ban quản lý làng nghề Bát Tràng">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="currentColor" opacity="0.94" />
      <rect x="11" y="11" width="78" height="78" rx="3" fill="none" stroke="#fffdf8" strokeWidth="2.2" />
      <path d="M50 22l3.2 6.5 7.1 1-5.1 5 1.2 7.1L50 38.3l-6.4 3.3 1.2-7.1-5.1-5 7.1-1z" fill="#fffdf8" />
      <text x="50" y="60" textAnchor="middle" fill="#fffdf8" fontSize="10.5" fontWeight="800" letterSpacing=".5" style={{ fontFamily: "var(--font-display)" }}>{lines[0]}</text>
      <text x="50" y="75" textAnchor="middle" fill="#fffdf8" fontSize="9" fontWeight="700" style={{ fontFamily: "var(--font-display)" }}>{lines[1]}</text>
    </svg>
  );
}

/**
 * Ô số liệu nền nhẹ: nhãn → số (Be Vietnam Pro, số đều cột) → gợi ý.
 * Màu vai trò chỉ ở vạch trên và con số; ô có tone (việc cần xử lý) thêm nền nhạt của màu đó để nổi hơn ô thường.
 */
export function Stat({ label, value, hint, tone = "plain", className }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "plain" | "lam" | "dat" | "ngoc"; className?: string }) {
  const look = {
    plain: { surface: "bg-su", bar: "before:bg-vua", num: "text-muc" },
    lam: { surface: "bg-lam-nhat", bar: "before:bg-lam", num: "text-lam" },
    dat: { surface: "bg-datnung-nhat", bar: "before:bg-datnung", num: "text-datnung" },
    ngoc: { surface: "bg-ngoc-nhat", bar: "before:bg-ngoc", num: "text-ngoc" },
  }[tone];
  return (
    <div className={cn("relative overflow-hidden rounded-[8px] border border-vua p-5 before:absolute before:inset-x-0 before:top-0 before:h-[3px]", look.surface, look.bar, className)}>
      <p className="text-sm font-medium text-tro">{label}</p>
      <p className={cn("op-stat mt-1.5", look.num)}>{value}</p>
      {hint && <p className="mt-1 text-[13px] leading-snug text-tro">{hint}</p>}
    </div>
  );
}
