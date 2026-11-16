import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Đồ đồng và chi tiết gỗ của tủ chè. Không dùng hook – dùng được trong cả server lẫn client component.
 * Bộ lọc mực son khai báo một lần trong <CabinetDefs/> (đặt trong khung khu).
 */

/** Định nghĩa dùng chung: bộ lọc mực son loang cho con triện. */
export function CabinetDefs() {
  return (
    <svg width="0" height="0" aria-hidden focusable="false" style={{ position: "absolute" }}>
      <defs>
        {/* Mực son in tay: mép hơi nhòe, lòng nét có chỗ ăn mực không đều */}
        <filter id="vc-ink" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.85" result="holes" />
          <feComposite in="d" in2="holes" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/** Quai: đế và vòng treo vẽ bằng chỉ vàng (nét phẳng như vẽ vàng sơn mài) – vòng đung đưa khi rê chuột lên mặt ngăn. */
export function Pull({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 24" className={cn("h-[18px] w-[21px]", className)} aria-hidden focusable="false">
      <rect x="8.6" y="1.6" width="10.8" height="5.8" rx="1.6" fill="var(--color-then)" stroke="var(--color-chi)" strokeWidth="1.2" />
      <g className="pull-ring">
        <path d="M14 5 C 6.5 5 6.5 21.5 14 21.5 C 21.5 21.5 21.5 5 14 5 Z" fill="none" stroke="var(--color-chi)" strokeWidth="2" />
      </g>
    </svg>
  );
}

/** Khung tên: thẻ giấy cài trong khung sơn then viền chỉ vàng – nhãn của mỗi ngăn. */
export function BrassLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("brass-label", className)}>
      <span>{children}</span>
    </span>
  );
}

/** Dấu son đếm việc đang chờ (đặt ở góc mặt ngăn). */
export function SealCount({ value, label }: { value: number; label: string }) {
  if (value <= 0) return null;
  return (
    <span className="seal-count" aria-label={label}>
      {value > 9 ? "9+" : value}
    </span>
  );
}

/**
 * Con triện của một xưởng: khung vuông hai nét, hai chữ khắc, mực son loang.
 * `faded` cho dấu mờ (xưởng chờ đóng dấu đánh giá).
 */
export function WorkshopSeal({
  glyphs,
  label,
  size = 64,
  faded,
  className,
  style,
}: {
  glyphs: string;
  label: string;
  size?: number;
  faded?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const two = glyphs.slice(0, 2);
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={cn("shrink-0 text-[var(--seal-ink)]", faded && "opacity-50", className)}
      style={style}
    >
      <g filter="url(#vc-ink)">
        <rect x="4" y="4" width="56" height="56" rx="8" fill="none" stroke="currentColor" strokeWidth="3.4" />
        <rect x="9.5" y="9.5" width="45" height="45" rx="4" fill="none" stroke="currentColor" strokeWidth="1.2" />
        {two.length === 2 ? (
          <>
            <text x="32" y="30.5" textAnchor="middle" fill="currentColor" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19 }}>{two[0]}</text>
            <text x="32" y="49" textAnchor="middle" fill="currentColor" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19 }}>{two[1]}</text>
          </>
        ) : (
          <text x="32" y="41" textAnchor="middle" fill="currentColor" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26 }}>{two}</text>
        )}
      </g>
    </svg>
  );
}

/** Chân quỳ cong ở hai đầu tủ, giữa là diềm hồi văn. */
export function CabinetBase({ className }: { className?: string }) {
  const Leg = ({ flip }: { flip?: boolean }) => (
    <svg viewBox="0 0 60 44" className={cn("h-11 w-[60px] shrink-0", flip && "-scale-x-100")} aria-hidden focusable="false">
      <path d="M0 0 H60 V8 H40 C 30 8 26 14 24 22 C 22 31 18 38 10 40 L 8 44 H2 L 3 38 C 6 30 6 18 0 12 Z" fill="var(--color-then)" />
      <path d="M40 8.5 C 30 8.5 26.5 14.5 24.5 22.5" fill="none" stroke="var(--color-chi)" strokeOpacity="0.7" strokeWidth="1" />
      <path d="M0 0.5 H60" stroke="var(--color-chi)" strokeOpacity="0.5" strokeWidth="1" />
    </svg>
  );
  return (
    <div className={cn("flex items-start", className)} aria-hidden>
      <Leg />
      <div className="lacquer relative h-[18px] flex-1 rounded-b-[3px] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-chi)_50%,transparent),0_14px_18px_-14px_rgb(20_12_8/0.7)]">
        <div className="hoi-van flip absolute inset-x-4 top-[3px] opacity-60" />
      </div>
      <Leg flip />
    </div>
  );
}

/** Cặp cánh tủ phủ một ngăn (chỉ hiện khi tủ đang mở lần đầu trong phiên). */
export function Doors({ left, right, delay = 0 }: { left: string; right: string; delay?: number }) {
  return (
    <span className="cab-door" aria-hidden style={{ ["--d" as string]: `${delay}ms` }}>
      <i className={left} />
      <i className={right} />
    </span>
  );
}
