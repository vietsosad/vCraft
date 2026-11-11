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
