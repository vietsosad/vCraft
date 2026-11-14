import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Mặt trống đồng Đông Sơn cách điệu: ngôi sao 14 cánh ở tâm, các vành răng cưa, vành chấm,
 * vành chim Lạc bay ngược chiều kim đồng hồ. Vẽ bằng nét để phủ mờ làm nền, xoay chậm theo cuộn.
 */
export function DrumFace({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const star = Array.from({ length: 28 }, (_, i) => {
    const r = i % 2 === 0 ? 46 : 16;
    const a = (i / 28) * Math.PI * 2 - Math.PI / 2;
    return `${(200 + r * Math.cos(a)).toFixed(1)},${(200 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  const ring = (r: number, n: number, len: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const x1 = 200 + r * Math.cos(a);
      const y1 = 200 + r * Math.sin(a);
      const x2 = 200 + (r + len) * Math.cos(a);
      const y2 = 200 + (r + len) * Math.sin(a);
      return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }).join("");
  const dots = (r: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return <circle key={i} cx={(200 + r * Math.cos(a)).toFixed(1)} cy={(200 + r * Math.sin(a)).toFixed(1)} r="2.2" />;
    });
  // Chim Lạc: thân thon, mỏ dài, cánh xòe – 10 con bay theo vòng tròn
  const birds = Array.from({ length: 10 }, (_, i) => {
    const deg = (i / 10) * 360;
    return (
      <g key={i} transform={`rotate(${deg} 200 200) translate(200 58)`}>
        <path d="M-22 0c8-5 18-6 26-3l14-3-12 6c-6 4-16 5-28 0z M-6-3l-8-12M2-3l4-11" />
      </g>
    );
  });
  return (
    <svg viewBox="0 0 400 400" className={cn("pointer-events-none", className)} style={style} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <polygon points={star} fill="currentColor" fillOpacity="0.18" />
      <circle cx="200" cy="200" r="54" />
      <path d={ring(58, 56, 9)} />
      <circle cx="200" cy="200" r="72" />
      <g fill="currentColor" stroke="none">{dots(80, 40)}</g>
      <circle cx="200" cy="200" r="88" />
      <path d={ring(92, 72, 7)} strokeWidth="1.2" />
      <circle cx="200" cy="200" r="104" />
      <circle cx="200" cy="200" r="122" strokeDasharray="2 6" />
      <circle cx="200" cy="200" r="128" />
      {birds}
      <circle cx="200" cy="200" r="168" />
      <path d={ring(172, 96, 8)} strokeWidth="1.1" />
      <circle cx="200" cy="200" r="184" />
      <g fill="currentColor" stroke="none">{dots(191, 64)}</g>
      <circle cx="200" cy="200" r="197" />
    </svg>
  );
}

/** Vạch sóng nước – mây cuộn vẽ tay, tự "đi nét" theo tiến độ cuộn (data-progress → --p). */
export function WaveRule({ className, tone = "lam" }: { className?: string; tone?: "lam" | "datnung" }) {
  return (
    <div data-progress className={cn("draw-on-scroll", tone === "lam" ? "text-lam" : "text-datnung", className)} aria-hidden>
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="h-8 w-full" fill="none" stroke="currentColor" strokeLinecap="round">
        <path pathLength={1} strokeWidth="1.8" d="M0 26 C 50 6, 100 6, 150 26 S 250 46, 300 26 S 400 6, 450 26 S 550 46, 600 26 S 700 6, 750 26 S 850 46, 900 26 S 1000 6, 1050 26 S 1150 46, 1200 26" />
        <path pathLength={1} strokeWidth="1" strokeOpacity="0.55" d="M0 34 C 50 18, 100 18, 150 34 S 250 50, 300 34 S 400 18, 450 34 S 550 50, 600 34 S 700 18, 750 34 S 850 50, 900 34 S 1000 18, 1050 34 S 1150 50, 1200 34" />
      </svg>
    </div>
  );
}

/** Dải chữ chạy: tên các làng gốm Việt Nam xen viên men nhỏ. Dừng khi rê chuột, tắt khi giảm chuyển động. */
export function VillageMarquee({ items, className }: { items: string[]; className?: string }) {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-7 font-display text-[clamp(1.8rem,4vw,3.4rem)] leading-none">{t}</span>
          <span className={cn("size-4 shrink-0 rotate-45 rounded-[3px]", ["bg-lam", "bg-datnung", "bg-ngoc-sang", "bg-vangrom"][i % 4])} />
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="marquee">{row("a")}{row("b")}</div>
    </div>
  );
}

/**
 * Thuyền nan sông Hồng: thân cong, mui cót vòm, cột buồm và cánh buồm chiếu có nẹp tre –
 * dáng những con thuyền neo ở bến sông trong các tấm ảnh màu đầu thế kỷ XX.
 */
export function Sampan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M78 96V8" />
      <path d="M82 14 128 27l-6 50-40 6z" fill="currentColor" fillOpacity=".16" />
      <path d="m82 31 43 6M82 47l42 6M82 63l41 6" strokeWidth="1.3" />
      <path d="M34 93c2-16 12-25 26-25s22 9 24 25" fill="currentColor" fillOpacity=".12" />
      <path d="M45 91c1-9 7-15 15-15s14 6 15 15" strokeWidth="1.3" />
      <path d="M8 88c14 6 30 8 50 8h46c20 0 36-4 48-12-6 17-22 27-44 27H50C30 111 14 103 8 88z" fill="currentColor" fillOpacity=".24" />
      <path d="m24 84-15 27" />
    </svg>
  );
}

/** Trăng khuyết cho chặng đêm của hành trình. */
export function Crescent({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <path d="M40 6a26 26 0 1 0 14 34A21 21 0 0 1 40 6z" fill="currentColor" />
    </svg>
  );
}

/**
 * Một lớp sóng nước lặp vô hạn (chu kỳ 240px), trôi liên tục bằng CSS (.river-flow).
 * Xếp ba lớp với biên độ, độ mờ và tốc độ khác nhau để tạo chiều sâu mặt sông.
 */
export function WaveLayer({ className, amplitude = 10, strokeWidth = 2, duration = 18 }: { className?: string; amplitude?: number; strokeWidth?: number; duration?: number }) {
  const id = useId().replace(/:/g, "");
  const a = amplitude;
  return (
    <div className={cn("overflow-hidden", className)} aria-hidden>
      <div className="river-flow h-full w-[calc(100%+480px)]" style={{ ["--river-s" as string]: `${duration}s` }}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <pattern id={id} width="240" height="48" patternUnits="userSpaceOnUse">
              <path d={`M0 24 C 40 ${24 - a}, 80 ${24 - a}, 120 24 S 200 ${24 + a}, 240 24`} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
            </pattern>
          </defs>
          <rect width="100%" height="48" fill={`url(#${id})`} />
        </svg>
      </div>
    </div>
  );
}
